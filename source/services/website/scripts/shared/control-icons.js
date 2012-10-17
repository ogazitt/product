//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// control-icons.js
//
// Controls for rendering icons and types
//      Control.Icons
//      Control.ItemType

// ---------------------------------------------------------
// Control.Icons static object
//
Control.Icons = {};

// return an element containing icons for item sources
Control.Icons.forSources = function Control$Icons$forSources(item) {
    var $icons = $('<span />');
    if (item.HasField(FieldNames.Sources)) {
        var sources = item.GetFieldValue(FieldNames.Sources);
        if (sources != null) {
            sources = sources.split(",");
            for (var i in sources) {
                switch (sources[i]) {
                    case "Facebook":
                        var fbID = item.GetFieldValue(FieldNames.FacebookID);
                        var $fbLink = $('<i class="icon-facebook-sign" />').appendTo($icons);
                        if (fbID != null) {
                            $fbLink.click(function () { window.open('http://www.facebook.com/' + fbID); return false; });
                        }
                        break;
                    case "Directory":
                        $icons.append('<i class="icon-azure" />');
                        break;
                }
            }
        } else if (item.ItemTypeID == ItemTypes.Contact) {
            $icons.append('<i class="icon-user"></i>');
        }
    }
    return $icons;
}

// return an element that is an icon for the item type
Control.Icons.forItemType = function Control$Icons$forItemType(item) {
    // allow input parameter as Item or ItemTypeID
    var itemType = (typeof (item) == 'object') ? item.ItemTypeID : item;
    var $icon = $('<i></i>');
    switch (itemType) {
        case ItemTypes.Activity:
            if (typeof (item) == 'object') {
                return Control.Icons.forStatusType(item);
            }
            else {
                return Control.Icons.forStatusType(StatusTypes.Active);
            }
            break;
        case ItemTypes.Step:
            $icon.addClass('icon-check');
            break;
        case ItemTypes.Contact:
            $icon.addClass(item.IsFolder() ? 'icon-group' : 'icon-user');
            break;
        case ItemTypes.Location:
            $icon.addClass('icon-map-marker');
            break;
        case ItemTypes.Category:
            return Control.Icons.forFolder(item.IsFolder() ? item : item.GetFolder());
        default:
            $icon.addClass('icon-folder-close');
            break;
    }
    return $icon;
}

// return an element that is an icon for the status type
Control.Icons.forStatusType = function Control$Icons$forStatusType(item) {
    // allow input parameter as Item or StatusType
    var statusType =  (typeof (item) == 'object') ? item.Status : item;
    var $icon = $('<i></i>');
    switch (statusType) {
        case StatusTypes.Active:
            $icon.addClass('icon-play');
            break;
        case StatusTypes.Complete:
            $icon.addClass('icon-check');
            break;
        case StatusTypes.Paused:
            $icon.addClass('icon-pause');
            break;
        case StatusTypes.Skipped:
            $icon.addClass('icon-share');
            break;
        default:
            $icon.addClass('icon-pause');
            //$icon.addClass('icon-stop');
            break;
    }
    return $icon;
}

// return an element that is an icon for the action type
Control.Icons.forActionType = function Control$Icons$forActionType(actionType) {
    // allow input parameter as ActionType class or name 
    var actionTypeName = (actionType != null && typeof (actionType) == 'object') ? actionType.Name : actionType;
    var $icon = $('<i></i>');
    switch (actionTypeName) {
        case ActionTypes.All:
            $icon.addClass('icon-play');
            break;
        case ActionTypes.Reminder:
            $icon.addClass('icon-bell');
            break;
        case ActionTypes.Call:
            $icon.addClass('icon-phone');
            break;
        case ActionTypes.SendEmail:
            $icon.addClass('icon-envelope');
            break;
        case ActionTypes.Find:
            $icon.addClass('icon-search');
            break;
        case ActionTypes.AskFriends:
            $icon.addClass('icon-facebook');
            break;
        case ActionTypes.Schedule:
            $icon.addClass('icon-time');
            break;
        case ActionTypes.Errand:
            $icon.addClass('icon-shopping-cart');
            break;
        case ActionTypes.TextMessage:
            $icon.addClass('icon-list-alt');
            break;
        default:
            $icon.addClass('icon-question-sign');
            break;
    }
    return $icon;
}

