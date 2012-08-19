//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// NextStepsModel.js

// NextStepsModel object
var NextStepsModel = function NextStepsModel$() { };

// this function augments the main DataModel with the ActionTypes associative array
// this is useful for the next steps page (but isn't used in the dashboard).  that is 
// why it is implemented separately.
NextStepsModel.Augment = function NextStepsModel$Augment(dataModel) {
    // create an associative array of ActionType objects.  
    // each ActionType object contains an associative array of the Items of that ActionType
    var actionTypes = {};
    for (var key in ActionTypes) {
        actionTypes[key] = ActionType.Extend({ Name: ActionTypes[key], ID: ActionTypes[key] });
        actionTypes[key].steps = [];
    }

    // create an associative array over the action types 
    dataModel.ActionTypesMap = new ItemMap(actionTypes);
    dataModel.ActionTypes = dataModel.ActionTypesMap.Items;

    // extend the step items passed in with Item functions
    for (var i in dataModel.Folders) {
        var folder = dataModel.Folders[i];
        for (var j in folder.Items) {
            var item = folder.Items[j];
            if (item.ItemTypeID == ItemTypes.Step) {
                var actionType = item.GetActionType();
                var len = dataModel.ActionTypes[actionType.Name].steps.length;
                dataModel.ActionTypes[actionType.Name].steps[len++] = item;
            }
        }
    }

    // create an associative array over the steps in each action type
    for (var key in dataModel.ActionTypes) {
        dataModel.ActionTypes[key].StepsMap = new ItemMap(dataModel.ActionTypes[key].steps);
        dataModel.ActionTypes[key].Steps = dataModel.ActionTypes[key].StepsMap.Items;
    }
}

// generic helper for finding action type for given action type name
DataModel.FindActionType = function DataModel$FindActionType(actionTypeName) {
    if (actionTypeName != null) {
        var item = DataModel.ActionTypes[actionTypeName];
        if (item != null) { return item; }
    }
    return null;
}

// ---------------------------------------------------------
// ActionType object - provides prototype functions for ActionType
// ActionType objects are containers for Items (steps) of an ActionType

function ActionType() { };
ActionType.Extend = function ActionType$Extend(actionType) { return $.extend(new ActionType(), actionType); }  // extend with ActionType prototypes

// ActionType public functions
// do not deep copy, remove Items collection, copy is for updating ActionType entity only
ActionType.prototype.Copy = function () { var copy = $.extend(new ActionType(), this); copy.Steps = {}; copy.StepsMap = {}; return copy; };
ActionType.prototype.IsActionType = function () { return true; };
ActionType.prototype.GetSteps = function (sort, status) {
    if (status === undefined) status = StatusTypes.Active;
    var steps = {};
    for (var id in this.Steps) {
        var item = this.Steps[id];
        if (item.Status == status) steps[id] = item;
        // TODO: remove (this is for testing)
        if (!item.GetFieldValue(item.GetField(FieldNames.Complete))) steps[id] = item;
    }
    return steps;
}
ActionType.prototype.GetStep = function (itemID) { return this.Steps[itemID]; }

// augment Item prototype with some new utilities
Item.prototype.GetActionType = function () {
    var actionTypeName = this.GetFieldValue(this.GetField(FieldNames.ActionType));
    if (actionTypeName == null) actionTypeName = ActionTypes.Default;
    var actionType = DataModel.FindActionType(actionTypeName);
    return actionType;
}

// helper for getting the first location associated with the item
Item.prototype.GetLocation = function () {
    var listItem = this.GetFieldValue(this.GetField(FieldNames.Locations));
    if (listItem != null) {
        var list = DataModel.GetItems(listItem.FolderID, listItem.ID, true);
        for (var id in list) {
            // return first item
            return list[id].GetFieldValue(list[id].GetField(FieldNames.EntityRef));
        }
    }
    return null;
}

// helper for getting the first location associated with the item
Item.prototype.GetContact = function () {
    var listItem = this.GetFieldValue(this.GetField(FieldNames.Contacts));
    if (listItem != null) {
        var list = DataModel.GetItems(listItem.FolderID, listItem.ID, true);
        for (var id in list) {
            // return first item
            return list[id].GetFieldValue(list[id].GetField(FieldNames.EntityRef));
        }
    }
    return null;
}

