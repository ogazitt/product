// ---------------------------------------------------------
// DATAMODEL CONSTANTS (keep in sync with EntityConstants.cs)

// ---------------------------------------------------------
// ItemTypes constants

var ItemTypes = {
    // standard item types
    Category: "00000000-0000-0000-0000-000000000007",
    Activity: "00000000-0000-0000-0000-000000000001",
    Step: "00000000-0000-0000-0000-000000000002",
    Contact: "00000000-0000-0000-0000-000000000003",
    Location: "00000000-0000-0000-0000-000000000004",
    // system item types
    System: "00000000-0000-0000-0000-000000000000",
    Reference: "00000000-0000-0000-0000-000000000005",
    NameValue: "00000000-0000-0000-0000-000000000006"
}

// ---------------------------------------------------------
// FieldNames constants

var FieldNames = {
    Name: "Name",                  // String       friendly name (all items have a name)
    Description: "Description",    // String       additional notes or comments
    Repeat: "Repeat",              // String       recurrence
    Active: "Active",               // Boolean      activity or step is active
    Skip: "Skip",                   // Boolean      step is skipped
    Complete: "Complete",           // Boolean      step is complete
    CompletedOn: "CompletedOn",     // DateTime     time at which task is marked complete
    DueDate: "DueDate",            // DateTime     task due or appointment start time
    EndDate: "EndDate",            // DateTime     appointment end time
    ActionType: "ActionType",       // String       type of action
    Birthday: "Birthday",           // DateTime     user or contact birthday
    Address: "Address",             // Address      address of a location
    WebLink: "WebLink",            // Url          single web links (TODO: NOT BEING USED)
    WebLinks: "WebLinks",          // Json         list of web links [{Name:"name", Url:"link"}, ...] 
    Email: "Email",                // Email        email address 
    Phone: "Phone",                // Phone        phone number (cell phone)
    HomePhone: "HomePhone",        // Phone        home phone 
    WorkPhone: "WorkPhone",        // Phone        work phone
    Amount: "Amount",              // String       quantity (need format for units, etc.)
    Cost: "Cost",                  // Currency     price or cost (need format for different currencies)
    ItemTags: "ItemTags",          // TagIDs       extensible list of tags for marking items
    EntityRef: "EntityRef",        // Guid         id of entity being referenced
    EntityType: "EntityType",      // String       type of entity (User, Folder, or Item)
    Contacts: "Contacts",          // Guid         id of list being referenced which contains contact items
    Locations: "Locations",        // Guid         id of list being referenced which contains location items
    Value: "Value",                // String       value for NameValue items
    Category: "Category",          // String       category (to organize item types e.g. Grocery)
    LatLong: "LatLong",            // String       comma-delimited geo-location lat,long
    FacebookID: "FacebookID",      // String       facebook id for user or contact
    Sources: "Sources",            // String       comma-delimited list of sources of information (e.g. Facebook) 

    Gender: "Gender",              // String       male or female
    Picture: "Picture"             // Url          link to an image
}

// ---------------------------------------------------------
// EntityTypes constants

var EntityTypes = {
    User: "User",
    Folder: "Folder",
    Item: "Item"
}

// ---------------------------------------------------------
// FieldTypes constants

var FieldTypes = {
    String: "String",
    Boolean: "Boolean",
    Integer: "Integer",
    DateTime: "DateTime",
    Phone: "Phone",
    Email: "Email",
    Url: "Url",
    Address: "Address",
    Currency: "Currency",
    TagIDs: "TagIDs",
    Guid: "Guid",
    JSON: "JSON"
}

// ---------------------------------------------------------
// DisplayTypes constants

var DisplayTypes = {
    Hidden: "Hidden",
    Text: "Text",
    TextArea: "TextArea",
    Checkbox: "Checkbox",
    DatePicker: "DatePicker",
    DateTimePicker: "DateTimePicker",
    Phone: "Phone",
    Email: "Email",
    Link: "Link",
    Currency: "Currency",
    Address: "Address",
    Priority: "Priority",
    TagList: "TagList",
    Reference: "Reference",
    Contact: "Contact",
    ContactList: "ContactList",
    LocationList: "LocationList",
    LinkArray: "LinkArray"
}

// ---------------------------------------------------------
// SuggestionTypes constants

var SuggestionTypes = {
    ChooseOne: "ChooseOne",
    ChooseOneSubject: "ChooseOneSubject",
    ChooseMany: "ChooseMany",
    ChooseManyWithChildren: "ChooseManyWithChildren",
    GetFBConsent: "GetFBConsent",
    GetGoogleConsent: "GetGoogleConsent",
    GetADConsent: "GetADConsent",
    NavigateLink: "NavigateLink",
    RefreshEntity: "RefreshEntity"
}

// ---------------------------------------------------------
// Reasons constants

var Reasons = {
    Chosen: "Chosen",
    Ignore: "Ignore",
    Like: "Like",
    Dislike: "Dislike"
}

// ---------------------------------------------------------
// StatusTypes constants (for Item.Status)

var StatusTypes = {
    Active: "Active",
    Complete: "Complete",
    Paused: "Paused",
    Skipped: "Skipped"
}

// ---------------------------------------------------------
// Sources constants

var Sources = {
    Directory: "Directory",
    Facebook: "Facebook",
    Local: "Local"
}

// ---------------------------------------------------------
// SystemFolders constants

var SystemFolders = {
    Client: "$Client",
    WebClient: "$WebClient"
}

// ---------------------------------------------------------
// SystemUsers constants

var SystemUsers = {
    // built-in system users
    System: "00000000-0000-0000-0000-000000000001",
    User: "00000000-0000-0000-0000-000000000002"
}

// ---------------------------------------------------------
// ActionTypes constants

var ActionTypes = {
    All: "All",
    Remind: "Remind",
    Call: "Call",
    SendEmail: "Email",
    AskFriends: "Ask FB friends",
    Find: "Find local businesses",
    Schedule: "Schedule on calendar",
    Map: "Map",
    TextMessage: "Text"
}
