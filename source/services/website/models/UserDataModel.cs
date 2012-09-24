namespace BuiltSteady.Product.Website.Models
{
    using System.Collections.Generic;
    using System.Linq;

    using BuiltSteady.Product.ServerEntities;
    using BuiltSteady.Product.ServiceHost;
    using BuiltSteady.Product.Shared.Entities;
    using BuiltSteady.Product.Website.Controllers;
    using BuiltSteady.Product.Website.Helpers;
    using BuiltSteady.Product.Website.Resources;

    public class UserDataModel
    {
        public const string DefaultTheme = "default";
        public const string FBConsentSuccess = "FBConsentSuccess";
        public const string FBConsentFail = "FBConsentFail";
        public const string GoogleConsentSuccess = "GoogleConsentSuccess";
        public const string GoogleConsentFail = "GoogleConsentFail";
        public const string CloudADConsentSuccess = "CloudADConsentSuccess";
        public const string CloudADConsentFail = "CloudADConsentFail";

        UserStorageContext storageContext;
        User currentUser;
        User userData;
        string jsonUserData;
        User clientFolders;
        string jsonClientFolders;

        public UserDataModel(User user, UserStorageContext storage)
        {
            this.storageContext = storage;
            this.currentUser = user;
        }

        public UserDataModel(BaseController controller)
        {
            this.storageContext = controller.StorageContext;
            this.currentUser = controller.CurrentUser;
        }

        public UserDataModel(BaseResource resource)
        {
            this.storageContext = resource.StorageContext;
            this.currentUser = resource.CurrentUser;
        }

        public bool RenewFBToken { get; set; }
        public string ConsentStatus { get; set; }

        public UserStorageContext StorageContext
        {
            get { return this.storageContext; }
        }

        // all user data required by a client (user, non-system folders and items)
        public User UserData
        {
            get
            {
                if (userData == null)
                {
                    // synchronize with Calendar (BEFORE getting UserData)
                    // 2012-08-29 OG: No need to synchronize with Google anymore.
                    //GoogleClient client = new GoogleClient(currentUser, storageContext);
                    //client.SynchronizeCalendar();

                    userData = storageContext.Users.
                        Include("ItemTypes.Fields").
                        //Include("Tags").
                        Single<User>(u => u.Name == currentUser.Name);

                    // retrieve non-system folders for this user 
                    // (does not include other user folders this user has been given access to via FolderUsers)
                    List<Folder> folders;
                    if (HttpHeaderHelper.IsPhoneDevice())
                    {   // exclude $WebClient folder on devices
                        var query =
                            from folder in this.StorageContext.Folders
                            where (folder.UserID == userData.ID &&
                                folder.ItemTypeID != SystemItemTypes.System &&
                                folder.Name != SystemEntities.WebClient)
                            orderby folder.SortOrder
                            select new
                            {
                                folder,
                                fus = from fu in folder.FolderUsers select fu,
                                items = from item in folder.Items
                                        where (item.Group == null || item.Group == "Last")
                                        orderby item.SortOrder
                                        select new
                                        {
                                            item,
                                            fvs = from fv in item.FieldValues select fv
                                        }
                            };
                        folders = query.AsEnumerable().Select(q => q.folder).ToList();
                    }
                    else
                    {   // exclude $PhoneClient folder in web browsers
                        var query =
                            from folder in this.StorageContext.Folders
                            where (folder.UserID == userData.ID &&
                                folder.ItemTypeID != SystemItemTypes.System &&
                                folder.Name != SystemEntities.PhoneClient)
                            orderby folder.SortOrder
                            select new
                            {
                                folder,
                                fus = from fu in folder.FolderUsers select fu,
                                items = from item in folder.Items
                                        where (item.Group == null)
                                        orderby item.SortOrder
                                        select new
                                        {
                                            item,
                                            fvs = from fv in item.FieldValues select fv
                                        }
                            };
                        folders = query.AsEnumerable().Select(q => q.folder).ToList();
                    }

                    if (folders != null && folders.Count > 0)
                    {
                        foreach (var folder in folders)
                        {   // return empty lists instead of null
                            folder.Items = (folder.Items == null) ? new List<Item>() : folder.Items;
                        }
                        userData.Folders = folders;
                        userData.Items = null;
                    }
                    else
                    {
                        userData.Folders = new List<Folder>();
                    }
                }
                return userData;
            }
        }

        // user client folders required by a web client ($Client and $WebClient)
        public User ClientFolders
        {
            get
            {
                if (clientFolders == null)
                {
                    // TODO: figure out why query with client filter does not work
                    // TEMPORARY: just copy client folders from UserData
                    clientFolders = UserData;
                    List<Folder> folders = new List<Folder>();

                    foreach (var folder in clientFolders.Folders)
                    {   // just include client folders
                        if (folder.Name == SystemEntities.Client ||
                            folder.Name == SystemEntities.WebClient)
                        {
                            folders.Add(folder);
                        }
                    }
                    clientFolders.Folders = folders;
                }
                return clientFolders;
            }
        }

        public string JsonUserData
        {
            get
            {
                if (jsonUserData == null)
                {   // serialize UserData
                    jsonUserData = JsonSerializer.Serialize(UserData);
                }
                return jsonUserData;
            }
        }

        public string JsonClientFolders
        {
            get
            {
                if (jsonClientFolders == null)
                {   // serialize client folders
                    jsonClientFolders = JsonSerializer.Serialize(ClientFolders);
                }
                return jsonClientFolders;
            }
        }

    }

}