// helper for finding a phone number of an item (via locations or contacts)
Item.prototype.GetPhoneNumber = function () {
    var item = this.GetLocation();
    if (item == null) item = this.GetContact();
    if (item != null) {
        var phone = item.GetFieldValue(item.GetField(FieldNames.Phone));
        phone = phone.replace(/[^0-9]+/g, '');
        return phone;
    }
    return null;
}

// helper for finding a phone number of an item (via locations or contacts)
Item.prototype.GetMapLink = function () {
    var item = this.GetLocation();
    if (item == null) item = this.GetContact();
    if (item != null) {
        var json = item.GetFieldValue(FieldNames.WebLinks);
        if (json != null && json.length > 0) {
            var links = new LinkArray(json).Links();
            for (var i in links) {
                var link = links[i];
                if (link.Name == 'Map' && link.Url != null) {
                    return link;
                }
            }
        }
    }
    return null;
}

Item.prototype.Complete = function () {
    var updatedItem = this.Copy();
    updatedItem.Status = "Completed";
    updatedItem.SetFieldValue(this.GetField(FieldNames.Complete), true);
    // timestamp CompletedOn field
    if (updatedItem.HasField(FieldNames.CompletedOn)) {
        updatedItem.SetFieldValue(FieldNames.CompletedOn, new Date().format());
    }
    this.Update(updatedItem, null);
    // update the ActionType steps
    this.UpdateActionTypeSteps(updatedItem);
};

Item.prototype.UpdateActionTypeSteps = function (updatedItem) {
    var thisActionType = this.GetActionType();
    if (updatedItem.Status != StatusTypes.Active ||
        updatedItem.GetFieldValue(updatedItem.GetField(FieldNames.Complete))) {
        thisActionType.StepsMap.remove(this);
        thisActionType.Steps = thisActionType.StepsMap.Items;
        return;
    }
    if (thisActionType == updatedItem.GetActionType()) {
        thisActionType.StepsMap.update(updatedItem);
        thisActionType.Steps = thisActionType.StepsMap.Items;
    } else {
        thisActionType.StepsMap.remove(this);
        updatedItem.GetActionType().StepsMap.append(updatedItem);
    }
}

