using System;
using System.Linq;
using BuiltSteady.Product.ServerEntities;
using BuiltSteady.Product.ServiceHost;
using BuiltSteady.Product.ServiceHost.Helpers;

namespace BuiltSteady.Product.WorkflowHost.Activities
{
    public class ImportFromGoogle : WorkflowActivity
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

                    try
                    {
                        GoogleClient gc = new GoogleClient(user, UserContext);
                        if (gc.GetUserInfo(user, UserContext) == false)
                            return Status.Error;
                    }
                    catch (Exception ex)
                    {
                        TraceLog.TraceException("Failed to import user information from Google", ex);
                        return Status.Error;
                    }
                    return Status.Complete;
                });
            }
        }
    }
}
