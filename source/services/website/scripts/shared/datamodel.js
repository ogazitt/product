//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// DataModel.js

// DataModel object
var DataModel = function DataModel$() { };

// ---------------------------------------------------------
// public members

DataModel.Constants = {};
DataModel.User = {};
DataModel.Folders = {};
DataModel.Suggestions = {};
DataModel.ActionTypes = {};
DataModel.UserSettings;        

// ---------------------------------------------------------
// private members

DataModel.onDataChangedHandlers = {};
DataModel.timeStamp = '/Date(0)/';

// ---------------------------------------------------------
// public methods

DataModel.Init = function DataModel$Init(jsonConstants, jsonUserData) {
    this.processConstants($.parseJSON(jsonConstants));
    this.processUserData($.parseJSON(jsonUserData));
}

DataModel.Close = function DataModel$Close() {
    Service.Close();
    DataModel.UserSettings.Save();
}

DataModel.AddDataChangedHandler = function (name, handler) {
    this.onDataChangedHandlers[name] = handler;
}

DataModel.RemoveDataChangedHandler = function (name) {
    delete this.onDataChangedHandlers[name];
}

// refreshes datamodel with current state of server
DataModel.Refresh = function DataModel$Refresh(itemID) {
    // preserve and restore current ViewState
    var currentViewState = DataModel.UserSettings.ViewState;

    // refresh user data
    Service.GetResource(Service.UsersResource, null,
        function (responseState) {
            DataModel.processUserData(responseState.result);
            DataModel.UserSettings.ViewState = currentViewState;
            DataModel.restoreSelection();
        });
}

// generic helper for finding folder or item for given ID
DataModel.FindItem = function DataModel$FindItem(itemID) {
    if (itemID != null) {
        var folder = DataModel.Folders[itemID];
        if (folder != null) { return folder; }

        for (id in DataModel.Folders) {
            folder = DataModel.Folders[id];
            var item = folder.Items[itemID];
            if (item != null) { return item; }
        }
    }
    return null;
}

// generic helper for finding action type for given action type name
DataModel.FindActionType = function DataModel$FindActionType(actionTypeName) {
    if (actionTypeName != null) {
        var item = DataModel.ActionTypes[actionTypeName];
        if (item != null) { return item; }
    }
    return null;
}

// generic helper for finding a Location item that matches given address or latlong
// only looks in folders that have Location ItemType
DataModel.FindLocation = function DataModel$FindLocation(address, latlong) {
    for (id in DataModel.Folders) {
        var folder = DataModel.Folders[id];
        if (folder.ItemTypeID == ItemTypes.Location) {
            for (id in folder.Items) {
                var item = folder.Items[id];
                if (item.ItemTypeID == ItemTypes.Location) {
                    var itemLatLong = item.GetFieldValue(FieldNames.LatLong);
                    if (latlong != null && itemLatLong != null) {       // compare latlong fields
                        if (latlong == itemLatLong) { return item; }
                    } else {                                            // compare address fields
                        var itemAddress = item.GetFieldValue(FieldNames.Address);
                        if (address == itemAddress) { return item; }
                    }
                }
            }
        }
    }
    return null;
}

// generic helper for finding a Contact item that matches given name or facebookID
// only looks in folders that have Contact ItemType
DataModel.FindContact = function DataModel$FindContact(name, facebookID) {
    for (id in DataModel.Folders) {
        var folder = DataModel.Folders[id];
        if (folder.ItemTypeID == ItemTypes.Contact) {
            for (id in folder.Items) {
                var item = folder.Items[id];
                if (item.ItemTypeID == ItemTypes.Contact) {
                    var itemFacebookID = item.GetFieldValue(FieldNames.FacebookID);
                    if (facebookID != null && itemFacebookID != null) {     // compare facebook id 
                        if (facebookID == itemFacebookID) { return item; }
                    } else {                                                // compare name 
                        if (name == item.Name) { return item; }
                    }
                }
            }
        }
    }
    return null;
}