/*
 * 2012-08-17 OG: Below this point, the code is mostly for legacy reasons.
 * TODO: rip it out when I'm convinced I don't need it anymore.
 */

 /*
// ---------------------------------------------------------
// public members

NextStepsModel.Constants = {};
NextStepsModel.ActionTypes = {};
NextStepsModel.Steps = {};

// ---------------------------------------------------------
// private members

NextStepsModel.onDataChangedHandlers = {};
NextStepsModel.timeStamp = '/Date(0)/';

// ---------------------------------------------------------
// public methods

NextStepsModel.Init = function NextStepsModel$Init(jsonConstants, jsonNextStepsData) {
    this.processConstants($.parseJSON(jsonConstants));
    this.processNextStepsData($.parseJSON(jsonNextStepsData));
}

NextStepsModel.Close = function NextStepsModel$Close() {
    Service.Close();
}

NextStepsModel.AddDataChangedHandler = function (name, handler) {
    this.onDataChangedHandlers[name] = handler;
}

NextStepsModel.RemoveDataChangedHandler = function (name) {
    delete this.onDataChangedHandlers[name];
}

// generic helper for finding item for given ID
NextStepsModel.FindItem = function NextStepsModel$FindItem(itemID) {
    if (itemID != null) {
        var item = NextStepsModel.Steps[itemID];
        if (item != null) { return item; }
    }
    return null;
}

// generic helper for finding action type for given action type name
NextStepsModel.FindActionType = function NextStepsModel$FindActionType(actionTypeName) {
    if (actionTypeName != null) {
        var item = NextStepsModel.ActionTypes[actionTypeName];
        if (item != null) { return item; }
    }
    return null;
}

// generic helper for updating a folder or item, invokes server and updates local data model
NextStepsModel.UpdateItem = function NextStepsModel$UpdateItem(originalItem, updatedItem, activeItem) {
    if (originalItem != null && updatedItem != null) {
        // update local NextStepsModel immediately (fire datachanged)
        originalItem.update(updatedItem, activeItem)

        updatedItem.LastModified = NextStepsModel.timeStamp;                         // timestamp on server
        var resource = Service.ItemsResource;
        var data = [originalItem, updatedItem];

        Service.UpdateResource(resource, originalItem.ID, data,
            function (responseState) {                                          // successHandler
                var returnedItem = responseState.result;
                var success = originalItem.update(returnedItem, null);          // update local NextStepsModel (do not fire datachanged)
                // TODO: report failure to update
            });
        return true;
    }
    return false;
}

// ---------------------------------------------------------
// private methods

NextStepsModel.fireDataChanged = function (folderID, itemID) {
    for (var name in NextStepsModel.onDataChangedHandlers) {
        var handler = NextStepsModel.onDataChangedHandlers[name];
        if (typeof (handler) == "function") {
            handler(folderID, itemID);
        }
    }
}

NextStepsModel.processConstants = function NextStepsModel$processConstants(jsonParsed) {
    var constants = {};
    for (var key in jsonParsed) {
        constants[key] = jsonParsed[key];
    }

    // wrap ItemTypes in ItemMap
    // the ItemMap retains original storage array
    // the ItemMap.Items property provides associative array over storage
    var itemTypes = constants.ItemTypes;
    for (var i in itemTypes) {
        var itemType = ItemType.Extend(itemTypes[i]);      // extend with ItemType functions
        // lookup Fields by Name
        var fieldsByName = {};
        for (var j in itemType.Fields) {
            var field = itemType.Fields[j];
            field.ClassName = 'fn-' + field.Name.toLowerCase();
            field.Class = field.ClassName + ' dt-' + field.DisplayType.toLowerCase();
            fieldsByName[field.Name] = field;
        }
        itemType.Fields = fieldsByName;
        itemTypes[i] = itemType;
    }
    constants.ItemTypesMap = new ItemMap(itemTypes);
    constants.ItemTypes = constants.ItemTypesMap.Items;

    // key Priorities by Name
    constants.PrioritiesByName = {};
    for (var i in constants.Priorities) {
        var priority = constants.Priorities[i];
        constants.PrioritiesByName[priority.Name] = priority;
    }

    NextStepsModel.Constants = constants;
}

NextStepsModel.processNextStepsData = function NextStepsModel$processNextStepsData(jsonParsed) {
    // create an associative array of ActionType objects.  
    // each ActionType object contains an associative array of the Items of that ActionType
    var actionTypes = {};
    for (var key in ActionTypes) {
        actionTypes[key] = ActionType.Extend({ Name: ActionTypes[key], ID: ActionTypes[key] });
        actionTypes[key].steps = [];
    }

    // create an associative array over the action types 
    NextStepsModel.ActionTypesMap = new ItemMap(actionTypes);
    NextStepsModel.ActionTypes = NextStepsModel.ActionTypesMap.Items;

    // extend the step items passed in with Item functions
    var steps = [];
    for (var key in jsonParsed) {
        var step = Item.Extend(jsonParsed[key]);
        steps[key] = step;
        var actionType = step.GetActionType();
        var len = NextStepsModel.ActionTypes[actionType.Name].steps.length;
        NextStepsModel.ActionTypes[actionType.Name].steps[len++] = step;
    }

    // create an associative array over the steps in each action type
    for (var key in NextStepsModel.ActionTypes) {
        NextStepsModel.ActionTypes[key].StepsMap = new ItemMap(NextStepsModel.ActionTypes[key].steps);
        NextStepsModel.ActionTypes[key].Steps = NextStepsModel.ActionTypes[key].StepsMap.Items;
    }

    // create an associative array over the entire set of steps
    NextStepsModel.StepsMap = new ItemMap(steps);
    NextStepsModel.Steps = NextStepsModel.StepsMap.Items;
}

// ---------------------------------------------------------
// Item object - provides prototype functions for Item

function Item() { };
Item.Extend = function Item$Extend(item) { return $.extend(new Item(), item); }         // extend with Item prototypes

// Item public functions
Item.prototype.Copy = function () {                                                     // deep copy
    // sanity check, use most current Item in NextStepsModel if it exists
    var currentThis = NextStepsModel.FindItem(this.ID);
    return $.extend(true, new Item(), (currentThis == null) ? this : currentThis);
};         
Item.prototype.IsActionType = function () { return false; };
Item.prototype.GetItemType = function () { return NextStepsModel.Constants.ItemTypes[this.ItemTypeID]; };
Item.prototype.Update = function (updatedItem, activeItem) { return NextStepsModel.UpdateItem(this, updatedItem, activeItem); };
Item.prototype.HasField = function (name) { return this.GetItemType().HasField(name); };
Item.prototype.GetField = function (name) { return this.GetItemType().Fields[name]; };
Item.prototype.GetFields = function () { return this.GetItemType().Fields; };
Item.prototype.GetActionType = function () {
    var actionType = this.GetFieldValue(this.GetField(FieldNames.ActionType));
    if (actionType == null)
        actionType = NextStepsModel.FindActionType(ActionTypes.Default);
    return actionType;
}
Item.prototype.GetParentContainer = function () { return this.GetActionType(); };
Item.prototype.Complete = function () {
    var updatedItem = this.Copy();
    updatedItem.Status = "Completed";
    updatedItem.SetFieldValue(this.GetField(FieldNames.Complete), true);
    // timestamp CompletedOn field
    if (item.HasField(FieldNames.CompletedOn)) {
        updatedItem.SetFieldValue(FieldNames.CompletedOn, new Date().format());
    }
    this.Update(updatedItem, null);
};

Item.prototype.Refresh = function () {
    var thisItem = this;
    Service.GetResource(Service.ItemsResource, this.ID,
        function (responseState) {
            var refreshItem = responseState.result;
            if (refreshItem != null) {
                // do not fire data change
                thisItem.update(refreshItem, null);
            }
        });
}

Item.prototype.GetFieldValue = function (field, handler) {
    // field parameter can be either field name or field object
    if (typeof (field) == 'string') {
        field = this.GetField(field);
    }
    if (field != null && this.HasField(field.Name)) {
        if (field.Name == FieldNames.Name) {
            return this.Name;
        }
        for (var i in this.FieldValues) {
            var fv = this.FieldValues[i];
            if (fv.FieldName == field.Name) {
                if (fv.Value != null && field.FieldType == FieldTypes.Guid) {
                    // automatically attempt to dereference Guid values to a ActionType or Item
                    var item = NextStepsModel.FindItem(fv.Value);
                    if (item != null) { return item; }
                }
                // javascript only recognizes lowercase boolean values
                if (field.FieldType == FieldTypes.Boolean) {
                    if (typeof (fv.Value) == 'string') {
                        fv.Value = (fv.Value.toLowerCase() == 'true');
                    }
                }
                return fv.Value;
            }
        }
        //TODO: return default value based on FieldType
        if (field.FieldType == "Boolean") { return false; }
        return null;
    }
    return undefined;       // item does not have the field
};
Item.prototype.SetFieldValue = function (field, value) {
    // field parameter can be either field name or field object
    if (typeof (field) == 'string') {
        field = this.GetField(field);
    }
    if (field != null && this.HasField(field.Name)) {
        if (field.Name == FieldNames.Name) {
            this.Name = value;
            return true;
        }
        if (this.FieldValues == null) {
            this.FieldValues = [];
        }
        var updated = false;
        for (var i in this.FieldValues) {
            var fv = this.FieldValues[i];
            if (fv.FieldName == field.Name) {   // set existing field value
                fv.Value = value;
                updated = true;
                break;
            }
        }
        if (!updated) {                     // add field value
            this.FieldValues = this.FieldValues.concat(
                { FieldName: field.Name, ItemID: this.ID, Value: value });
        }
        return true;
    }
    return false;                           // item does not have the field
};
Item.prototype.AddReference = function (field, item, replace) {
    // field parameter can be either field name or field object
    if (typeof (field) == 'string') {
        field = this.GetField(field);
    }
    if (field != null && this.HasField(field.Name) && field.FieldType == FieldTypes.Guid) {

        var refList = this.GetFieldValue(field);
        if (refList != null) {
            if (replace == true) {
                return this.replaceReference(refList, item);
            } else {
                return this.addReference(refList, item);
            }
        } else {
            // create refList and addReference in success handler
            var thisItem = this;
            var newRefList = {
                Name: field.Name, IsList: true, ItemTypeID: ItemTypes.Reference,
                FolderID: thisItem.FolderID, ParentID: thisItem.ID, UserID: thisItem.UserID
            };
            Service.InsertResource(Service.ItemsResource, newRefList,
                function (responseState) {
                    var insertedRefList = responseState.result;
                    thisItem.addItem(insertedRefList, null);
                    insertedRefList = NextStepsModel.FindItem(insertedRefList.ID);
                    thisItem.addReference(insertedRefList, item);
                    var thisUpdatedItem = $.extend({}, thisItem);
                    thisUpdatedItem.SetFieldValue(field.Name, insertedRefList.ID);
                    thisItem.Update(thisUpdatedItem);
                });
        }
        return true;
    }
    return false;       // failed to add reference
};
Item.prototype.RemoveReferences = function (field) {
    // field parameter can be either field name or field object
    if (typeof (field) == 'string') {
        field = this.GetField(field);
    }
    if (field != null && this.HasField(field.Name) && field.FieldType == FieldTypes.Guid) {
        var refList = this.GetFieldValue(field);
        if (refList != null && refList.IsList) {
            // remove all references
            var itemRefs = refList.GetItems();
            for (var id in itemRefs) {
                var itemRef = itemRefs[id];
                itemRef.Delete();
            }
        }
        return true;
    }
    return false;       // failed to remove references
};

// Item private functions
Item.prototype.addItem = function (newItem, activeItem) { this.GetActionType().addItem(newItem, activeItem); };
Item.prototype.update = function (updatedItem, activeItem) {
    if (this.ID == updatedItem.ID) {
        updatedItem = Item.Extend(updatedItem);         // extend with Item functions
        var thisActionType = this.GetActionType();
        if (thisActionType == updatedItem.GetActionType()) {
            thisActionType.StepsMap.update(updatedItem);
            thisActionType.Items = thisActionType.StepsMap.Items;
        } else {
            thisActionType.ItemsMap.remove(this);
            updatedItem.GetActionType().ItemsMap.append(updatedItem);
        }
        if (activeItem === undefined) {
            NextStepsModel.fireDataChanged(thisActionType, this.ID);
        } else if (activeItem != null) {
            NextStepsModel.fireDataChanged(thisActionType, activeItem.ID);
        }
        return true;
    }
    return false;
};
Item.prototype.selectNextItem = function () {
    var parent = this.GetParent();
    var parentItems = (parent == null) ? this.GetActionType().GetItems() : parent.GetItems();
    var myIndex = ItemMap.indexOf(parentItems, this.ID);
    var nextItem = ItemMap.itemAt(parentItems, myIndex + 1);
    if (nextItem != null) {
        return nextItem;
    } else if (myIndex == 0) {
        if (parent != null) { return parent; }
    } else {
        var prevItem = ItemMap.itemAt(parentItems, myIndex - 1);
        if (prevItem != null) { return prevItem; }
    }
    return null;
}


// ---------------------------------------------------------
// ItemType object - provides prototype functions for ItemType

function ItemType() { }
ItemType.Extend = function ItemType$Extend(itemType) { return $.extend(new ItemType(), itemType); }     // extend with ItemType prototypes
ItemType.prototype.HasField = function (name) { return (this.Fields.hasOwnProperty(name)); };

// ---------------------------------------------------------
// ItemMap object - provides associative array over array
// (all items in array MUST have an ID property)
//
// NOTE: 
// Maintains original storage of array
// Items property is associative array with ID access
//
function ItemMap(array) {
    this.array = array;
    this.updateMap();
}

ItemMap.prototype.updateMap = function () {
    this.Items = {};
    for (var i in this.array) {
        if (this.array[i].hasOwnProperty('ID')) {
            this.Items[this.array[i].ID] = this.array[i];
        } else {
            throw ItemMap.errorMustHaveID;
        }
    }
}

ItemMap.prototype.indexOf = function (item) {
    for (var i in this.array) {
        if (this.array[i].ID == item.ID) {
            return i;
        }
    }
    return -1;
}

ItemMap.prototype.itemAt = function (index) {
    if (index < 0) {                            // return last item for negative index
        return this.array[this.array.length - 1];
    }
    if (index < this.array.length) {           
        return this.array[index];
    }
    return null;                                // return null if index out of range
}

ItemMap.prototype.append = function (item) {
    if (item.hasOwnProperty('ID')) {
        this.array = this.array.concat(item);
        this.Items[item.ID] = this.array[this.array.length - 1];
    } else {
        throw ItemMap.errorMustHaveID;
    }
}

ItemMap.prototype.update = function (item) {
    if (item.hasOwnProperty('ID')) {
        var index = this.indexOf(item);
        var currentItem = this.itemAt(index);
        if (item.hasOwnProperty('SortOrder') && currentItem.hasOwnProperty('SortOrder') &&
            (item.SortOrder != currentItem.SortOrder)) {
            // move item to correct position in array
            this.array.splice(index, 1);
            for (var i in this.array) {
                if (this.array[i].hasOwnProperty('SortOrder') && item.SortOrder < this.array[i].SortOrder) {
                    this.array.splice(i, 0, item);
                    this.updateMap();
                    return;
                }
            }
            this.array.push(item);
            this.updateMap();
        } else {
            this.array[index] = item;
            this.Items[item.ID] = this.array[index];
        }
    } else {
        throw ItemMap.errorMustHaveID;
    }
}

ItemMap.prototype.remove = function (item) {
    if (item.hasOwnProperty('ID')) {
        var index = this.indexOf(item);
        if (index >= 0) {
            this.array.splice(index, 1);
            delete this.Items[item.ID];
        }
    } else {
        throw ItemMap.errorMustHaveID;
    }
}

// ---------------------------------------------------------
// static members

ItemMap.count = function (map) {
    var i = 0, key;
    for (key in map) {
        if (map.hasOwnProperty(key)) i++;
    }
    return i;
}

ItemMap.indexOf = function (map, id) {
    var index = -1, i = 0;
    for (var key in map) {
        if (key == id) { index = i; break; }
        i++;
    }
    return index;
}

ItemMap.itemAt = function (map, index) {
    for (var key in map) {
        var item = map[key];
        if (index-- == 0) { return item; }
    }
    // negative index will return last item
    return (index < 0) ? item : null;
}

ItemMap.errorMustHaveID = 'ItemMap requires all items in array to have an ID property.';

// ---------------------------------------------------------
// LinkArray object - array of Link objects 
// [{Name:"name", Url:"link"}]
function LinkArray(json) {
    this.links = [];
    if (json != null && json.length > 0) {
        this.links = $.parseJSON(json); 
    }
}

LinkArray.prototype.Links = function () { return this.links; }
LinkArray.prototype.ToJson = function () { return JSON.stringify(this.links); }
LinkArray.prototype.Remove = function (index) { this.links.splice(index, 1); }
LinkArray.prototype.Add = function (link, name) {
    if (name != null) {                             
        // both name and link provided explicitly 
        this.links.push({ Name: name, Url: link });
        return this.links;
    }
    // check for name,link syntax
    var split = link.split(',');                    
    if (split.length > 1) {
        name = $.trim(split[0]);
        link = $.trim(split[1]);
        this.links.push({ Name: name, Url: link });
    } else {
        this.links.push({ Url: link });
    }
    return this.links;
}
LinkArray.prototype.ToText = function () {
    var text = '';
    for (var i in this.links) {
        var link = this.links[i];
        if (link.hasOwnProperty('Name')) {
            if (link.Name != null && link.Name.length > 0 && link.Name != link.Url) {
                text += link.Name + ', ';
            }
        }
        text += link.Url + '\r\n';
    }
    return text;
}
LinkArray.prototype.Parse = function (text) {
    var lines = text.split(/\r\n|\r|\n/g);
    for (var i in lines) {
        var parts = lines[i].split(',');
        if (parts.length == 1 && parts[0].length > 0) { this.links.push({ Url: parts[0] }); }
        if (parts.length == 2) { this.links.push({ Name: parts[0], Url: parts[1] }); }
    }
}

*/