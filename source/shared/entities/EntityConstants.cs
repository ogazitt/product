﻿using System;
using System.Collections.Generic;
#if CLIENT
using System.Collections.ObjectModel;
using BuiltSteady.Product.Devices.ClientEntities;
#else
using BuiltSteady.Product.ServerEntities;
#endif

/*---------------------------------------------------------------------------

    Fields are described using the following properties:
    
        ItemType    - the ItemType the field is part of
        FieldName   - semantic type for the field, must be unique per ItemType
        FieldType   - data type for the field
        DisplayName - name displayed in UX for the field
        DisplayType - control type used to to display the field in the UX 

    ItemTypes are extensible and consist of a set of Fields.
        There are a set of system ItemTypes defined below.
    FieldNames are extensible and imply a semantic for the Field.
        There are a set of system FieldNames defined below.
    FieldTypes are static and denote the type to convert to/from a string.
    DisplayNames are simply the string that is rendered in the UX.
    DisplayTypes are static and denote the type of control to display.
 
    ActionNames are static and associated with a FieldName (semantic)
 
----------------------------------------------------------------------------*/
namespace BuiltSteady.Product.Shared.Entities
{

    public class SystemItemTypes
    {   
        // standard item types
        public static Guid Category = new Guid("00000000-0000-0000-0000-000000000007");
        public static Guid Activity = new Guid("00000000-0000-0000-0000-000000000001");
        public static Guid Step = new Guid("00000000-0000-0000-0000-000000000002");
        public static Guid Contact = new Guid("00000000-0000-0000-0000-000000000003");
        public static Guid Location = new Guid("00000000-0000-0000-0000-000000000004");
        // system item types
        public static Guid System = new Guid("00000000-0000-0000-0000-000000000000");
        public static Guid Reference = new Guid("00000000-0000-0000-0000-000000000005");
        public static Guid NameValue = new Guid("00000000-0000-0000-0000-000000000006");

        public static Dictionary<Guid, string> Names = new Dictionary<Guid, string>() 
        { 
            { System, ItemTypeNames.System},
            { Category, ItemTypeNames.Category},
            { Activity, ItemTypeNames.Activity },
            { Step, ItemTypeNames.Step },
            { Contact, ItemTypeNames.Contact },
            { Location, ItemTypeNames.Location },
            { Reference, ItemTypeNames.Reference },
            { NameValue,  ItemTypeNames.NameValue }
        };
    }

    class ItemTypeNames
    {
        // standard item types
        public const string Category = "Category";
        public const string Activity = "Activity";
        public const string Step = "Step";
        public const string Location = "Location";
        public const string Contact = "Contact";
        // system item types
        public const string System = "System";
        public const string Reference = "Reference";
        public const string NameValue = "NameValue";
    }

    public class FieldTypes
    {
        public const string String = "String";
        public const string Boolean = "Boolean";
        public const string Integer = "Integer";
        public const string DateTime = "DateTime";
        public const string Phone = "Phone";
        public const string Email = "Email";
        public const string Url = "Url";
        public const string Address = "Address";
        public const string Currency = "Currency";
        public const string Guid = "Guid";
        public const string Json = "Json";
        public const string TagIDs = "TagIDs";

        public static string DefaultValue(string ft)
        {
            switch (ft)
            {
                case Boolean: return "false";
                default: return null;
            }
        }
    }

    public class DisplayTypes
    {
        public const string Hidden = "Hidden";
        public const string Text = "Text";
        public const string TextArea = "TextArea";
        public const string Checkbox = "Checkbox";
        public const string DatePicker = "DatePicker";
        public const string DateTimePicker = "DateTimePicker";
        public const string Recurrence = "Recurrence";
        public const string Phone = "Phone";
        public const string Email = "Email";
        public const string Link = "Link";
        public const string Currency = "Currency";
        public const string Address = "Address";
        public const string Priority = "Priority";
        public const string Reference = "Reference";
        public const string TagList = "TagList";
        public const string ContactList = "ContactList";
        public const string LocationList = "LocationList";
        public const string LinkArray = "LinkArray";
        public const string Folders = "Folders";
        public const string Lists = "Lists";
        public const string ImageUrl = "ImageUrl";
        public const string ItemTypes = "ItemTypes";
    }