// generic helper for getting local items associated with folder or list item
DataModel.GetItems = function DataModel$GetItems(folderID, parentID, excludeListItems) {
    var items = {};
    var folder = (typeof (folderID) == 'object') ? folderID : DataModel.Folders[folderID];
    if (folder != undefined) {
        if (excludeListItems != true) {
            // extract list items first 
            for (var id in folder.Items) {
                var item = folder.Items[id];
                if (item.ParentID == parentID && item.IsList) {
                    items[id] = folder.Items[id];
                }
            }
        }
        for (var id in folder.Items) {
            var item = folder.Items[id];
            if (item.ParentID == parentID && !item.IsList) {
                items[id] = folder.Items[id];
            }
        }
    }
    return items;
}

// generic helper for inserting a new folder or item, invokes server and updates local data model
//  newItem must have Name defined
//  containerItem may be null, a folder, or list item
//  adjacentItem may be null, a folder, or item
//  insertBefore will be false by default (insert after adjacentItem)
//  activeItem will be used when firing data changed event (indicating which item to select)
//      undefined will result in default behavior
//      null will result in the data changed event NOT being fired
DataModel.InsertItem = function DataModel$InsertItem(newItem, containerItem, adjacentItem, insertBefore, activeItem, callback) {
    if (newItem != null && newItem.Name != null) {
        var resource = Service.ItemsResource;
        if (containerItem == null) {                                        // inserting a new folder
            resource = Service.FoldersResource;
        } else if (containerItem.IsFolder()) {                              // inserting into a folder 
            newItem.FolderID = containerItem.ID;
            newItem.ParentID = null;
            newItem.ItemTypeID = (newItem.ItemTypeID == null) ? containerItem.ItemTypeID : newItem.ItemTypeID;
        } else if (containerItem.IsList != null && containerItem.IsList) {  // inserting into list item
            newItem.FolderID = containerItem.FolderID;
            newItem.ParentID = containerItem.ID;
            newItem.ItemTypeID = (newItem.ItemTypeID == null) ? containerItem.ItemTypeID : newItem.ItemTypeID;
        } else {
            return false;                                                   // do not insert into item that is not a list
        }

        // TODO: support insertions (always appends)
        if (adjacentItem == null) {                                         // append to end
            if (containerItem == null) {                                    // append new Folder to end
                var lastFolder = DataModel.FoldersMap.itemAt(-1);
                newItem.SortOrder = (lastFolder == null) ? 1000 : lastFolder.SortOrder + 1000;
            } else {                                                        // append new Item to end
                var lastItem = ItemMap.itemAt(containerItem.GetItems(), -1);
                newItem.SortOrder = (lastItem == null) ? 1000 : lastItem.SortOrder + 1000;
            }
        }

        // add to local DataModel immediately (fire datachanged)
        if (newItem.ID == null) { newItem.ID = Math.uuid(); }           // assign ID if not defined
        delete newItem['Created'];                                      // remove Created field
        if (containerItem == null) {                                    // add new Folder
            newItem = DataModel.addFolder(newItem, activeItem);
        } else {                                                        // add new Item to container
            containerItem.addItem(newItem, activeItem);
        }

        Service.InsertResource(resource, newItem,
            function (responseState) {                                  // successHandler
                var insertedItem = responseState.result;
                newItem.update(insertedItem, null);                     // update local DataModel (do not fire datachanged)
                if (callback != null) {
                    callback(insertedItem);
                }
            });
        return true;
    }
    return false;
}

DataModel.InsertFolder = function DataModel$InsertFolder(newFolder, adjacentFolder, insertBefore) {
    return DataModel.InsertItem(newFolder, null, adjacentFolder, insertBefore);
};

