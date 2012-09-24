namespace BuiltSteady.Product.Website.Models
{
    using System.Collections.Generic;
    using System.Linq;

    using BuiltSteady.Product.ServerEntities;
    using BuiltSteady.Product.ServiceHost;
    using BuiltSteady.Product.Shared.Entities;
    using BuiltSteady.Product.Website.Controllers;
    using BuiltSteady.Product.Website.Resources;

    public class NextStepsDataModel
    {
        UserStorageContext storageContext;
        User currentUser;
        List<Item> nextStepsData;
        string jsonNextStepsData;

        public NextStepsDataModel(User user, UserStorageContext storage)
        {
            this.storageContext = storage;
            this.currentUser = user;
        }

        public NextStepsDataModel(BaseController controller)
        {
            this.storageContext = controller.StorageContext;
            this.currentUser = controller.CurrentUser;
        }

        public NextStepsDataModel(BaseResource resource)
        {
            this.storageContext = resource.StorageContext;
            this.currentUser = resource.CurrentUser;
        }

        public UserStorageContext StorageContext
        {
            get { return this.storageContext; }
        }

        public List<Item> NextStepsData
        {
            get
            {
                if (nextStepsData == null)
                {
                    // get all of the steps for this user (client will filter)
                    nextStepsData = storageContext.Items.
                        Include("ItemTags").
                        Include("FieldValues").
                        Where(i => i.UserID == currentUser.ID && i.ItemTypeID == SystemItemTypes.Step).
                        OrderBy(i => i.ParentID).ThenBy(i => i.SortOrder).
                        ToList();
                }
                return nextStepsData;
            }
        }

        public string JsonNextStepsData
        {
            get
            {
                if (jsonNextStepsData == null)
                {   // serialize NextStepsData
                    jsonNextStepsData = JsonSerializer.Serialize(NextStepsData);
                }
                return jsonNextStepsData;
            }
        }
    }
}
