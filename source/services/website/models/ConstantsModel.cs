namespace BuiltSteady.Product.Website.Models
{
    using System.Collections.Generic;
    using System.Data.Entity;
    using System.Linq;

    using BuiltSteady.Product.ServerEntities;
    using BuiltSteady.Product.ServiceHost;
    using BuiltSteady.Product.Shared.Entities;

    public static class ConstantsModel
    {
        static Constants constants;
        static string jsonConstants;

        public static Constants Constants
        {
            get
            {
                if (constants == null)
                {
                    UserStorageContext storageContext = Storage.StaticUserContext;
                    var actionTypes = storageContext.ActionTypes.OrderBy(a => a.SortOrder).ToList<ActionType>();
                    var colors = storageContext.Colors.OrderBy(c => c.ColorID).ToList<Color>();
                    var itemTypes = storageContext.ItemTypes.
                        Where(l => l.UserID == SystemUsers.System || l.UserID == SystemUsers.User).
                        Include("Fields").ToList<ItemType>();  // get the built-in itemtypes
                    var permissions = storageContext.Permissions.OrderBy(p => p.PermissionID).ToList<Permission>();
                    var priorities = storageContext.Priorities.OrderBy(p => p.PriorityID).ToList<Priority>();
                    constants = new Constants()
                    {
                        ActionTypes = actionTypes,
                        Colors = colors,
                        ItemTypes = itemTypes,
                        Permissions = permissions,
                        Priorities = priorities,
                        // TODO: inspect themes folder to fetch installed themes
                        Themes = new List<string>() { "Default", "Redmond", "Pink", "Overcast" }
                    };
                }
                return constants;
            }
        }

        public static string JsonConstants
        {
            get
            {
                if (jsonConstants == null)
                {
                    jsonConstants = JsonSerializer.Serialize(Constants);
                }
                return jsonConstants;
            }
        }
    }

}
