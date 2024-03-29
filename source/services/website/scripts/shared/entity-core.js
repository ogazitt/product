﻿//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// entity-core.js
//
// Objects for core entity types: Folder, Item, ItemType, ItemMap
//

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
Folder.prototype.IsRunning = function () { return false; };
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
Folder.prototype.GetItems = function (excludeListItems, group) { return DataModel.GetItems(this, null, excludeListItems, group); };
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

// ---------------------------------------------------------
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
        DataModel.fireDataChanged(this.ID, itemID, DataChangeTypes.Insert);
    } else if (activeItem != null) {                            // fire event with activeItem
        DataModel.fireDataChanged(activeItem.FolderID, activeItem.ID, DataChangeTypes.Insert);
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
        DataModel.fireDataChanged(this.ID, null, DataChangeTypes.Insert);
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
Item.prototype.GetItems = function (excludeListItems, group) { return DataModel.GetItems(this.FolderID, this.ID, excludeListItems, group); };
Item.prototype.InsertItem = function (newItem, adjacentItem, insertBefore, activeItem) { return DataModel.InsertItem(newItem, this, adjacentItem, insertBefore, activeItem); };
Item.prototype.Update = function (updatedItem, activeItem) { return DataModel.UpdateItem(this, updatedItem, activeItem); };
Item.prototype.Delete = function (activeItem) { return DataModel.DeleteItem(this, activeItem); };
Item.prototype.HasField = function (name) { return this.GetItemType().HasField(name); };
Item.prototype.HasExtendedField = function (name) {
    for (var i in this.FieldValues) {
        if (this.FieldValues[i].FieldName == name) { return true; }
    } 
    return false;
};
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
        var f = this.GetField(field);
        if (f == null) { f = { Name: field, FieldType: FieldTypes.String }; }
        field = f;
    }
    if (field != null && (this.HasField(field.Name) || this.HasExtendedField(field.Name))) {
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
                if (field.FieldType == FieldTypes.Boolean) {
                    // javascript only recognizes lowercase boolean values
                    if (typeof (fv.Value) == 'string') {
                        fv.Value = (fv.Value.toLowerCase() == 'true');
                    }
                }
                if (field.FieldType == FieldTypes.DateTime) {
                    // convert to javascript date object
                    if (typeof (fv.Value) == 'string') {
                        fv.Value = new Date().parseSafe(fv.Value)
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
        var f = this.GetField(field);
        if (f == null) { f = { Name: field, FieldType: FieldTypes.String }; }
        field = f;
    }
    // allow extended fields to be added
    //if (field != null && (extended || this.HasField(field.Name) || this.HasExtendedField(field.Name))) {
    if (field != null) {
        if (field.Name == FieldNames.Name) {
            this.Name = value;
            return true;
        }
        if (field.Name == FieldNames.Complete) {
            this.Status = (value == true) ? StatusTypes.Complete : null;
            return true;
        }
        if (field.FieldType == FieldTypes.DateTime || typeof (value) == 'date') {
            // convert date to UTC string format
            value = Date.formatUTC(value);
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
                return this.addReference(refList, item, true);
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

// ---------------------------------------------------------
// Location and Contact Item helpers
Item.prototype.IsLocation = function () { return (this.ItemTypeID == ItemTypes.Location); };
Item.prototype.IsContact = function () { return (this.ItemTypeID == ItemTypes.Contact); };

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
    // if item doesn't have a location, try the parent
    var parent = this.GetParent();
    if (parent != null) {
        listItem = parent.GetFieldValue(FieldNames.Locations);
        if (listItem != null) {
            list = DataModel.GetItems(listItem.FolderID, listItem.ID, true);
            for (var id in list) {
                // return first item
                return list[id].GetFieldValue(FieldNames.EntityRef);
            }
        }
    }
    return null;
}
// helper for getting the first contact associated with the item
Item.prototype.GetContact = function () {
    var listItem = this.GetFieldValue(FieldNames.Contacts);
    if (listItem != null) {
        var list = DataModel.GetItems(listItem.FolderID, listItem.ID, true);
        for (var id in list) {
            // return first item
            return list[id].GetFieldValue(FieldNames.EntityRef);
        }
    }
    // if item doesn't have a contact, try the parent
    var parent = this.GetParent();
    if (parent != null) {
        listItem = parent.GetFieldValue(FieldNames.Locations);
        if (listItem != null) {
            list = DataModel.GetItems(listItem.FolderID, listItem.ID, true);
            for (var id in list) {
                // return first item
                return list[id].GetFieldValue(FieldNames.EntityRef);
            }
        }
    }
    return null;
}
// helper for finding a phone number of an item (via locations or contacts)
Item.prototype.GetPhoneNumber = function () {
    if (this.HasField(FieldNames.Phone)) { return this.GetFieldValue(FieldNames.Phone); };
    if (this.IsActivity() || this.IsStep()) {
        var item = this.GetLocation();
        if (item != null) { 
            var value = item.GetFieldValue(FieldNames.Phone);
            if (value != null) { return value; }
        }
        item = this.GetContact();
        if (item != null) { return item.GetFieldValue(FieldNames.Phone) };
    }
    return null;
}
// helper for finding an email of an item (via locations or contacts)
Item.prototype.GetEmail = function () {
    if (this.HasField(FieldNames.Email)) { return this.GetFieldValue(FieldNames.Email); };
    if (this.IsActivity() || this.IsStep()) {
        var item = this.GetLocation();
        if (item != null) { 
            var value = item.GetFieldValue(FieldNames.Email);
            if (value != null) { return value; }
        }
        item = this.GetContact();
        if (item != null) { return item.GetFieldValue(FieldNames.Email) };
    }
    return null;
}
// helper for finding a map link (via locations or contacts)
Item.prototype.GetMapLink = function () {
    var getmaplink = function (item) {
        if (item != null) {
            var address = item.GetFieldValue(FieldNames.Address);
            if (address != null) {
                if (Browser.IsMobile()) { return 'maps:' + escape(address); }
                else { return 'http://maps.google.com/?q=' + escape(address); }
            }
            // if address field not found, look for map link
            var json = item.GetFieldValue(FieldNames.WebLinks);
            if (json != null && json.length > 0) {
                var links = new LinkArray(json).Links();
                for (var i in links) {
                    var link = links[i];
                    if (link.Name == 'Map' && link.Url != null) {
                        return link.Url;
                    }
                }
            }
        }
    };
    if (this.HasField(FieldNames.Address)) { return getmaplink(this); };
    if (this.HasField(FieldNames.Locations)) {
        var item = this.GetLocation();
        if (item != null) {
            var link = getmaplink(item);
            if (link != null) { return link; }
        }
        item = this.GetContact();
        if (item != null) { return getmaplink(item); }
    }
    return null;
}

// ---------------------------------------------------------
// Item.Status helpers
Item.prototype.UpdateStatus = function (status, activeItem) { var copy = this.Copy(); copy.Status = status; return this.Update(copy, activeItem); };
Item.prototype.IsStopped = function () { return (this.Status == StatusTypes.Stopped); };
Item.prototype.IsActive = function () { return (this.Status == StatusTypes.Active); };
Item.prototype.IsComplete = function () { return (this.Status == StatusTypes.Complete); };
Item.prototype.IsCompleted = function () { return (this.Group != null); };
Item.prototype.IsPaused = function () { return (this.Status == StatusTypes.Paused); };
Item.prototype.IsSkipped = function () { return (this.Status == StatusTypes.Skipped); };
Item.prototype.IsRunning = function () { return !(this.IsStopped() || this.IsPaused()); };
Item.prototype.StatusClass = function () {
    return ((this.IsCompleted()) ? 'st-completed' :
            (this.IsStopped()) ? 'st-stopped' : ('st-' + this.Status.toLowerCase())); 
};

// ---------------------------------------------------------
// Activity and Step Item helpers
Item.prototype.IsCategory = function () { return (this.ItemTypeID == ItemTypes.Category); };
Item.prototype.IsActivity = function () { return (this.ItemTypeID == ItemTypes.Activity); };
Item.prototype.IsStep = function () { return (this.ItemTypeID == ItemTypes.Step); };

Item.prototype.GetActionType = function () {
    var actionTypeName = this.GetFieldValue(FieldNames.ActionType);
    if (actionTypeName == null) actionTypeName = ActionTypes.Reminder;
    var actionType = DataModel.FindActionType(actionTypeName);
    if (actionType == null) actionType = DataModel.FindActionType(ActionTypes.Reminder);
    return actionType;
}

// helper for determining options for starting activity
// returns object { Start: bool, Resume: bool, Restart: bool }
Item.prototype.CanResume = function () {
    var status = { Start: false, Resume: false, Restart: false }
    // get current steps (excludeLists and group == null)
    var steps = this.GetItems(true, null);
    if (ItemMap.count(steps) == 0) {
        var dueDate = this.GetFieldValue(FieldNames.DueDate);
        var completedOn = this.GetFieldValue(FieldNames.CompletedOn);
        var hasDueDate = (dueDate != null && dueDate.length > 0);
        var hasCompletedOn = (completedOn != null && completedOn.length > 0);
        status.Start = !hasDueDate;
        status.Resume = hasDueDate && !hasCompletedOn;
        status.Restart = hasDueDate && hasCompletedOn;
        return status;
    }

    var allStopped = true;
    var allStoppedAfter = true;
    var allCompleteBefore = true;
    var pauseCount = 0;
    for (var id in steps) {
        var step = steps[id];
        if (!step.IsStopped()) { allStopped = false; }
        if (step.IsPaused()) { pauseCount++; }
        if (pauseCount == 0 && !(step.IsComplete() || step.IsSkipped())) { allCompleteBefore = false; }
        if (pauseCount == 1 && step.IsRunning()) { allStoppedAfter = false; }
    }
    status.Start = allStopped;
    status.Resume = (pauseCount < 2 && allCompleteBefore && allStoppedAfter);
    status.Restart = !status.Start;
    return status;
};

// helper for marking item complete and marking next step active
Item.prototype.Complete = function () {
    var today = new Date().format();    // TODO: review format for stored dates
    var copy = this.Copy();
    copy.Status = StatusTypes.Complete;
    if (copy.HasField(FieldNames.CompletedOn)) {
        copy.SetFieldValue(FieldNames.CompletedOn, today);
    }

    // make next step active and set due date
    var nextStep = this.nextItem();
    if (nextStep != null && nextStep.IsStep()) {
        this.Update(copy, null);
        nextStep.Active(this.GetFieldValue(FieldNames.DueDate));
    } else {
        if (this.IsStep()) {
            var parent = this.GetParent();
            if (parent != null && parent.IsActivity()) {
                this.Update(copy, null);
                if (!parent.Repeat()) {
                    var pCopy = parent.Copy();
                    pCopy.Status = StatusTypes.Complete;
                    pCopy.SetFieldValue(FieldNames.CompletedOn, today);
                    parent.Update(pCopy);
                }
            }
        } else {
            this.Update(copy);
        }
    }
}
// helper for marking item skipped and marking next step active
Item.prototype.Skip = function () {
    var today = new Date().format();    // TODO: review format for stored dates
    var copy = this.Copy();
    copy.Status = StatusTypes.Skipped;
    if (copy.HasField(FieldNames.CompletedOn)) {
        copy.SetFieldValue(FieldNames.CompletedOn, today);
    }

    // find the next step in the Activity and make it Active
    var nextStep = this.nextItem();
    if (nextStep != null && nextStep.IsStep()) {
        this.Update(copy, null);
        nextStep.Active(this.GetFieldValue(FieldNames.DueDate));
    } else {
        if (this.IsStep()) {
            var parent = this.GetParent();
            if (parent != null && parent.IsActivity()) {
                this.Update(copy, null);
                if (!parent.Repeat()) {
                    var pCopy = parent.Copy();
                    pCopy.Status = StatusTypes.Complete;
                    pCopy.SetFieldValue(FieldNames.CompletedOn, today);
                    parent.Update(pCopy);
                }
            }
        } else {
            this.Update(copy);
        }
    }
}
// helper for marking item paused and marking first active child item paused
Item.prototype.Pause = function () {
    // get current steps (excludeLists and group == null)
    var steps = this.GetItems(true, null);
    for (var id in steps) {
        var step = steps[id];
        if (step.IsActive()) {
            step.UpdateStatus(StatusTypes.Paused, null);
            break;
        }
    }
    this.UpdateStatus(StatusTypes.Paused);
}
// helpers for marking item active and marking appropriate child item active
// if due date is required, item requiring due date will be returned
Item.prototype.Start = function (newDueDate) { return this.Active(newDueDate); }
Item.prototype.Active = function (newDueDate) {
    // get current steps (excludeLists and group == null)
    var steps = this.GetItems(true, null);
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

    var prevStep = null;
    for (var id in steps) {
        var step = steps[id];
        if (step.IsPaused()) {
            if (step.GetFieldValue(FieldNames.DueDate) != null) {
                // mark first paused step active
                step.UpdateStatus(StatusTypes.Active, null);
                this.UpdateStatus(StatusTypes.Active);
                return null;
            } else {
                step.Status = StatusTypes.Stopped;
            }
        }
        if (step.IsStopped()) {
            // mark first stopped step active
            var dueDate = (newDueDate != null) ? newDueDate : step.GetFieldValue(FieldNames.DueDate);
            if (dueDate == null || dueDate.length == 0) {
                if (prevStep != null) {         // try using due date of previous step
                    dueDate = prevStep.GetFieldValue(FieldNames.DueDate);
                } else {                        // try using due date of parent activity
                    dueDate = this.GetFieldValue(FieldNames.DueDate);
                }
            }
            if (dueDate != null && (dueDate.length > 0 || typeof(dueDate) == 'object')) {
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
    // no null or paused steps, all must be skipped or complete
    this.UpdateStatus(StatusTypes.Complete);

    return null;
}

// helper for resetting an activity to restart (null status and due dates)
Item.prototype.Restart = function () {
    // get current steps (excludeLists and group == null)
    var steps = this.GetItems(true, null);
    if (ItemMap.count(steps) == 0) {
        var copy = this.Copy();
        copy.SetFieldValue(FieldNames.DueDate, null);
        copy.SetFieldValue(FieldNames.CompletedOn, null);
        this.Update(copy, null);
        return copy.Active();
    } else {
        for (var id in steps) {
            var step = steps[id];
            var copy = step.Copy();
            copy.Status = null;
            copy.SetFieldValue(FieldNames.DueDate, null);
            step.Update(copy, null);
        }
    }
    return this.Active();
}

// helper for repeating an activity (clone steps and mark previous steps)
// returns true if activity is repeated, false if not
Item.prototype.Repeat = function () {
    var rrule = Recurrence.Extend(this.GetFieldValue(FieldNames.Repeat));
    if (rrule.IsEnabled()) {
        var completedOn = new Date();
        var nextDueDate = rrule.NextDueDate(completedOn);

        // get current steps (excludeLists and group == null)
        var steps = this.GetItems(true, null);
        var nextsteps = [];
        // create copy of current steps as next steps
        for (var id in steps) {
            var nextstep = steps[id].Copy();
            nextstep.ID = null;
            nextstep.Status = StatusTypes.Stopped;
            nextstep.SetFieldValue(FieldNames.DueDate, null);
            nextsteps.push(nextstep);
        }
        // mark group timestamp on current steps and update
        var timeStamp = new Date().toUTCString();
        for (var id in steps) {
            var copy = steps[id].Copy();
            copy.Group = timeStamp;
            steps[id].Update(copy, null);                       // update, no refresh
        }
        // mark first step active with next duedate
        nextsteps[0].Status = StatusTypes.Active;
        nextsteps[0].SetFieldValue(FieldNames.DueDate, nextDueDate);
        var nextSortOrder = nextsteps[nextsteps.length - 1].SortOrder + 1;
        // insert copied next steps
        for (var i in nextsteps) {
            nextsteps[i].SortOrder = nextSortOrder++;
            this.InsertItem(nextsteps[i], null, null, null);    // insert, no refresh
        }
        // update completedOn field of activity (status remains active)
        var copy = this.Copy();
        copy.SetFieldValue(FieldNames.CompletedOn, completedOn);
        this.Update(copy)                                       
        return true;            
    }
    return false;               
}

// ---------------------------------------------------------
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
            DataModel.fireDataChanged(this.FolderID, this.ID, DataChangeTypes.Update);
        } else if (activeItem != null) {
            DataModel.fireDataChanged(this.FolderID, activeItem.ID, DataChangeTypes.Update);
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
Item.prototype.addReference = function (refList, itemToRef, eliminateDup) {
    if (refList.IsList) {
        if (eliminateDup) {
            // look for an identical reference and stop processing if one is found
            var itemRefs = refList.GetItems();
            for (var id in itemRefs) {
                var itemRef = itemRefs[id];
                var refID = itemRef.GetFieldValue(FieldNames.EntityRef);
                if (refID.ID == itemToRef.ID)
                    return false;
            }
        }
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
    // 2012-09-17 OG: it appears that a null array will cause exceptions down the line in ItemMap.updateMap.  
    // Fixing this by substituting an empty array for a null parameter.
    this.array = (array == null) ? [] : array;
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

ItemMap.itemByName = function (map, name) {
    for (var id in map) {
        if (map[id].Name == name) { return map[id]; }
    }
    return null;
}

ItemMap.errorMustHaveID = 'ItemMap requires all items in array to have an ID property.';
