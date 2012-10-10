using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading;
using BuiltSteady.Product.ServerEntities;
using BuiltSteady.Product.ServiceHost;
using BuiltSteady.Product.Shared.Entities;

namespace BuiltSteady.Product.TimerWorker
{
    public class TimerWorker : IWorker
    {
        public static string Me
        {
            get { return String.Concat(Environment.MachineName.ToLower(), "-", Thread.CurrentThread.ManagedThreadId.ToString()); }
        }

        private int? timeout;
        public int Timeout 
        { 
            get 
            {
                if (!timeout.HasValue)
                {
                    timeout = ConfigurationSettings.GetAsNullableInt(HostEnvironment.TimerWorkerTimeoutConfigKey);
                    if (timeout == null)
                        timeout =  5 * 60 * 1000;  // default to 5 minutes
                    else
                        timeout *= 1000;  // convert to ms
                }
                return timeout.Value;
            }
        }

        public void Start()
        {
            // run an infinite loop doing the following:
            //   get all the timers that are past due
            //   process each of the timers
            //     set up the next iteration for timers with a cadence
            //   sleep for the timeout period
            Guid lastOperationID = Guid.Empty;
            while (true)
            {
                var SuggestionsContext = Storage.NewSuggestionsContext;

                try
                {
                    DateTime now = DateTime.UtcNow;
                    var timers = SuggestionsContext.Timers.Where(t => t.NextRun < now).ToList();

                    // process timers that are now past due
                    BuiltSteady.Product.ServerEntities.Timer currentTimer = null;
                    foreach (var timer in timers)
                    {
                        bool scheduleNext = false;
                        currentTimer = timer;

                        try
                        {
                            // try to lock the current timer
                            if (currentTimer.LockedBy != null && currentTimer.LockedBy != Me)
                                continue;
                            currentTimer.LockedBy = Me;
                            currentTimer.LastModified = DateTime.UtcNow;
                            SuggestionsContext.SaveChanges();

                            // verify the lock has been acquired using a different context to avoid EF caching layer
                            SuggestionsContext = Storage.NewSuggestionsContext;
                            if (!SuggestionsContext.Timers.Any(t => t.ID == currentTimer.ID && t.LockedBy == Me))
                                continue;
                            
                            // refresh the timer from the new context
                            currentTimer = SuggestionsContext.Timers.FirstOrDefault(t => t.ID == currentTimer.ID && t.LockedBy == Me);
                            if (currentTimer == null)
                                continue;

                            // make sure we get fresh database contexts to avoid EF caching stale data
                            var UserContext = Storage.NewUserContext;

                            var timerItem = new Item() { ID = Guid.NewGuid(), Name = "Timer:" + currentTimer.WorkflowType };
                            WorkflowHost.WorkflowHost.StartWorkflow(UserContext, SuggestionsContext, currentTimer.WorkflowType, timerItem, null);
                            
                            // schedule the next iteration 
                            scheduleNext = true;
                        }
                        catch (Exception ex)
                        {
                            TraceLog.TraceException("Timer processing failed for timer " + currentTimer.WorkflowType, ex);
                        }
                        finally
                        {
                            bool deleteTimer = false;
                            
                            // schedule next iteration if applicable
                            if (scheduleNext)
                            {
                                if (currentTimer.Cadence > 0)
                                    currentTimer.NextRun = now.AddSeconds(currentTimer.Cadence).Truncate(TimeSpan.FromSeconds(currentTimer.Cadence));
                                else
                                    deleteTimer = true;
                            }

                            // unlock the timer instance
                            currentTimer.LockedBy = null;

                            // remove the timer if there is no cadence
                            if (deleteTimer)
                                SuggestionsContext.Timers.Remove(currentTimer);

                            // save all changes
                            SuggestionsContext.SaveChanges();
                        }
                    }
                }
                catch (Exception ex)
                {
                    TraceLog.TraceException("Timer processing failed", ex);
                }

                // sleep for the timeout period
                Thread.Sleep(Timeout);
            }
        }
    }
}