    public class FieldNames
    {                                                       // FieldType:   Semantic:
        public const string Name = "Name";                  // String       friendly name (all items have a name)
        public const string Description = "Description";    // String       additional notes or comments
        public const string Repeat = "Repeat";              // String       recurrence
        public const string Complete = "Complete";          // Boolean      step is complete
        public const string CompletedOn = "CompletedOn";    // DateTime     time at which action is marked complete
        public const string DueDate = "DueDate";            // DateTime     activity or step due date
        public const string EndDate = "EndDate";            // DateTime     end date for schedule steps
        public const string ActionType = "ActionType";      // String       type of action
        public const string Birthday = "Birthday";          // DateTime     user or contact birthday
        public const string Address = "Address";            // Address      address of a location
        public const string WebLink = "WebLink";            // Url          single web links (TODO: NOT BEING USED)
        public const string WebLinks = "WebLinks";          // Json         list of web links [{Name:"name", Url:"link"}, ...] 
        public const string Email = "Email";                // Email        email address 
        public const string Phone = "Phone";                // Phone        phone number (cell phone)
        public const string HomePhone = "HomePhone";        // Phone        home phone 
        public const string WorkPhone = "WorkPhone";        // Phone        work phone
        public const string EntityRef = "EntityRef";        // Guid         id of entity being referenced
        public const string EntityType = "EntityType";      // String       type of entity (User, Folder, or Item)
        public const string Contacts = "Contacts";          // Guid         id of list being referenced which contains contact items
        public const string Locations = "Locations";        // Guid         id of list being referenced which contains location items
        public const string Value = "Value";                // String       value for NameValue items
        public const string LatLong = "LatLong";            // String       comma-delimited geo-location lat,long
        public const string FacebookID = "FacebookID";      // String       facebook id for user or contact
        public const string Sources = "Sources";            // String       comma-delimited list of sources of information (e.g. Facebook) 

        public const string Gender = "Gender";              // String       male or female
        public const string Picture = "Picture";            // Url          link to an image
    }

    public class ExtendedFieldNames
    {  
        public const string Intent = "Intent";              // String       normalized intent to help select workflows (extracted from name)
        public const string SubjectHint = "SubjectHint";    // String       hint as to subject of intent (extracted from name)
        public const string Article = "Article";            // String       the noun associated with the intent (extracted from name)

        public const string CalEventID = "CalEventID";      // String       identifier for a Calendar event to associate with an Item  
        public const string ActivityID = "ActivityID";      // String       identifier for gallery activity this Item was generated from  

        public const string SelectedCount = "SelectedCount";// Integer      count of number of times selected (e.g. MRU)
        public const string SortBy = "SortBy";              // String       field name to sort a list of items by
    }

    public class ActionTypes 
    {
        public const string All = "All";
        public const string Reminder = "Reminder";
        public const string Call = "Call";
        public const string Schedule = "Add to calendar";
        public const string Errand = "Errand";
        public const string SendEmail = "Email";
        public const string TextMessage = "Text";
        public const string AskFriends = "Ask on Facebook";
        public const string Find = "Find local business";
    }

    public class Permissions
    {
        public static int View = 1;
        public static int Modify = 2;
        public static int Full = 3;

        public static bool IsView(int permission)
        { return (permission == View); }

        public static bool CanView(int permission)
        { return (permission == View || permission == Modify || permission == Full); }

        public static bool IsModify(int permission)
        { return (permission == Modify); }

        public static bool CanModify(int permission)
        { return (permission == Modify || permission == Full); }

        public static bool IsFull(int permission)
        { return (permission == Full); }
    }

    public class Sources
    {
        public const string Directory = "Directory";
        public const string Facebook = "Facebook";
        public const string Local = "Local";
    }

    public class SuggestionTypes
    {
        public const string ChooseOne = "ChooseOne";
        public const string ChooseOneSubject = "ChooseOneSubject";
        public const string ChooseMany = "ChooseMany";
        public const string ChooseManyWithChildren = "ChooseManyWithChildren";
        public const string GetFBConsent = "GetFBConsent";
        public const string GetGoogleConsent = "GetGoogleConsent";
        public const string GetADConsent = "GetADConsent";
        public const string NavigateLink = "NavigateLink";
        public const string RefreshEntity = "RefreshEntity";
    }

    public class Reasons
    {
        public const string Chosen = "Chosen";
        public const string Ignore = "Ignore";
        public const string Like = "Like";
        public const string Dislike = "Dislike";
    }

    public class StatusTypes
    {
        public const string Active = "Active";
        public const string Complete = "Complete";
        public const string Paused = "Paused";
        public const string Skipped = "Skipped";
    }

    public class EntityTypes
    {
        public const string User = "User";
        public const string Folder = "Folder";
        public const string Item = "Item";
    }

    public class SystemUsers
    {
        public static Guid System = new Guid("00000000-0000-0000-0000-000000000001");
        public static Guid User = new Guid("00000000-0000-0000-0000-000000000002");
    }

    // names used by the system to store and manage system information associated with each User
    public class SystemEntities
    {   
        // each user will have a seet of system folders for maintaining settings and information
        // these settings will be organized for the clients that need the information (shared, web, phone)
        public const string Client = "$Client";                 // shared client folder
        public const string WebClient = "$WebClient";           // web client folder
        public const string PhoneClient = "$PhoneClient";       // phone client folder

        // $Client list containing items which associate an ItemType with an actual folder or list
        // used to determine where system generated items of a given ItemType should be added
        public const string DefaultLists = "DefaultLists";

        // $Client item containing field values which contain UserProfile information
        public const string UserProfile = "UserProfile";
        // $Client NameValue item containing json object for Calendar settings
        public const string CalendarSettings = "CalendarSettings";