// return an element that is an icon for the folder type
Control.Icons.forFolder = function Control$Icons$forFolder(folder) {
    // allow parameter as Folder class or name 
    var folderName = (folder != null && typeof (folder) == 'object') ? folder.Name : folder;
    var $icon = $('<i></i>');
    switch (folderName) {
        case UserEntities.Inbox:
            $icon.addClass('icon-inbox');
            break;
        case UserEntities.People:
            $icon.addClass('icon-group');
            break;
        case UserEntities.Places:
            $icon.addClass('icon-globe');
            break;
        case UserEntities.Personal:
            $icon.addClass('icon-user');
            break;
        case UserEntities.Home:
            $icon.addClass('icon-home');
            break;
        case UserEntities.Auto:
            $icon.addClass('icon-truck');
            break;
        case UserEntities.Finance:
            $icon.addClass('icon-money');
            break;
        default:
            $icon.addClass('icon-folder-close');
            break;
    }
    return $icon;
}

// return an element that is an icon for a map link
Control.Icons.forMapLink = function Control$Icons$forMap(item) {
    var json = item.GetFieldValue(FieldNames.WebLinks);
    if (json != null && json.length > 0) {
        var links = new LinkArray(json).Links();
        for (var i in links) {
            var link = links[i];
            if (link.Name == 'Map' && link.Url != null) {
                var $link = $('<i class="icon-map-marker"></i>');
                $link.attr('href', link.Url);
                Control.tooltip($link, 'Map');
                $link.click(function () { window.open($(this).attr('href')); return false; });
                return $link;
            }
        }
    }
    return $('<i></i>');
}

// ---------------------------------------------------------
// Control.ItemType static object
// static re-usable helper to display and update ItemTypeID on an item
//
Control.ItemType = {};
Control.ItemType.renderDropdown = function Control$ItemType$renderDropdown($element, item, noLabel) {
    var itemTypes = DataModel.Constants.ItemTypes;
    var currentItemTypeName = itemTypes[item.ItemTypeID].Name;
    var $wrapper = $wrapper = $('<div class="control-group"></div>').appendTo($element);
    if (noLabel != true) {
        var labelType = (item.IsFolder() || item.IsList) ? 'List' : 'Item';
        var label = '<label class="control-label">Type of ' + labelType + '</label>';
        $(label).appendTo($wrapper);
    }

    var $btnGroup = $('<div class="btn-group" />').appendTo($wrapper);
    var $btn = $('<a class="btn dropdown-toggle" data-toggle="dropdown" />').appendTo($btnGroup);
    Control.Icons.forItemType(item).appendTo($btn);
    if (noLabel != true) {
        $('<span>&nbsp;&nbsp;' + currentItemTypeName + '</span>').appendTo($btn);
        $('<span class="pull-right">&nbsp;&nbsp;<span class="caret" /></span>').appendTo($btn);
    }

    var $dropdown = $('<ul class="dropdown-menu" />').appendTo($btnGroup);
    $dropdown.data('item', item);
    for (var id in itemTypes) {
        var itemType = itemTypes[id];
        if (itemType.UserID == SystemUsers.User || itemType.UserID == DataModel.User.ID) {
            var $menuitem = $('<li><a></a></li>').appendTo($dropdown);
            $menuitem.find('a').append(Control.Icons.forItemType(id));
            $menuitem.find('a').append('<span>&nbsp;&nbsp;' + itemTypes[id].Name + '</span>');
            $menuitem.data('value', id);
            $menuitem.click(function (e) { Control.ItemType.update($(this)); e.preventDefault(); });
        }
    }

    return $wrapper;
}

Control.ItemType.update = function Control$ItemType$update($menuitem) {
    var item = $menuitem.parent().data('item');
    var updatedItem = item.Copy();
    updatedItem.ItemTypeID = $menuitem.data('value');
    var $button = $menuitem.parents('.btn-group').first().find('.btn');
    $button.find('i').replaceWith(Control.Icons.forItemType(updatedItem));
    var $label = $menuitem.find('span').first();
    if ($label.length > 0) { $button.find('span').first().html($label.html()); }
    item.Update(updatedItem);
}

