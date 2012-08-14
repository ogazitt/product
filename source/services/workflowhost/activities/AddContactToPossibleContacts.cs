using System;
using BuiltSteady.Product.ServerEntities;
using BuiltSteady.Product.ServiceHost;
using BuiltSteady.Product.ServiceHost.Helpers;

namespace BuiltSteady.Product.WorkflowHost.Activities
{
    public class AddContactToPossibleContacts : WorkflowActivity
    {
        public override Func<WorkflowInstance, ServerEntity, object, Status> Function
        {
            get
            {
                return ((workflowInstance, entity, data) =>
                {
                    Item item = entity as Item;
                    if (item == null)
                    {
                        TraceLog.TraceError("Entity is not an Item");
                        return Status.Error;
                    }

                    if (PossibleContactHelper.AddContact(UserContext, item))
                        return Status.Complete;
                    else
                        return Status.Error;
                });
            }
        }
    }
}
