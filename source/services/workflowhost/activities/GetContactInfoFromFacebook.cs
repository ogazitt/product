using System;
using BuiltSteady.Product.ServerEntities;
using BuiltSteady.Product.ServiceHost;
using BuiltSteady.Product.ServiceHost.Helpers;
using BuiltSteady.Product.Shared.Entities;

namespace BuiltSteady.Product.WorkflowHost.Activities
{
    public class GetContactInfoFromFacebook : WorkflowActivity
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

                    if (VerifyItemType(item, SystemItemTypes.Contact) == false)
                        return Status.Error;

                    if (FacebookHelper.AddContactInfo(UserContext, item))
                        return Status.Complete;
                    else
                        return Status.Error;
                });
            }
        }
    }
}