// generic helper for updating a folder or item, invokes server and updates local data model
DataModel.UpdateItem = function DataModel$UpdateItem(originalItem, updatedItem, activeItem) {
    if (originalItem != null && updatedItem != null) {
        // update local DataModel immediately (fire datachanged)
        originalItem.update(updatedItem, activeItem)

        updatedItem.LastModified = DataModel.timeStamp;                         // timestamp on server
        var resource = (originalItem.IsFolder()) ? Service.FoldersResource : Service.ItemsResource;
        var data = [originalItem, updatedItem];
        if (resource == Service.FoldersResource) {
            data = [originalItem.Copy(), updatedItem];                          // exclude items from original folder
        }

        Service.UpdateResource(resource, originalItem.ID, data,
            function (responseState) {                                          // successHandler
                var returnedItem = responseState.result;
                var success = originalItem.update(returnedItem, null);          // update local DataModel (do not fire datachanged)
                // TODO: report failure to update
            });
        return true;
    }
    return false;
}

// generic helper for deleting a folder or item, invokes server and updates local data model
DataModel.DeleteItem = function DataModel$DeleteItem(item, activeItem) {
    if (item != null) {
        // delete item from local DataModel (fire datachanged)
        if (item.IsFolder()) {                                      // remove Folder
            DataModel.FoldersMap.remove(item);
            DataModel.fireDataChanged();
        } else {                                                    // remove Item
            var parent = item.GetParent();
            if (parent != null && parent.ItemTypeID == ItemTypes.Reference) {
                // deleting a reference, don't change selection or fire data changed
                item.GetFolder().ItemsMap.remove(item);
            } else if (activeItem != null) {
                // select activeItem
                var activeFolderID = activeItem.IsFolder() ? activeItem.ID : activeItem.FolderID;
                var activeItemID = activeItem.IsFolder() ? null : activeItem.ID;
                item.GetFolder().ItemsMap.remove(item);
                DataModel.deleteReferences(item.ID);
                DataModel.fireDataChanged(activeFolderID, activeItemID);
            } else {
                var nextItem = item.selectNextItem();
                var nextItemID = (nextItem == null) ? null : nextItem.ID;
                item.GetFolder().ItemsMap.remove(item);
                DataModel.deleteReferences(item.ID);
                DataModel.fireDataChanged(item.FolderID, nextItemID);
            }
        }

        var resource = (item.IsFolder()) ? Service.FoldersResource : Service.ItemsResource;
        Service.DeleteResource(resource, item.ID, item,
            function (responseState) {                                      // successHandler
                var deletedItem = responseState.result;
                // TODO: report failure to delete
            });
        return true;
    }
    return false;
}

// helper for retrieving suggestions, invokes server and updates local data model
DataModel.GetSuggestions = function DataModel$GetSuggestions(handler, entity, fieldName) {
    var filter = {};
    if (entity == null) { entity = DataModel.User; }
    filter.EntityID = entity.ID;
    filter.FieldName = fieldName;
    filter.EntityType = EntityTypes.User;
    if (entity.hasOwnProperty('ItemTypeID')) {
        filter.EntityType = (entity.hasOwnProperty('FolderID')) ? EntityTypes.Item : EntityTypes.Folder;
    }

    // using POST to query for suggestions
    Service.InsertResource(Service.SuggestionsResource, filter,
        function (responseState) {                                      // successHandler
            var suggestions = responseState.result;
            if (suggestions.length > 0) {
                DataModel.SuggestionsRetrieved = new Date();            // timestamp
            }
            DataModel.processSuggestions(suggestions);
            if (handler != null) {
                handler(DataModel.Suggestions);
            }
        });
}

// helper for selecting a suggestion, invokes server and updates local data model
DataModel.SelectSuggestion = function DataModel$SelectSuggestion(suggestion, reason, handler) {
    reason = (reason == null) ? Reasons.Chosen : reason;
    var selected = $.extend({}, suggestion);
    selected.TimeSelected = DataModel.timeStamp;     // timestamp on server
    selected.ReasonSelected = reason;
    var data = [suggestion, selected];
    Service.UpdateResource(Service.SuggestionsResource, suggestion.ID, data,
        function (responseState) {                                      // successHandler
            var suggestion = responseState.result;
            if (handler != null) {
                handler(selected);
            }
        });
    }

