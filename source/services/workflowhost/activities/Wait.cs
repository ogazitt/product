using System;
using System.Linq;
using Newtonsoft.Json.Linq;
using BuiltSteady.Product.ServerEntities;
using BuiltSteady.Product.ServiceHost;
using BuiltSteady.Product.Shared.Entities;

namespace BuiltSteady.Product.WorkflowHost.Activities
{
    public class Wait : WorkflowActivity
    {
        public class ActivityParameters
        {
            public const string Until = "Until";
        }

        public class WaitStates
        {
            public const string Waiting = "Waiting";
            public const string Done = "Done";
        }

        public override Func<WorkflowInstance, ServerEntity, object, Status> Function
        {
            get
            {
                return ((workflowInstance, entity, data) =>
                {
                    // this activity can only run in the context of Azure
                    if (!HostEnvironment.IsAzure)
                        return Status.Error;

                    // check to see if the wait period is done
                    var waitState = GetInstanceData(workflowInstance, ActivityVariables.WaitState);
                    if (waitState == WaitStates.Waiting)
                    {
                        // store the new wait status and return "complete" for activity
                        StoreInstanceData(workflowInstance, ActivityVariables.WaitState, WaitStates.Done);
                        return Status.Complete;
                    }

                    User user = entity as User;
                    if (user == null)
                    {
                        TraceLog.TraceError("Entity is not a User");
                        return Status.Error;
                    }

                    string until = null; 
                    if (InputParameters.TryGetValue(ActivityParameters.Until, out until) == false)
                    {
                        TraceLog.TraceError("Could not find Until argument");
                        return Status.Error;
                    }

                    // check for a valid datetime
                    DateTime dateTime;
                    if (String.IsNullOrEmpty(until) || DateTime.TryParse(until, out dateTime) == false)
                    {
                        TraceLog.TraceError(String.Format("Could not convert {0} to a valid DateTime", until));
                        return Status.Error;
                    }

                    try
                    {
                        // find the operation ID for the Create User operation
                        var op = UserContext.Operations.FirstOrDefault(o => 
                            o.EntityType == typeof(User).Name && 
                            o.EntityID == user.ID && 
                            o.OperationType == "POST");
                        if (op == null)
                            return Status.Error;

                        // store user information from Facebook in UserProfile
                        UserProfile userProfile = UserContext.ClientFolder.GetUserProfile(user);
                        if (userProfile == null)
                            return Status.Error;

                        // get offset of user's timezone from UTC
                        var tzinfo = TimeZoneInfo.FindSystemTimeZoneById(userProfile.Timezone);
                        var utcOffset = tzinfo.GetUtcOffset(DateTime.UtcNow);

                        // compute wait TimeSpan
                        DateTime target = DateTime.UtcNow.Date + dateTime.TimeOfDay;
                        TimeSpan wait = target - DateTime.UtcNow;
                        wait -= utcOffset;  // compute the wait interval relative to user's timezone

                        // queue up a message which will become visible after the timespan expires
                        MessageQueue.EnqueueMessage(op.ID, wait);

                        // store the new wait state and return Pending for activity state
                        StoreInstanceData(workflowInstance, ActivityVariables.WaitState, WaitStates.Waiting);
                        return Status.Pending;
                    }
                    catch (Exception ex)
                    {
                        TraceLog.TraceException("Processing failed", ex);
                        return Status.Error;
                    }
                });
            }
        }
    }
}