        // $PhoneClient list containing information shared by all phone devices (e.g. MRU, etc.)      
        public const string ListMetadata = "ListMetadata";             
        
        // $PhoneClient NameValue item containing json object for specific phone devices   
#if IOS
        public const string PhoneSettings = "iPhoneSettings";
#else
        public const string PhoneSettings = "WinPhoneSettings";
#endif  
      
        // $WebClient NameValue items containing json objects for web client
        public const string WebViewState = "WebViewState";              // e.g. SelectedItem
        public const string WebPreferences = "WebPreferences";          // e.g. Theme
    
        // each user will have a system folder and lists for maintaining settings and information
        // which are managed and used only on the servers (web and worker roles)
        public const string User = "$User";                             // root system folder for User server settings

        // User list containing items which reference other items
        // This is how server metadata about other items should be stored (as expando field values)
        public const string EntityRefs = "EntityRefs";

        // User lists for various ItemTypes is also contained in this folder
        // These lists are created and looked up by Value (the ItemTypeID), but have a friendly Name (ItemTypeName)
        // This is where information imported from other sources may be stored for created particular ItemTypes
        // (e.g. Contacts list contains possible contacts imported from Facebook and other sources)
    }

    // names used to create initial folders and lists for each User
    public class UserEntities
    {
        // user folders
        public const string Inbox = "Inbox";
        public const string Personal = "Personal";
        public const string Auto = "Auto";
        public const string Home = "Home";
        public const string Finance = "Finance";
        public const string People = "People";
        public const string Places = "Places";
    }

    public class UserConstants
    {
        public static string SchemaVersion { get { return "1.0.2012.0906"; } }
        public static string ConstantsVersion { get { return "2012-09-05"; } }

        public static List<ActionType> DefaultActionTypes()
        {
            // initialize actions
            var actionTypes = new List<ActionType>();
            actionTypes.Add(new ActionType() { ActionTypeID = 1, FieldName = FieldNames.Name, DisplayName = "Next Steps", ActionName = ActionTypes.All, SortOrder = 1 });
            actionTypes.Add(new ActionType() { ActionTypeID = 2, FieldName = FieldNames.DueDate, DisplayName = "Reminder", ActionName = ActionTypes.Reminder, SortOrder = 2 });
            actionTypes.Add(new ActionType() { ActionTypeID = 3, FieldName = FieldNames.Phone, DisplayName = "Call", ActionName = ActionTypes.Call, SortOrder = 3 });
            actionTypes.Add(new ActionType() { ActionTypeID = 4, FieldName = FieldNames.DueDate, DisplayName = "Add to calendar", ActionName = ActionTypes.Schedule, SortOrder = 4 });
            actionTypes.Add(new ActionType() { ActionTypeID = 5, FieldName = FieldNames.Name, DisplayName = "Errand", ActionName = ActionTypes.Errand, SortOrder = 5 });
            actionTypes.Add(new ActionType() { ActionTypeID = 6, FieldName = FieldNames.Email, DisplayName = "Email", ActionName = ActionTypes.SendEmail, SortOrder = 6 });
            actionTypes.Add(new ActionType() { ActionTypeID = 7, FieldName = FieldNames.Phone, DisplayName = "Text", ActionName = ActionTypes.TextMessage, SortOrder = 7 });
            actionTypes.Add(new ActionType() { ActionTypeID = 8, FieldName = FieldNames.Name, DisplayName = "Ask on Facebook", ActionName = ActionTypes.AskFriends, SortOrder = 8 });
            actionTypes.Add(new ActionType() { ActionTypeID = 9, FieldName = FieldNames.Name, DisplayName = "Find local business", ActionName = ActionTypes.Find, SortOrder = 9 });
            return actionTypes;
        }

        public static List<Color> DefaultColors()
        {
            // initialize colors
            var colors = new List<Color>();
            colors.Add(new Color() { ColorID = 0, Name = "White" });
            colors.Add(new Color() { ColorID = 1, Name = "Blue" });
            colors.Add(new Color() { ColorID = 2, Name = "Brown" });
            colors.Add(new Color() { ColorID = 3, Name = "Green" });
            colors.Add(new Color() { ColorID = 4, Name = "Orange" });
            colors.Add(new Color() { ColorID = 5, Name = "Purple" });
            colors.Add(new Color() { ColorID = 6, Name = "Red" });
            colors.Add(new Color() { ColorID = 7, Name = "Yellow" });
            return colors;
        }

        public static List<Permission> DefaultPermissions()
        {
            // initialize permissions
            var permissions = new List<Permission>();
            permissions.Add(new Permission() { PermissionID = 1, Name = "View" });
            permissions.Add(new Permission() { PermissionID = 2, Name = "Modify" });
            permissions.Add(new Permission() { PermissionID = 3, Name = "Full" });
            return permissions;
        }

