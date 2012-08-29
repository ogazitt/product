//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// entities.js
// this file contains the definitions for some shared objects:
// Folder, Item, ItemMap, LinkArray, UserSettings

// ---------------------------------------------------------
// Folder object - provides prototype functions for Folder

function Folder() { };
Folder.Extend = function Folder$Extend(folder) { return $.extend(new Folder(), folder); }   // extend with Folder prototypes

// Folder public functions
// do not deep copy, remove Items collection, copy is for updating Folder entity only
Folder.prototype.Copy = function () { var copy = $.extend(new Folder(), this); copy.Items = {}; copy.ItemsMap = {}; return copy; };
Folder.prototype.IsFolder = function () { return true; };
Folder.prototype.IsCategory = function () { return (this.ItemTypeID == ItemTypes.Category); };
Folder.prototype.IsActivity = function () { return (this.ItemTypeID == ItemTypes.Activity); };
Folder.prototype.IsDefault = function () {
    var defaultList = DataModel.UserSettings.GetDefaultList(this.ItemTypeID);
    if (defaultList != null) {
        return (defaultList.IsFolder()) ? (this.ID == defaultList.ID) : (this.ID == defaultList.FolderID);
    }
    return false;
};
Folder.prototype.IsSelected = function () { return DataModel.UserSettings.IsFolderSelected(this.ID); };
Folder.prototype.IsExpanded = function () { return DataModel.UserSettings.IsFolderExpanded(this.ID); };
Folder.prototype.Expand = function (expand) { DataModel.UserSettings.ExpandFolder(this.ID, expand); };
Folder.prototype.GetItemType = function () { return DataModel.Constants.ItemTypes[this.ItemTypeID]; };
Folder.prototype.GetItems = function (excludeListItems) { return DataModel.GetItems(this, null, excludeListItems); };
Folder.prototype.GetItem = function (itemID) { return this.Items[itemID]; }
Folder.prototype.GetItemByName = function (name, parentID) {
    for (id in this.Items) {
        var item = this.Items[id];
        if (item.Name == name) {
            if (parentID === undefined || item.ParentID == parentID) { return item; }
        }
    }
    return null;
}
// assumes the item being looked for is ItemTypes.NameValue or ItemTypes.Reference
Folder.prototype.GetItemByValue = function (value, parentID) {
    for (id in this.Items) {
        var item = this.Items[id];
        if (item.ItemTypeID == ItemTypes.NameValue || item.ItemTypeID == ItemTypes.Reference) {
            if (value == item.GetFieldValue(FieldNames.Value) &&
                (parentID === undefined || item.ParentID == parentID)) {
                return item;
            }
        }
    }
    return null;
}
Folder.prototype.GetSelectedItem = function () {
    for (id in this.Items) {
        if (DataModel.UserSettings.IsItemSelected(id) == true) { return this.Items[id]; }
    }
    return null;
}
Folder.prototype.InsertItem = function (newItem, adjacentItem, insertBefore, activeItem) { return DataModel.InsertItem(newItem, this, adjacentItem, insertBefore, activeItem); };
Folder.prototype.Update = function (updatedFolder) { return DataModel.UpdateItem(this, updatedFolder); };
Folder.prototype.Delete = function () { return DataModel.DeleteItem(this); };
// Folder private functions
Folder.prototype.addItem = function (newItem, activeItem) {
    newItem = Item.Extend(newItem);                    // extend with Item functions
    if (this.ItemsMap == null) {
        this.ItemsMap = new ItemMap([newItem]);
        this.Items = this.ItemsMap.Items;
    } else {
        this.ItemsMap.append(newItem);
    }
    if (activeItem === undefined) {                             // default, fire event with new List or parent List
        var itemID = (newItem.IsList) ? newItem.ID : newItem.ID; //.ParentID;
        DataModel.fireDataChanged(this.ID, itemID);
    } else if (activeItem != null) {                            // fire event with activeItem
        DataModel.fireDataChanged(activeItem.FolderID, activeItem.ID);
    }                                                           // null, do not fire event
};
Folder.prototype.update = function (updatedFolder) {
    if (this.ID == updatedFolder.ID) {
        updatedFolder = Folder.Extend(updatedFolder);  // extend with Folder functions
        updatedFolder.ItemsMap = this.ItemsMap;
        updatedFolder.Items = this.ItemsMap.Items;
        updatedFolder.FolderUsers = this.FolderUsers;
        DataModel.FoldersMap.update(updatedFolder);
        DataModel.Folders = DataModel.FoldersMap.Items;
        DataModel.fireDataChanged(this.ID);
        return true;
    }
    return false;
};

