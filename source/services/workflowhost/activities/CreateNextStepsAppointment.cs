using System;
using BuiltSteady.Product.ServerEntities;
using BuiltSteady.Product.ServiceHost;

namespace BuiltSteady.Product.WorkflowHost.Activities
{
    public class CreateNextStepsAppointment : WorkflowActivity
    {
        public override Func<WorkflowInstance, ServerEntity, object, Status> Function
        {
            get
            {
                return ((workflowInstance, entity, data) =>
                {
                    User user = entity as User;
                    if (user == null)
                    {
                        TraceLog.TraceError("Entity is not a User");
                        return Status.Error;
                    }

                    user = UserContext.GetUser(user.ID, true);
                    if (user == null)
                    {
                        TraceLog.TraceError("User not found");
                        return Status.Error;
                    }

                    try
                    {
                        // create the next steps appointment with the steps data
                        GoogleClient gc = new GoogleClient(user, UserContext);
                        gc.RefreshAccessToken();
                        if (gc.AddNextStepsEvent(null) == false)
                            return Status.Error;
                    }
                    catch (Exception ex)
                    {
                        TraceLog.TraceException("CreateNextStepsAppointment failed", ex);
                        return Status.Error;
                    }
                    return Status.Complete;
                });
            }
        }

        public class StepInfo
        {
            public string Name { get; set; }
            public DateTime Date { get; set; }
        }
    }
}