        public static List<Priority> DefaultPriorities()
        {
            // initialize priorities
            var priorities = new List<Priority>();
            priorities.Add(new Priority() { PriorityID = 0, Name = "Low", Color = "Green" });
            priorities.Add(new Priority() { PriorityID = 1, Name = "Normal", Color = "White" });
            priorities.Add(new Priority() { PriorityID = 2, Name = "High", Color = "Red" });
            return priorities;
        }

        public static List<ItemType> DefaultItemTypes()
        {
            List<ItemType> itemTypes = new List<ItemType>();

            ItemType itemType;

            // create System
            itemTypes.Add(itemType = new ItemType() { ID = SystemItemTypes.System, Name = ItemTypeNames.System, UserID = SystemUsers.System, Fields = new List<Field>() });
            
            // create Activity
            itemTypes.Add(itemType = new ItemType() { ID = SystemItemTypes.Activity, Name = ItemTypeNames.Activity, UserID = SystemUsers.User, Fields = new List<Field>() });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000011"), FieldType = FieldTypes.String, Name = FieldNames.Name, DisplayName = "Name", DisplayType = DisplayTypes.Text, ItemTypeID = SystemItemTypes.Activity, IsPrimary = true, SortOrder = 1 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000012"), FieldType = FieldTypes.String, Name = FieldNames.Repeat, DisplayName = "Repeat", DisplayType = DisplayTypes.Recurrence, ItemTypeID = SystemItemTypes.Activity, IsPrimary = true, SortOrder = 2 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000013"), FieldType = FieldTypes.String, Name = FieldNames.Description, DisplayName = "Notes", DisplayType = DisplayTypes.TextArea, ItemTypeID = SystemItemTypes.Activity, IsPrimary = false, SortOrder = 3 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000014"), FieldType = FieldTypes.Guid, Name = FieldNames.Contacts, DisplayName = "Contacts", DisplayType = DisplayTypes.ContactList, ItemTypeID = SystemItemTypes.Activity, IsPrimary = false, SortOrder = 4 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000015"), FieldType = FieldTypes.Guid, Name = FieldNames.Locations, DisplayName = "Locations", DisplayType = DisplayTypes.LocationList, ItemTypeID = SystemItemTypes.Activity, IsPrimary = false, SortOrder = 5 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000016"), FieldType = FieldTypes.Json, Name = FieldNames.WebLinks, DisplayName = "Web Links", DisplayType = DisplayTypes.LinkArray, ItemTypeID = SystemItemTypes.Activity, IsPrimary = false, SortOrder = 6 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000017"), FieldType = FieldTypes.DateTime, Name = FieldNames.DueDate, DisplayName = "Due Date", DisplayType = DisplayTypes.DatePicker, ItemTypeID = SystemItemTypes.Activity, IsPrimary = false, SortOrder = 7 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000018"), FieldType = FieldTypes.Boolean, Name = FieldNames.Complete, DisplayName = "Complete", DisplayType = DisplayTypes.Hidden, ItemTypeID = SystemItemTypes.Activity, IsPrimary = false, SortOrder = 8 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000019"), FieldType = FieldTypes.DateTime, Name = FieldNames.CompletedOn, DisplayName = "Completed On", DisplayType = DisplayTypes.Hidden, ItemTypeID = SystemItemTypes.Activity, IsPrimary = false, SortOrder = 9 });

            // create Step
            itemTypes.Add(itemType = new ItemType() { ID = SystemItemTypes.Step, Name = ItemTypeNames.Step, UserID = SystemUsers.User, Fields = new List<Field>() });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000021"), FieldType = FieldTypes.String, Name = FieldNames.Name, DisplayName = "Name", DisplayType = DisplayTypes.Text, ItemTypeID = SystemItemTypes.Step, IsPrimary = true, SortOrder = 1 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000022"), FieldType = FieldTypes.DateTime, Name = FieldNames.DueDate, DisplayName = "Due Date", DisplayType = DisplayTypes.DatePicker, ItemTypeID = SystemItemTypes.Step, IsPrimary = true, SortOrder = 2 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000023"), FieldType = FieldTypes.String, Name = FieldNames.Description, DisplayName = "Notes", DisplayType = DisplayTypes.TextArea, ItemTypeID = SystemItemTypes.Step, IsPrimary = true, SortOrder = 3 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000024"), FieldType = FieldTypes.Boolean, Name = FieldNames.Complete, DisplayName = "Complete", DisplayType = DisplayTypes.Checkbox, ItemTypeID = SystemItemTypes.Step, IsPrimary = true, SortOrder = 4 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000025"), FieldType = FieldTypes.DateTime, Name = FieldNames.CompletedOn, DisplayName = "Completed On", DisplayType = DisplayTypes.Hidden, ItemTypeID = SystemItemTypes.Step, IsPrimary = false, SortOrder = 5 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000026"), FieldType = FieldTypes.Guid, Name = FieldNames.Contacts, DisplayName = "Contact", DisplayType = DisplayTypes.ContactList, ItemTypeID = SystemItemTypes.Step, IsPrimary = false, SortOrder = 6 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000027"), FieldType = FieldTypes.Guid, Name = FieldNames.Locations, DisplayName = "Location", DisplayType = DisplayTypes.LocationList, ItemTypeID = SystemItemTypes.Step, IsPrimary = false, SortOrder = 7 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000028"), FieldType = FieldTypes.Json, Name = FieldNames.WebLinks, DisplayName = "Web Links", DisplayType = DisplayTypes.LinkArray, ItemTypeID = SystemItemTypes.Step, IsPrimary = false, SortOrder = 8 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000029"), FieldType = FieldTypes.String, Name = FieldNames.ActionType, DisplayName = "Action", DisplayType = DisplayTypes.Hidden, ItemTypeID = SystemItemTypes.Step, IsPrimary = false, SortOrder = 9 });
            
            // create Contact
            itemTypes.Add(itemType = new ItemType() { ID = SystemItemTypes.Contact, Name = ItemTypeNames.Contact, UserID = SystemUsers.User, Icon = "contact.png", Fields = new List<Field>() });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000031"), FieldType = FieldTypes.String, Name = FieldNames.Name, DisplayName = "Name", DisplayType = DisplayTypes.Text, ItemTypeID = SystemItemTypes.Contact, IsPrimary = true, SortOrder = 1 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000032"), FieldType = FieldTypes.Email, Name = FieldNames.Email, DisplayName = "Email", DisplayType = DisplayTypes.Email, ItemTypeID = SystemItemTypes.Contact, IsPrimary = true, SortOrder = 2 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000033"), FieldType = FieldTypes.Phone, Name = FieldNames.Phone, DisplayName = "Mobile Phone", DisplayType = DisplayTypes.Phone, ItemTypeID = SystemItemTypes.Contact, IsPrimary = true, SortOrder = 3 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000034"), FieldType = FieldTypes.Phone, Name = FieldNames.HomePhone, DisplayName = "Home Phone", DisplayType = DisplayTypes.Phone, ItemTypeID = SystemItemTypes.Contact, IsPrimary = false, SortOrder = 4 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000035"), FieldType = FieldTypes.Phone, Name = FieldNames.WorkPhone, DisplayName = "Work Phone", DisplayType = DisplayTypes.Phone, ItemTypeID = SystemItemTypes.Contact, IsPrimary = false, SortOrder = 5 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000036"), FieldType = FieldTypes.Guid, Name = FieldNames.Locations, DisplayName = "Address", DisplayType = DisplayTypes.LocationList, ItemTypeID = SystemItemTypes.Contact, IsPrimary = false, SortOrder = 6 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000037"), FieldType = FieldTypes.DateTime, Name = FieldNames.Birthday, DisplayName = "Birthday", DisplayType = DisplayTypes.DatePicker, ItemTypeID = SystemItemTypes.Contact, IsPrimary = false, SortOrder = 7 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000038"), FieldType = FieldTypes.String, Name = FieldNames.FacebookID, DisplayName = "Facebook ID", DisplayType = DisplayTypes.Hidden, ItemTypeID = SystemItemTypes.Contact, IsPrimary = false, SortOrder = 8 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000039"), FieldType = FieldTypes.String, Name = FieldNames.Sources, DisplayName = "Sources", DisplayType = DisplayTypes.Hidden, ItemTypeID = SystemItemTypes.Contact, IsPrimary = false, SortOrder = 9 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-00000000003A"), FieldType = FieldTypes.Url, Name = FieldNames.Picture, DisplayName = "Picture", DisplayType = DisplayTypes.Hidden /* TODO: DisplayTypes.ImageUrl */, ItemTypeID = SystemItemTypes.Contact, IsPrimary = false, SortOrder = 10 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-00000000003B"), FieldType = FieldTypes.String, Name = FieldNames.Gender, DisplayName = "Gender", DisplayType = DisplayTypes.Hidden, ItemTypeID = SystemItemTypes.Contact, IsPrimary = false, SortOrder = 11 });

            // create Location
            itemTypes.Add(itemType = new ItemType() { ID = SystemItemTypes.Location, Name = ItemTypeNames.Location, UserID = SystemUsers.User, Icon = "location.png", Fields = new List<Field>() });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000041"), FieldType = FieldTypes.String, Name = FieldNames.Name, DisplayName = "Name", DisplayType = DisplayTypes.Text, ItemTypeID = SystemItemTypes.Location, IsPrimary = true, SortOrder = 1 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000042"), FieldType = FieldTypes.Address, Name = FieldNames.Address, DisplayName = "Address", DisplayType = DisplayTypes.Address, ItemTypeID = SystemItemTypes.Location, IsPrimary = true, SortOrder = 2 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000043"), FieldType = FieldTypes.Phone, Name = FieldNames.Phone, DisplayName = "Phone", DisplayType = DisplayTypes.Phone, ItemTypeID = SystemItemTypes.Location, IsPrimary = true, SortOrder = 3 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000044"), FieldType = FieldTypes.Email, Name = FieldNames.Email, DisplayName = "Email", DisplayType = DisplayTypes.Email, ItemTypeID = SystemItemTypes.Location, IsPrimary = false, SortOrder = 4 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000045"), FieldType = FieldTypes.Json, Name = FieldNames.WebLinks, DisplayName = "Web Links", DisplayType = DisplayTypes.LinkArray, ItemTypeID = SystemItemTypes.Location, IsPrimary = false, SortOrder = 5 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000046"), FieldType = FieldTypes.String, Name = FieldNames.Description, DisplayName = "Description", DisplayType = DisplayTypes.TextArea, ItemTypeID = SystemItemTypes.Location, IsPrimary = false, SortOrder = 6 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000047"), FieldType = FieldTypes.String, Name = FieldNames.LatLong, DisplayName = "LatLong", DisplayType = DisplayTypes.Hidden, ItemTypeID = SystemItemTypes.Location, IsPrimary = false, SortOrder = 8 });

            // create Reference
            itemTypes.Add(itemType = new ItemType() { ID = SystemItemTypes.Reference, Name = ItemTypeNames.Reference, UserID = SystemUsers.System, Fields = new List<Field>() });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000051"), FieldType = FieldTypes.String, Name = FieldNames.Name, DisplayName = "Name", DisplayType = DisplayTypes.Text, ItemTypeID = SystemItemTypes.Reference, IsPrimary = true, SortOrder = 1 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000052"), FieldType = FieldTypes.Guid, Name = FieldNames.EntityRef, DisplayName = "EntityRef", DisplayType = DisplayTypes.Reference, ItemTypeID = SystemItemTypes.Reference, IsPrimary = true, SortOrder = 2 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000053"), FieldType = FieldTypes.String, Name = FieldNames.EntityType, DisplayName = "EntityType", DisplayType = DisplayTypes.Text, ItemTypeID = SystemItemTypes.Reference, IsPrimary = true, SortOrder = 3 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000054"), FieldType = FieldTypes.String, Name = FieldNames.Value, DisplayName = "Value", DisplayType = DisplayTypes.Text, ItemTypeID = SystemItemTypes.Reference, IsPrimary = true, SortOrder = 4 });

            // create NameValue
            itemTypes.Add(itemType = new ItemType() { ID = SystemItemTypes.NameValue, Name = ItemTypeNames.NameValue, UserID = SystemUsers.System, Fields = new List<Field>() });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000061"), FieldType = FieldTypes.String, Name = FieldNames.Name, DisplayName = "Name", DisplayType = DisplayTypes.Text, ItemTypeID = SystemItemTypes.NameValue, IsPrimary = true, SortOrder = 1 });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000062"), FieldType = FieldTypes.String, Name = FieldNames.Value, DisplayName = "Value", DisplayType = DisplayTypes.Text, ItemTypeID = SystemItemTypes.NameValue, IsPrimary = true, SortOrder = 2 });

            // create Category
            itemTypes.Add(itemType = new ItemType() { ID = SystemItemTypes.Category, Name = ItemTypeNames.Category, UserID = SystemUsers.User, Fields = new List<Field>() });
            itemType.Fields.Add(new Field() { ID = new Guid("00000000-0000-0000-0000-000000000071"), FieldType = FieldTypes.String, Name = FieldNames.Name, DisplayName = "Name", DisplayType = DisplayTypes.Text, ItemTypeID = SystemItemTypes.Category, IsPrimary = true, SortOrder = 1 });

            return itemTypes;
        }

        public static List<User> DefaultUsers()
        {
            List<User> users = new List<User>();

            User user;

            // create the Task
            users.Add(user = new User() { ID = SystemUsers.System, Name = "System", Email = "system@builtsteady.com" });
#if !CLIENT
            user.CreateDate = new DateTime(2012, 1, 1);
#endif
            users.Add(user = new User() { ID = SystemUsers.User, Name = "User", Email = "user@builtsteady.com" });
#if !CLIENT
            user.CreateDate = new DateTime(2012, 1, 1);
#endif
            return users;
        }

        public static List<Folder> DefaultFolders(User currentUser)
        {
            List<Folder> folders = new List<Folder>();
            Dictionary<Guid, object> defaultLists = new Dictionary<Guid, object>();
            DateTime now = DateTime.Now;
            Item item;
            Folder folder;
            Guid folderID = Guid.NewGuid();

#if !CLIENT
            FolderUser folderUser;
            folderUser = new FolderUser() { ID = Guid.NewGuid(), FolderID = folderID, UserID = currentUser.ID, PermissionID = Permissions.Full };
#endif
            // create Inbox folder
            folder = new Folder()
            {
                ID = folderID,
                SortOrder = 1000,
                Name = UserEntities.Inbox,
                ItemTypeID = SystemItemTypes.Category,
#if CLIENT
                Items = new ObservableCollection<Item>(),
#else
                Items = new List<Item>(),
                UserID = currentUser.ID,
                FolderUsers = new List<FolderUser>() { folderUser }
#endif
            };
            folders.Add(folder);
            // make this defaultList for Activities
            defaultLists.Add(SystemItemTypes.Activity, folder);

            folderID = Guid.NewGuid();
#if !CLIENT
            folderUser = new FolderUser() { ID = Guid.NewGuid(), FolderID = folderID, UserID = currentUser.ID, PermissionID = Permissions.Full };
#endif
            // create Personal folder
            folder = new Folder()
            {
                ID = folderID,
                SortOrder = 2000,
                Name = UserEntities.Personal,
                ItemTypeID = SystemItemTypes.Category,
#if CLIENT
                Items = new ObservableCollection<Item>(),
#else
                Items = new List<Item>(),
                UserID = currentUser.ID,
                FolderUsers = new List<FolderUser>() { folderUser }
#endif
            };
            folders.Add(folder);

            folderID = Guid.NewGuid();
#if !CLIENT
            folderUser = new FolderUser() { ID = Guid.NewGuid(), FolderID = folderID, UserID = currentUser.ID, PermissionID = Permissions.Full };
#endif
            // create Auto folder
            folder = new Folder()
            {
                ID = folderID,
                SortOrder = 3000,
                Name = UserEntities.Auto,
                ItemTypeID = SystemItemTypes.Category,
#if CLIENT
                Items = new ObservableCollection<Item>(),
#else
                Items = new List<Item>(),
                UserID = currentUser.ID,
                FolderUsers = new List<FolderUser>() { folderUser }
#endif
            };
            folders.Add(folder);

            folderID = Guid.NewGuid();
#if !CLIENT
            folderUser = new FolderUser() { ID = Guid.NewGuid(), FolderID = folderID, UserID = currentUser.ID, PermissionID = Permissions.Full };
#endif
            // create Home folder
            folder = new Folder()
            {
                ID = folderID,
                SortOrder = 4000,
                Name = UserEntities.Home,
                ItemTypeID = SystemItemTypes.Category,
#if CLIENT
                Items = new ObservableCollection<Item>(),
#else
                Items = new List<Item>(),
                UserID = currentUser.ID,
                FolderUsers = new List<FolderUser>() { folderUser }
#endif
            };
            folders.Add(folder);

            folderID = Guid.NewGuid();
#if !CLIENT
            folderUser = new FolderUser() { ID = Guid.NewGuid(), FolderID = folderID, UserID = currentUser.ID, PermissionID = Permissions.Full };
#endif
            // create Finance folder
            folder = new Folder()
            {
                ID = folderID,
                SortOrder = 5000,
                Name = UserEntities.Finance,
                ItemTypeID = SystemItemTypes.Category,
#if CLIENT
                Items = new ObservableCollection<Item>(),
#else
                Items = new List<Item>(),
                UserID = currentUser.ID,
                FolderUsers = new List<FolderUser>() { folderUser }
#endif
            };
            folders.Add(folder);

            folderID = Guid.NewGuid();
#if !CLIENT
            folderUser = new FolderUser() { ID = Guid.NewGuid(), FolderID = folderID, UserID = currentUser.ID, PermissionID = Permissions.Full };
#endif
            // create People folder
            folder = new Folder()
            {
                ID = folderID,
                SortOrder = 50000,
                Name = UserEntities.People,
                ItemTypeID = SystemItemTypes.Contact,
#if CLIENT
                Items = new ObservableCollection<Item>(),
#else
                Items = new List<Item>(),
                UserID = currentUser.ID,
                FolderUsers = new List<FolderUser>() { folderUser }
#endif
            };
            folders.Add(folder);
            // make this defaultList for Contacts
            defaultLists.Add(SystemItemTypes.Contact, folder);

            folderID = Guid.NewGuid();
#if !CLIENT
            folderUser = new FolderUser() { ID = Guid.NewGuid(), FolderID = folderID, UserID = currentUser.ID, PermissionID = Permissions.Full };
#endif
            // create Places folder
            folder = new Folder()
            {
                ID = folderID,
                SortOrder = 50001,
                Name = UserEntities.Places,
                ItemTypeID = SystemItemTypes.Location,
#if CLIENT
                Items = new ObservableCollection<Item>(),
#else
                Items = new List<Item>(),
                UserID = currentUser.ID,
                FolderUsers = new List<FolderUser>() { folderUser }
#endif
            };
            folders.Add(folder);
            // make this defaultList for Locations
            defaultLists.Add(SystemItemTypes.Location, folder);

#if !CLIENT
            folderID = Guid.NewGuid();
            folderUser = new FolderUser() { ID = Guid.NewGuid(), FolderID = folderID, UserID = currentUser.ID, PermissionID = Permissions.Full };
            // create $WebClient folder
            folder = new Folder()
            {
                ID = folderID,
                SortOrder = 0,
                Name = SystemEntities.WebClient,
                ItemTypeID = SystemItemTypes.NameValue,
                Items = new List<Item>(),
                UserID = currentUser.ID,
                FolderUsers = new List<FolderUser>() { folderUser }
            };
            folders.Add(folder);
#endif

            folderID = Guid.NewGuid();
#if !CLIENT
            folderUser = new FolderUser() { ID = Guid.NewGuid(), FolderID = folderID, UserID = currentUser.ID, PermissionID = Permissions.Full };
#endif
            // create $PhoneClient folder
            folder = new Folder()
            {
                ID = folderID,
                SortOrder = 0,
                Name = SystemEntities.PhoneClient,
                ItemTypeID = SystemItemTypes.NameValue,
#if CLIENT
                Items = new ObservableCollection<Item>(),
#else
                Items = new List<Item>(), 
                UserID = currentUser.ID, 
                FolderUsers = new List<FolderUser>() { folderUser }
#endif
            };
            folders.Add(folder);

            folderID = Guid.NewGuid();
#if !CLIENT
            folderUser = new FolderUser() { ID = Guid.NewGuid(), FolderID = folderID, UserID = currentUser.ID, PermissionID = Permissions.Full };
#endif
            // create $Client folder
            folder = new Folder() 
            {
                ID = folderID, 
                SortOrder = 0, 
                Name = SystemEntities.Client, 
                ItemTypeID = SystemItemTypes.NameValue,
#if CLIENT
                Items = new ObservableCollection<Item>(),
#else
                Items = new List<Item>(), 
                UserID = currentUser.ID, 
                FolderUsers = new List<FolderUser>() { folderUser }
#endif
            };
            folders.Add(folder);

            // create DefaultLists list
            var defaultListItemID = Guid.NewGuid();
            item = new Item()
            {
                ID = defaultListItemID,
                SortOrder = 0,
                Name = SystemEntities.DefaultLists,
                FolderID = folder.ID,
                IsList = true,
                ItemTypeID = SystemItemTypes.Reference,
                ParentID = null,
                Created = now,
                LastModified = now,
#if !CLIENT
                UserID = currentUser.ID,
#endif
            };
            folder.Items.Add(item);

            // add defaultList References for each ItemType
            int sortOrder = 1;
            foreach (var keyValue in defaultLists)
            {
                item = new Item()
                {
                    ID = Guid.NewGuid(),
                    SortOrder = sortOrder++,
                    Name = SystemItemTypes.Names[keyValue.Key],
                    FolderID = folder.ID,
                    IsList = false,
                    ItemTypeID = SystemItemTypes.Reference,
                    ParentID = defaultListItemID,
                    Created = now,
                    LastModified = now,
#if CLIENT
                    FieldValues = new ObservableCollection<FieldValue>(),
#else
                    FieldValues = new List<FieldValue>(),
                    UserID = currentUser.ID,
#endif
                };

                if (keyValue.Value is Folder) 
                { 
                    Folder folderToRef = (Folder)keyValue.Value; 
#if CLIENT
                    item.GetFieldValue(FieldNames.EntityRef, true).Value = folderToRef.ID.ToString();
                    item.GetFieldValue(FieldNames.EntityType, true).Value = EntityTypes.Folder;
                    item.GetFieldValue(FieldNames.Value, true).Value = keyValue.Key.ToString();
#else
                    item.FieldValues.Add(Item.CreateFieldValue(item.ID, FieldNames.EntityRef, folderToRef.ID.ToString()));
                    item.FieldValues.Add(Item.CreateFieldValue(item.ID, FieldNames.EntityType, EntityTypes.Folder));
                    item.FieldValues.Add(Item.CreateFieldValue(item.ID, FieldNames.Value, keyValue.Key.ToString()));
#endif                
                }
                if (keyValue.Value is Item) 
                { 
                    Item itemToRef = (Item)keyValue.Value; 
#if CLIENT
                    item.GetFieldValue(FieldNames.EntityRef, true).Value = itemToRef.ID.ToString();
                    item.GetFieldValue(FieldNames.EntityType, true).Value = EntityTypes.Item;
                    item.GetFieldValue(FieldNames.Value, true).Value = keyValue.Key.ToString();
#else
                    item.FieldValues.Add(Item.CreateFieldValue(item.ID, FieldNames.EntityRef, itemToRef.ID.ToString()));
                    item.FieldValues.Add(Item.CreateFieldValue(item.ID, FieldNames.EntityType, EntityTypes.Item));
                    item.FieldValues.Add(Item.CreateFieldValue(item.ID, FieldNames.Value, keyValue.Key.ToString()));
#endif                  
                }

                folder.Items.Add(item);
            }

            return folders;
        }

    }

    public class UserAgents
    {
        // user agents for devices
        public const string WinPhone = "BuiltSteady-WinPhone";
        public const string IOSPhone = "BuiltSteady-IOSPhone";
    }

    public class HttpApplicationHeaders
    {
        // custom Http headers used by application
        //public const string SpeechEncoding = "X-BuiltSteady-Speech-Encoding";
        public const string Session = "X-BuiltSteady-Session";
    }

}
