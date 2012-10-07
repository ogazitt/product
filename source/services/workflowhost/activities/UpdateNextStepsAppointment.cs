using System;
using BuiltSteady.Product.ServerEntities;
using BuiltSteady.Product.ServiceHost;

namespace BuiltSteady.Product.WorkflowHost.Activities
{
    public class UpdateNextStepsAppointment : WorkflowActivity
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
                        GoogleClient gc = new GoogleClient(user, UserContext);
                        if (gc.UpdateNextStepsEvent(null) == false)
                            return Status.Error;
                    }
                    catch (Exception ex)
                    {
                        TraceLog.TraceException("UpdateNextStepsAppointment failed", ex);
                        return Status.Error;
                    }
                    return Status.Complete;
                });
            }
        }
    }
}