// helper for removing a suggestion from local suggestions
DataModel.RemoveSuggestion = function DataModel$RemoveSuggestion(suggestion) {
    var group = DataModel.Suggestions[suggestion.GroupID];
    if (group != null) {
        delete group.Suggestions[suggestion.ID];
    }
}

// ---------------------------------------------------------
// private methods

DataModel.fireDataChanged = function (folderID, itemID) {
    // do not fire datachanged event for UserSetting folders
    if (DataModel.UserSettings.GetFolder(folderID) == null) {
        for (var name in DataModel.onDataChangedHandlers) {
            var handler = DataModel.onDataChangedHandlers[name];
            if (typeof (handler) == "function") {
                handler(folderID, itemID);
            }
        }
    }
}

DataModel.getFolder = function (folderID) {
    var folder = DataModel.Folders[folderID];
    if (folder == null) {
        folder = DataModel.UserSettings.GetFolder(folderID);
    }
    return folder;
}

DataModel.addFolder = function (newFolder, activeItem) {
    newFolder = Folder.Extend(newFolder);                       // extend with Folder functions
    if (newFolder.ItemsMap == null) {
        newFolder.ItemsMap = new ItemMap([]);
        newFolder.Items = newFolder.ItemsMap.Items;
    }
    DataModel.FoldersMap.append(newFolder);
    if (activeItem === undefined) {                             // default, fire event with new Folder
        DataModel.fireDataChanged(newFolder.ID);
    } else if (activeItem != null) {                            // fire event with activeItem
        DataModel.fireDataChanged(activeItem.FolderID, activeItem.ID);
    }
    return newFolder;                                           // null, do not fire event
};

DataModel.deleteReferences = function (itemID) {
    // delete all items which Reference given itemID
    for (var fid in DataModel.Folders) {
        var folder = DataModel.Folders[fid];
        for (var iid in folder.Items) {
            var item = folder.Items[iid];
            if (item.ItemTypeID == ItemTypes.Reference) {
                for (var i in item.FieldValues) {
                    var fv = item.FieldValues[i];
                    if (fv.FieldName == FieldNames.EntityRef && fv.Value == itemID) {
                        item.GetFolder().ItemsMap.remove(item);
                    }
                }
            }
        }
    }
}

DataModel.processConstants = function DataModel$processConstants(jsonParsed) {
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

    DataModel.Constants = constants;
}

DataModel.processUserData = function DataModel$processUserData(jsonParsed) {
    var userData = {};
    for (var key in jsonParsed) {
        userData[key] = jsonParsed[key];
    }

    // process User
    var user = {};
    user.ID = userData.ID;
    user.Name = userData.Name;
    user.Email = userData.Email;
    user.CreateDate = userData.CreateDate;
    DataModel.User = user;

    // process Folders
    DataModel.processFolders(userData.Folders);

    // process Action Types
    DataModel.processActionTypes(DataModel.Constants.ActionTypes);

    // process custom ItemTypes and Tags (add to constants?)

}

DataModel.processSuggestions = function DataModel$processSuggestions(jsonParsed) {
    var suggestions = {};
    var childSuggestions = [];
    var groupNameMap = {};
    var nGroup = 0;

    for (var i in jsonParsed) {
        var s = jsonParsed[i];
        if (s.ParentID == null) {
            // 2012-04-17 OG: change the key to just the GroupDisplayName
            //var groupKey = s.WorkflowInstanceID + s.GroupDisplayName;
            var groupKey = s.GroupDisplayName;

            var groupID = groupNameMap[groupKey];
            if (groupID === undefined) {
                groupID = (s.GroupDisplayName == SuggestionTypes.RefreshEntity) ? s.GroupDisplayName : 'Group_' + (nGroup++).toString();
                groupNameMap[groupKey] = groupID;
                suggestions[groupID] = { GroupID: groupID, DisplayName: s.GroupDisplayName, Suggestions: {} };
            }
            s.GroupID = groupID;
            suggestions[groupID].Suggestions[s.ID] = s;
        } else {
            childSuggestions.push(s);
        }
    }
    // nest child suggestions under parent suggestions
    for (i in childSuggestions) {
        var child = childSuggestions[i];
        for (groupID in suggestions) {
            var group = suggestions[groupID];
            var parent = group.Suggestions[child.ParentID];
            if (parent != null) {
                if (parent.Suggestions == null) {
                    parent.Suggestions = {};
                }
                parent.Suggestions[child.ID] = child;
                break;
            }
        }
    }
    DataModel.Suggestions = suggestions;
}

