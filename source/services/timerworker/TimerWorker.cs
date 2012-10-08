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
                    foreach (var timer in timers)
                    {
                        bool scheduleNext = false;

                        try
                        {
                            // try to lock the current timer
                            if (timer.LockedBy != null && timer.LockedBy != Me)
                                continue;
                            timer.LockedBy = Me;
                            timer.LastModified = DateTime.UtcNow;
                            SuggestionsContext.SaveChanges();

                            // verify the lock has been acquired
                            if (!SuggestionsContext.Timers.Any(t => t.ID == timer.ID && t.LockedBy == Me))
                                continue;

                            // make sure we get fresh database contexts to avoid EF caching stale data
                            var UserContext = Storage.NewUserContext;

                            var timerItem = new Item() { ID = Guid.NewGuid(), Name = "Timer:" + timer.WorkflowType };
                            WorkflowHost.WorkflowHost.StartWorkflow(UserContext, SuggestionsContext, timer.WorkflowType, timerItem, null);
                            
                            // schedule the next iteration 
                            scheduleNext = true;
                        }
                        catch (Exception ex)
                        {
                            TraceLog.TraceException("Timer processing failed for timer " + timer.WorkflowType, ex);
                        }
                        finally
                        {
                            bool deleteTimer = false;
                            
                            // schedule next iteration if applicable
                            if (scheduleNext)
                            {
                                if (timer.Cadence > 0)
                                    timer.NextRun = now.AddSeconds(timer.Cadence).Truncate(TimeSpan.FromSeconds(timer.Cadence));
                                else
                                    deleteTimer = true;
                            }

                            // unlock the timer instance
                            timer.LockedBy = null;

                            // remove the timer if there is no cadence
                            if (deleteTimer)
                                SuggestionsContext.Timers.Remove(timer);

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