// ---------------------------------------------------------
// Item object - provides prototype functions for Item

function Item() { };
Item.Extend = function Item$Extend(item) { return $.extend(new Item(), item); }         // extend with Item prototypes

// Item public functions
Item.prototype.Copy = function () {                                                     // deep copy
    // sanity check, use most current Item in DataModel if it exists
    var folder = this.GetFolder();
    var currentThis = (folder == null) ? this : folder.GetItem(this.ID);
    return $.extend(true, new Item(), (currentThis == null) ? this : currentThis);
};
Item.prototype.IsFolder = function () { return false; };
Item.prototype.IsDefault = function () {
    var defaultList = DataModel.UserSettings.GetDefaultList(this.ItemTypeID);
    if (defaultList != null) { return (this.ID == defaultList.ID); }
    return false;
};
Item.prototype.Select = function () { return DataModel.UserSettings.Selection(this.FolderID, this.ID); };
Item.prototype.IsSelected = function (includingChildren) { return DataModel.UserSettings.IsItemSelected(this.ID, includingChildren); };
Item.prototype.GetFolder = function () { return (DataModel.getFolder(this.FolderID)); };
Item.prototype.GetParent = function () { return (this.ParentID == null) ? null : this.GetFolder().Items[this.ParentID]; };
Item.prototype.GetParentContainer = function () { return (this.ParentID == null) ? this.GetFolder() : this.GetParent(); };
Item.prototype.GetItemType = function () { return DataModel.Constants.ItemTypes[this.ItemTypeID]; };
Item.prototype.GetItems = function (excludeListItems) { return DataModel.GetItems(this.FolderID, this.ID, excludeListItems); };
Item.prototype.InsertItem = function (newItem, adjacentItem, insertBefore, activeItem) { return DataModel.InsertItem(newItem, this, adjacentItem, insertBefore, activeItem); };
Item.prototype.Update = function (updatedItem, activeItem) { return DataModel.UpdateItem(this, updatedItem, activeItem); };
Item.prototype.Delete = function (activeItem) { return DataModel.DeleteItem(this, activeItem); };
Item.prototype.HasField = function (name) { return this.GetItemType().HasField(name); };
Item.prototype.GetField = function (name) { return this.GetItemType().Fields[name]; };
Item.prototype.GetFields = function () { return this.GetItemType().Fields; };

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
        if (field.Name == FieldNames.Complete) {
            return (this.Status == StatusTypes.Complete);
        }
        for (var i in this.FieldValues) {
            var fv = this.FieldValues[i];
            if (fv.FieldName == field.Name) {
                if (fv.Value != null && field.FieldType == FieldTypes.Guid) {
                    // automatically attempt to dereference Guid values to a Folder or Item
                    var item = DataModel.FindItem(fv.Value);
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
        if (field.Name == FieldNames.Complete) {
            this.Status = (value == true) ? StatusTypes.Complete : null;
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
                    insertedRefList = DataModel.FindItem(insertedRefList.ID);
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

Item.prototype.GetActionType = function () {
    var actionTypeName = this.GetFieldValue(FieldNames.ActionType);
    if (actionTypeName == null) actionTypeName = ActionTypes.Remind;
    var actionType = DataModel.FindActionType(actionTypeName);
    return actionType;
}
// helper for getting the first location associated with the item
Item.prototype.GetLocation = function () {
    var listItem = this.GetFieldValue(FieldNames.Locations);
    if (listItem != null) {
        var list = DataModel.GetItems(listItem.FolderID, listItem.ID, true);
        for (var id in list) {
            // return first item
            return list[id].GetFieldValue(FieldNames.EntityRef);
        }
    }
    return null;
}
// helper for getting the first location associated with the item
Item.prototype.GetContact = function () {
    var listItem = this.GetFieldValue(FieldNames.Contacts);
    if (listItem != null) {
        var list = DataModel.GetItems(listItem.FolderID, listItem.ID, true);
        for (var id in list) {
            // return first item
            return list[id].GetFieldValue(FieldNames.EntityRef);
        }
    }
    return null;
}
// helper for finding a phone number of an item (via locations or contacts)
Item.prototype.GetPhoneNumber = function () {
    var item = this.GetLocation();
    if (item == null) item = this.GetContact();
    if (item != null) {
        var phone = item.GetFieldValue(FieldNames.Phone);
        if (phone != null) phone = phone.replace(/[^0-9]+/g, '');
        return phone;
    }
    return null;
}
// helper for finding an email of an item (via locations or contacts)
Item.prototype.GetEmail = function () {
    var item = this.GetLocation();
    if (item == null) item = this.GetContact();
    if (item != null) {
        var email = item.GetFieldValue(FieldNames.Email);
        return email;
    }
    return null;
}
// helper for finding a map link (via locations or contacts)
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

// Item.Status helpers
Item.prototype.UpdateStatus = function (status, activeItem) { var copy = this.Copy(); copy.Status = status; return this.Update(copy, activeItem); };
Item.prototype.IsNullStatus = function () { return (this.Status == null); };
Item.prototype.IsActive = function () { return (this.Status == StatusTypes.Active); };
Item.prototype.IsComplete = function () { return (this.Status == StatusTypes.Complete); };
Item.prototype.IsPaused = function () { return (this.Status == StatusTypes.Paused); };
Item.prototype.IsSkipped = function () { return (this.Status == StatusTypes.Skipped); };

// Activity and Step Item helpers
Item.prototype.IsCategory = function () { return (this.ItemTypeID == ItemTypes.Category); };
Item.prototype.IsActivity = function () { return (this.ItemTypeID == ItemTypes.Activity); };
Item.prototype.IsStep = function () { return (this.ItemTypeID == ItemTypes.Step); };

// helper for marking item complete and marking next item active
Item.prototype.Complete = function () {
    var copy = this.Copy();
    copy.Status = StatusTypes.Complete;
    if (copy.HasField(FieldNames.CompletedOn)) {
        copy.SetFieldValue(FieldNames.CompletedOn, new Date().format());
    }

    // make next step active and set due date
    var nextStep = this.nextItem();
    if (nextStep != null && nextStep.IsStep()) {
        this.Update(copy, null);
        nextStep.Active(this.GetFieldValue(FieldNames.DueDate));
    } else {
        this.Update(copy);
    }
}
// helper for marking item skipped and marking next item active
Item.prototype.Skip = function () {
    this.UpdateStatus(StatusTypes.Skipped, null);
    // find the next step in the Activity and make it Active
    var nextStep = this.nextItem();
    if (nextStep != null && nextStep.IsStep()) {
        nextStep.Active(this.GetFieldValue(FieldNames.DueDate));
    } 
}
// helper for marking item paused and marking first active child item paused
Item.prototype.Pause = function () {
    // TODO: this should only iterate 'current' steps
    var steps = this.GetItems(true);
    for (var id in steps) {
        var step = steps[id];
        if (step.IsActive()) {
            step.UpdateStatus(StatusTypes.Paused, null);
            break;
        }
    }
    this.UpdateStatus(StatusTypes.Paused);
}
// helper for marking item active and marking appropriate child item active
// if due date is required, item requiring due date will be returned
Item.prototype.Active = function (newDueDate) {
    var steps = this.GetItems(true);
    if (ItemMap.count(steps) == 0) {
        var dueDate = (newDueDate != null) ? newDueDate : this.GetFieldValue(FieldNames.DueDate);
        if (dueDate == null || dueDate.length == 0) {
            return this;
        } else {
            // always update due date, in case new date was provided
            var copy = this.Copy();
            copy.Status = StatusTypes.Active;
            copy.SetFieldValue(FieldNames.DueDate, dueDate);
            this.Update(copy);
            return null;
        }
    }

    // TODO: this should only iterate 'current' steps
    var prevStep = null;
    for (var id in steps) {
        var step = steps[id];
        if (step.IsPaused()) {
            // mark first paused step active
            step.UpdateStatus(StatusTypes.Active, null);
            this.UpdateStatus(StatusTypes.Active);
            return null;
        }
        if (step.IsNullStatus()) {
            // mark first null step active
            var dueDate = (newDueDate != null) ? newDueDate : step.GetFieldValue(FieldNames.DueDate);
            if (dueDate == null || dueDate.length == 0) {
                if (prevStep != null) {         // try using due date of previous step
                    dueDate = prevStep.GetFieldValue(FieldNames.DueDate);
                } else {                        // try using due date of parent activity
                    dueDate = this.GetFieldValue(FieldNames.DueDate);
                }
            }
            if (dueDate != null && dueDate.length > 0) {
                var copy = step.Copy();
                copy.Status = StatusTypes.Active;
                copy.SetFieldValue(FieldNames.DueDate, dueDate);
                step.Update(copy, null);
                this.UpdateStatus(StatusTypes.Active);
                return null;
            } else {
                return step;
            }
        }
        prevStep = step;
    }

    return null;
}

// Item private functions
Item.prototype.addItem = function (newItem, activeItem) { this.GetFolder().addItem(newItem, activeItem); };
Item.prototype.update = function (updatedItem, activeItem) {
    if (this.ID == updatedItem.ID) {
        updatedItem = Item.Extend(updatedItem);         // extend with Item functions
        var thisFolder = this.GetFolder();
        if (this.FolderID == updatedItem.FolderID) {
            thisFolder.ItemsMap.update(updatedItem);
            thisFolder.Items = thisFolder.ItemsMap.Items;
        } else {
            thisFolder.ItemsMap.remove(this);
            updatedItem.GetFolder().ItemsMap.append(updatedItem);
        }
        if (activeItem === undefined) {
            DataModel.fireDataChanged(this.FolderID, this.ID);
        } else if (activeItem != null) {
            DataModel.fireDataChanged(this.FolderID, activeItem.ID);
        }
        return true;
    }
    return false;
};
Item.prototype.nextItem = function () {
    var parent = this.GetParent();
    var parentItems = (parent == null) ? this.GetFolder().GetItems() : parent.GetItems();
    var myIndex = ItemMap.indexOf(parentItems, this.ID);
    var nextItem = ItemMap.itemAt(parentItems, myIndex + 1);
    return nextItem;
}
Item.prototype.selectNextItem = function () {
    var parent = this.GetParent();
    var parentItems = (parent == null) ? this.GetFolder().GetItems() : parent.GetItems();
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
Item.prototype.addReference = function (refList, itemToRef) {
    if (refList.IsList) {
        // create and insert the item reference
        var itemRef = Item.Extend(
        {
            Name: itemToRef.Name,
            ItemTypeID: ItemTypes.Reference,
            FolderID: refList.FolderID,
            ParentID: refList.ID,
            UserID: refList.UserID
        });
        itemRef.SetFieldValue(FieldNames.EntityRef, itemToRef.ID);
        itemRef.SetFieldValue(FieldNames.EntityType, EntityTypes.Item);
        refList.InsertItem(itemRef, null, null, null);
        return true;
    }
    return false;
}
Item.prototype.replaceReference = function (refList, itemToRef) {
    if (refList.IsList) {
        // replace reference
        var itemRefs = refList.GetItems();
        for (var id in itemRefs) {
            var itemRef = itemRefs[id];
            var updatedItemRef = itemRef.Copy();
            updatedItemRef.SetFieldValue(FieldNames.EntityRef, itemToRef.ID);
            itemRef.Update(updatedItemRef, refList.GetParent());
            return true;
        }
        return this.addReference(refList, itemToRef);
    }
    return false;
}

// ---------------------------------------------------------
// ActionType object - provides prototype functions for ActionType

function ActionType() { };
ActionType.Extend = function ActionType$Extend(actionType) { return $.extend(new ActionType(), actionType); }  // extend with ActionType prototypes

// ActionType public functions
ActionType.prototype.Copy = function () { var copy = $.extend(new ActionType(), this); return copy; };
ActionType.prototype.GetSteps = function (sort, status) {
    if (status === undefined) status = StatusTypes.Active;
    var steps = [];
    var index = 0;
    for (var i in DataModel.Folders) {
        var folder = DataModel.Folders[i];
        for (var j in folder.Items) {
            var item = folder.Items[j];
            if (item.IsStep()) {
                if (this.Name == ActionTypes.All || item.GetActionType() === this) {
                    if (item.Status == status) steps[index++] = item;
                }
            }
        }
    }
    steps.sort(function (a, b) {
        var dueA = a.GetFieldValue(FieldNames.DueDate);
        var dueB = b.GetFieldValue(FieldNames.DueDate);
        if (dueA == dueB) return 0;
        if (dueA == null) return 1;
        if (dueB == null) return -1;
        var dueDateA = new Date(dueA);
        var dueDateB = new Date(dueB);
        if (dueDateA == dueDateB) return 0;
        if (dueDateA > dueDateB) return 1;
        return -1;
    });
    return steps;
}

// ---------------------------------------------------------
// Appointment object - provides prototype functions for Appointment

function Appointment() { };
Appointment.Extend = function Appointment$Extend(appt) { return $.extend(new Appointment(), appt); }  // extend with Appointment prototypes

// Appointment public functions
Appointment.prototype.Copy = function () { var copy = $.extend(new Appointment(), this); return copy; };


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

// ---------------------------------------------------------
// UserSettings object - provides prototype functions

function UserSettings(clientFolder, webClientFolder) {
    this.clientFolder = clientFolder;
    this.webClientFolder = webClientFolder;

    this.init(UserSettings.viewStateName, UserSettings.viewStateKey);
    this.init(UserSettings.preferencesName, UserSettings.preferencesKey);
}

UserSettings.defaultListsKey = 'DefaultLists';
UserSettings.viewStateName = 'ViewState';
UserSettings.viewStateKey = 'WebViewState';
UserSettings.preferencesName = 'Preferences';
UserSettings.preferencesKey = 'WebPreferences';

UserSettings.prototype.GetFolder = function (folderID) {
    if (this.clientFolder.ID == folderID) { return this.clientFolder; }
    if (this.webClientFolder.ID == folderID) { return this.webClientFolder; }
    return null;
}

UserSettings.prototype.GetDefaultList = function (itemType) {
    var defaultLists = this.clientFolder.GetItemByName(UserSettings.defaultListsKey);
    if (defaultLists != null) {
        var defaultList = this.clientFolder.GetItemByValue(itemType, defaultLists.ID);
        if (defaultList != null) {
            var list = defaultList.GetFieldValue(FieldNames.EntityRef);
            if (typeof (list) == 'object') { return list; }
        }
    }
    // find first folder for itemType
    var folder;
    for (id in DataModel.Folders) {
        folder = DataModel.Folders[id];
        if (folder.ItemTypeID == itemType) {
            return folder;
        }
    }
    // default to last folder
    return folder;
}

UserSettings.prototype.Selection = function (folderID, itemID) {
    this.ViewState.SelectedFolder = folderID;
    this.ViewState.SelectedItem = itemID;
}

UserSettings.prototype.IsFolderSelected = function (folderID) {
    return (this.ViewState.SelectedFolder == folderID);
}

UserSettings.prototype.IsItemSelected = function (itemID, includingChildren) {
    if (includingChildren == true) {
        var item = DataModel.FindItem(this.ViewState.SelectedItem);
        if (item != null && item.ParentID == itemID) { return true; }
    }
    return (this.ViewState.SelectedItem == itemID);
}

UserSettings.prototype.ExpandFolder = function (folderID, expand) {
    if (this.ViewState.ExpandedFolders == null) { this.ViewState.ExpandedFolders = {}; }
    if (expand == true) { this.ViewState.ExpandedFolders[folderID] = true; }
    else { delete this.ViewState.ExpandedFolders[folderID]; }
}

UserSettings.prototype.IsFolderExpanded = function (folderID) {
    return (this.ViewState.ExpandedFolders != null && this.ViewState.ExpandedFolders[folderID] == true);
}

UserSettings.prototype.Save = function () {
    // remove deleted folders from expanded folders list
    var expanded = {};
    for (var id in DataModel.Folders) {
        if (DataModel.Folders[id].IsExpanded()) { expanded[id] = true; }
    }
    this.ViewState.ExpandedFolders = expanded;
    this.update(UserSettings.viewStateName, UserSettings.viewStateKey);
}

UserSettings.prototype.UpdateTheme = function (theme) {
    if (this.Preferences.Theme != theme) {
        this.Preferences.Theme = theme;
        this.update(UserSettings.preferencesName, UserSettings.preferencesKey);
        Service.ChangeTheme(theme);
    }
}

UserSettings.prototype.init = function (name, itemKey) {
    var itemName = 'item' + name;
    if (this.webClientFolder != null) {
        this[itemName] = this.webClientFolder.GetItemByName(itemKey, null);
    }
    if (this[itemName] == null) {
        this[name] = {};
        if (this.webClientFolder != null) {
            this.webClientFolder.InsertItem(Item.Extend({ Name: itemKey, ItemTypeID: ItemTypes.NameValue }), null, null, null);
        }
    } else {
        var value = this[itemName].GetFieldValue(FieldNames.Value);
        this[name] = (value == null) ? {} : $.parseJSON(value);
    }
}

UserSettings.prototype.update = function (name, itemKey) {
    if (this.webClientFolder != null) {
        var itemName = 'item' + name;
        if (this[itemName] == null) {
            this[itemName] = this.webClientFolder.GetItemByName(itemKey, null);
        }
        var updatedItem = this[itemName].Copy();
        updatedItem.SetFieldValue(FieldNames.Value, JSON.stringify(this[name]));
        this[itemName].Update(updatedItem);
    }
}