DataModel.processFolders = function DataModel$processFolders(folders) {
    // wrap Folders and Items in ItemMap
    // the ItemMap retains original storage array
    // the ItemMap.Items property provides associative array over storage
    var clientFolderIndex, webClientFolderIndex;
    for (var i in folders) {
        folders[i] = Folder.Extend(folders[i]);    // extend with Folder functions
        var items = folders[i].Items;
        for (var j in items) {
            items[j] = Item.Extend(items[j]);      // extend with Item functions
        }
        folders[i].ItemsMap = new ItemMap(items);
        folders[i].Items = folders[i].ItemsMap.Items;

        // extract folders for UserSettings ($Client and $WebClient folders)
        if (folders[i].Name == SystemFolders.Client) { clientFolderIndex = i; }
        if (folders[i].Name == SystemFolders.WebClient) { webClientFolderIndex = i; }
    }
    // assumes $Client folder has already been created
    var clientFolder = folders.splice(clientFolderIndex, 1)[0];
    if (webClientFolderIndex == null) {
        // $WebClient folder does not exist, create it
        DataModel.UserSettings = new UserSettings(clientFolder);
        Service.InsertResource(Service.FoldersResource, { Name: SystemFolders.WebClient, ItemTypeID: ItemTypes.NameValue, SortOrder: 0 },
            function (responseState) {                                      // successHandler
                var webClientFolder = responseState.result;
                webClientFolder = Folder.Extend(webClientFolder);    // extend with Folder functions
                DataModel.UserSettings = new UserSettings(clientFolder, webClientFolder);
            });
    } else {
        // adjust index after removing clientFolder
        if (webClientFolderIndex > clientFolderIndex) { webClientFolderIndex--; }
        var webClientFolder = folders.splice(webClientFolderIndex, 1)[0];
        DataModel.UserSettings = new UserSettings(clientFolder, webClientFolder);
    }
    DataModel.FoldersMap = new ItemMap(folders);
    DataModel.Folders = DataModel.FoldersMap.Items;
}

DataModel.processActionTypes = function DataModel$processActionTypes(actionTypes) {
    // for now, action types are hardcoded in entityconstants.js instead of retrieved from the service's Constants
    var actionTypes = {};
    for (var key in ActionTypes) {
        actionTypes[key] = ActionType.Extend({ Name: ActionTypes[key], ID: ActionTypes[key] });
    }
    // create an associative array over the action types 
    DataModel.ActionTypesMap = new ItemMap(actionTypes);
    DataModel.ActionTypes = DataModel.ActionTypesMap.Items;
}

DataModel.restoreSelection = function DataModel$restoreSelection(itemID) {
    if (itemID === undefined && DataModel.UserSettings != null) {
        itemID = DataModel.UserSettings.ViewState.SelectedItem;
    }
    if (itemID != null) {
        var item = DataModel.FindItem(itemID);
        if (item != null) {
            DataModel.fireDataChanged(item.FolderID, item.ID);
            return;
        }
    }
    var folderID = DataModel.UserSettings.ViewState.SelectedFolder;
    if (folderID != null) {
        DataModel.fireDataChanged(folderID);
        return;
    }
    DataModel.fireDataChanged();
}

