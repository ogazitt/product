//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// control-icons.js
//
// Controls for rendering icons and types
//      Control.Icons
//      Control.ItemType
//      Control.ActionType
//      Control.DeferButton
//      Control.ThemePicker
//      Control.Actions

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
    // allow parameter as Item or ItemTypeID
    var itemType = item;
    if (typeof (item) == 'object') {
        itemType = item.ItemTypeID;
    }

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
    // allow parameter as Item or StatusType
    var statusType = item;
    if (typeof (item) == 'object') {
        statusType = item.Status;
    }

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
            //$icon.addClass('icon-step-forward');
            $icon.addClass('icon-share');
            break;
        default:
            $icon.addClass('icon-stop');
            //$icon.addClass('icon-sign-blank');
            break;
    }
    return $icon;
}


// return an element that is an icon for the action type
Control.Icons.forActionType = function Control$Icons$forActionType(actionType) {
    // allow parameter as ActionType class or name 
    var actionTypeName = actionType;
    if (actionType != null && typeof (actionType) == 'object') {
        actionTypeName = actionType.Name;
    }

    var $icon = $('<i></i>');
    switch (actionTypeName) {
        case ActionTypes.All:
            $icon.addClass('icon-play');
            break;
        case ActionTypes.Reminder:
            $icon.addClass('icon-time');
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
            $icon.addClass('icon-calendar');
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
    var folderName = folder;
    if (folder != null && typeof (folder) == 'object') {
        folderName = folder.Name;
    }

    var $icon = $('<i></i>');
    switch (folderName) {
        case UserEntities.Inbox:
            $icon.addClass('icon-envelope');
            break;
        case UserEntities.People:
            $icon.addClass('icon-group');
            break;
        case UserEntities.Places:
            //$icon.addClass('icon-map-marker');
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

// return an element that is an icon for deleting an item
Control.Icons.deleteBtn = function Control$Icons$deleteBtn(item) {
    var $icon = $('<i class="icon-remove-sign"></i>');
    $icon.css('cursor', 'pointer');
    $icon.data('item', item);
    Control.tooltip($icon, 'Delete');
    $icon.bind('click', function () {
        var $this = $(this);
        $this.tooltip('hide');
        var item = $this.data('item');
        var activeItem = (item.ParentID == null) ? item.GetFolder() : item.GetParent();
        item.Delete(activeItem);
        return false;   // do not propogate event
    });
    // wrap in anchor tag to get tooltips to work in Chrome
    return $('<a class="icon" />').append($icon);
}

// return an element that is an icon for a map link
Control.Icons.forMap = function Control$Icons$forMap(item) {
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

// return an element that is an icon for completing an item
Control.Icons.completeBtn = function Control$Icons$completeBtn(item, handler) {
    var $icon = $('<i class="icon-check icon-large"></i>');
    $icon.data('item', item);
    Control.tooltip($icon, 'Complete', null);
    $icon.attr('caption', 'Done');
    $icon.click(function () {
        var $this = $(this);
        $this.tooltip('hide');
        var item = $this.data('item');
        if (handler == null) {
            item.Complete();
            return true;   // propogate event to refresh display
        }
        if (handler(item)) {
            item.Complete();
            return true;
        }
        return false;
    });
    // wrap in anchor tag to get tooltips to work in Chrome
    return $('<a class="icon" />').append($icon);
}

Control.Icons.completeHandler = function Control$Icons$completeHandler(item) {
    var actionType = item.GetActionType();
    var activity = item.GetParent();
    if (actionType == null || activity == null) return false;

    var $dialog = null;
    var header = null;
    switch (actionType.Name) {
        case ActionTypes.Find:
            $dialog = $('<div>' + Messages.CompleteHandler.FindText + '<p/></div>');
            var field = item.GetField(FieldNames.Locations);
            var $field = Control.LocationList.renderInput($dialog, item, field, function (input) { return false; });
            header = activity.Name;
            break;
        default:
            return true; // indicate that complete returned successfully
    }
    if ($dialog != null) {
        Control.popup($dialog, header, function (inputs) {
            Control.LocationList.update($field);
            item.Complete();
            return true;
        },
        function (inputs) {
            return false;
        });
    }
    return false;
}

// return an element that is an icon for skipping an item
Control.Icons.skipBtn = function Control$Icons$skipBtn(item) {
    //var $icon = $('<i class="icon-step-forward icon-large"></i>');
    var $icon = $('<i class="icon-share icon-large"></i>');
    $icon.data('item', item);
    Control.tooltop($icon, 'Skip');
    $icon.bind('click', function () {
        var $this = $(this);
        $this.tooltip('hide');
        var item = $this.data('item');
        item.Skip();
        return true;   // propogate event to refresh display
    });
    // wrap in anchor tag to get tooltips to work in Chrome
    return $('<a class="icon" />').append($icon);
}

// return an element that is an icon for deferring an item
Control.Icons.deferBtn = function Control$Icons$deferBtn(item) {
    var $icon = $('<i class="icon-time icon-large icon-blue"></i>');
    $icon.data('item', item);
    Control.tooltip($icon, 'Defer');
    $icon.bind('click', function () {
        var $this = $(this);
        $this.tooltip('hide');
        // the parent control (Control.DeferButton.renderDropdown) handles the actual work
        return true;   // propogate event
    });
    return $icon;
}

// return an element that is an icon for viewing item information
Control.Icons.infoBtn = function Control$Icons$infoBtn(item) {
    var $icon = $('<i class="icon-info-sign  icon-large"></i>');
    $icon.data('item', item);
    Control.tooltip($icon, 'Info');
    $icon.bind('click', function () {
        var $this = $(this);
        $this.tooltip('hide');
        var item = $this.data('item');

        // HACK ALERT: use IsMobile when NextSteps are integrated into Dashboard
        // TODO: do not access manager directly, pass in or fetch in general way
        NextStepsPage.showManager(NextStepsPage.infoManager);
        NextStepsPage.infoManager.selectItem(item);

        return false;   // do not propogate event 
    });
    // wrap in anchor tag to get tooltips to work in Chrome
    return $('<a class="icon" />').append($icon);
}

// return an element that is an icon for calling
Control.Icons.callBtn = function Control$Icons$callBtn(item) {
    var $icon = $('<i class="icon-phone icon-large"></i>');
    $icon.data('item', item);
    Control.tooltip($icon, 'Call');
    var handler = function (phoneNumber) {
        // call the phone number
        phoneNumber = phoneNumber.replace(/[^0-9]+/g, '');
        if (Browser.IsMobile()) { window.open("tel:" + phoneNumber); }
        else {
            Control.alert('<p>' + Messages.CallButton.ActionNotSupported + '</p>', 'call ' +
                Control.Icons.formatPhoneNumber(phoneNumber));
        }
    };
    $icon.bind('click', function () {
        var $this = $(this);
        $this.tooltip('hide');
        var item = $this.data('item');
        var phone = item.GetPhoneNumber();
        if (phone != null) { handler(phone); }
        else {
            // obtain phone number and invoke the handler at the end
            Control.Icons.infoDialog(item, FieldNames.Phone, 'Phone', 'tel', handler);
        }
        return false;   // do not propogate event
    });
    // wrap in anchor tag to get tooltips to work in Chrome
    return $('<a class="icon" />').append($icon);
}

Control.Icons.formatPhoneNumber = function Control$Icons$formatPhoneNumber(phone) {
    if (phone.length == 7) return phone.slice(0, 3) + '-' + phone.slice(3, 7);
    if (phone.length == 10) return '(' + phone.slice(0, 3) + ') ' + phone.slice(3, 6) + '-' + phone.slice(6, 10);
    return phone;
}

// return an element that is an icon for mapping
Control.Icons.mapBtn = function Control$Icons$mapBtn(item) {
    var $icon = $('<i class="icon-map-marker icon-large icon-blue"></i>');
    $icon.data('item', item);
    Control.tooltip($icon, 'Map');

    $icon.bind('click', function () {
        var $this = $(this);
        $this.tooltip('hide');
        var item = $this.data('item');
        var link = item.GetMapLink();
        if (link != null) { window.open(link); }
        else {
            var header = item.Name;
            // if this is a location, bind the Address field and autocomplete a location
            if (item.IsLocation()) {
                var $dialog = $('<div>' + Messages.MapDialog.LocationText + '<p/></div>');
                var field = item.GetField(FieldNames.Address);
                var $field = Control.Text.renderInputAddress($dialog, item, field, function (input) { return false; });
                Control.popup($dialog, header, function (inputs) {
                    Control.Text.updateAddress($field);
                    var place = $field.data('place');
                    if (place != null) {
                        if (Browser.IsMobile()) { window.open('maps:' + escape(place.formatted_address)); }
                        else { window.open('http://maps.google.com/?q=' + escape(place.formatted_address)); }
                    }
                });
            }
            else {
                // this is an Activity, Step, or Contact - bind the Locations field and autocomplete a location
                var dialogText;
                if (item.IsActivity() || item.IsStep()) { dialogText = Messages.MapDialog.ActivityOrStepText; }
                else if (item.IsContact()) { dialogText = Messages.MapDialog.ContactText; }
                var $dialog = $('<div>' + dialogText + '<p/></div>');
                var field = item.GetField(FieldNames.Locations);
                var $field = Control.LocationList.renderInput($dialog, item, field, function (input) { return false; });
                Control.popup($dialog, header, function (inputs) {
                    Control.LocationList.update($field);
                    var place = $field.data('place');
                    if (place != null) {
                        if (Browser.IsMobile()) { window.open('maps:' + escape(place.formatted_address)); }
                        else { window.open('http://maps.google.com/?q=' + escape(place.formatted_address)); }
                    }
                });
            }
        }
        return false;
    });
    // wrap in anchor tag to get tooltips to work in Chrome
    return $('<a class="icon" />').append($icon);
}

// return an element that is an icon for emailing
Control.Icons.emailBtn = function Control$Icons$emailBtn(item) {
    var $icon = $('<i class="icon-envelope icon-large icon-blue"></i>');
    $icon.data('item', item);
    Control.tooltip($icon, 'Email');
    var handler = function (email) { window.open('mailto:' + email); };

    $icon.click(function () {
        var $this = $(this);
        $this.tooltip('hide');
        var item = $this.data('item');
        var email = item.GetEmail();
        if (email != null) { handler(email); }
        else {
            // obtain email and invoke the handler at the end
            Control.Icons.infoDialog(item, FieldNames.Email, 'Email', 'email', handler);
        }
        return false;   // do not propogate event
    });
    // wrap in anchor tag to get tooltips to work in Chrome
    return $('<a class="icon" />').append($icon);
}

// return an element that is an icon for texting
Control.Icons.textBtn = function Control$Icons$textBtn(item) {
    var $icon = $('<i class="icon-list-alt icon-large"></i>');
    $icon.data('item', item);
    Control.tooltip($icon, 'Text');
    var handler = function (phoneNumber) {
        // call the phone number
        phoneNumber = phoneNumber.replace(/[^0-9]+/g, '');
        if (Browser.IsMobile()) { window.open("sms:" + phoneNumber); }
        else {
            Control.alert('<p>' + Messages.TextButton.ActionNotSupported + '</p>', 'text ' +
                Control.Icons.formatPhoneNumber(phoneNumber));
        }
    };
    $icon.click(function () {
        var $this = $(this);
        $this.tooltip('hide');
        var item = $this.data('item');
        var phone = item.GetPhoneNumber();
        if (phone != null) { handler(phone); }
        else {
            // obtain phone number and invoke the handler at the end
            Control.Icons.infoDialog(item, FieldNames.Phone, 'Phone', 'sms', handler);
        }
        return false;   // do not propogate event
    });
    // wrap in anchor tag to get tooltips to work in Chrome
    return $('<a class="icon" />').append($icon);
}

Control.Icons.scheduleBtn = function Control$Icons$scheduleBtn(item) {
    var $icon = $('<i class="icon-calendar icon-large"></i>');
    $icon.data('item', item);
    Control.tooltip($icon, 'Add to Calendar');
    $icon.attr('caption', 'Calendar');
    $icon.bind('click', function () {
        var $this = $(this);
        $this.tooltip('hide');
        var item = $this.data('item');
        var activity = item.GetParent();
        var $dialog = $('<div><label>Date: </label><input id="datepicker" type="date"/><label>Start time: </label><input type="time"/><label>End time: </label><input type="time"/><label>Title: </label><input type="text" id="name"/></div>');
        $dialog.find('#name').val(activity.Name);
        $dialog.find('#datepicker').val((new Date()).format('shortDate'));
        if (!Browser.IsMobile() && Browser.IsMSIE()) { $dialog.find('#datepicker').datepicker(); }
        var header = Messages.ScheduleDialog.HeaderText;
        Control.popup($dialog, header, function (inputs) {
            if (inputs[0].length == 0) {
                Control.alert(Messages.ScheduleDialog.NoDateError, Messages.ScheduleDialog.AlertHeaderText);
            }
            else {
                var now = new Date();
                now.setHours(0, 0, 0, 0);
                var start = new Date(inputs[0]);
                if (start < now) {
                    Control.alert(Messages.ScheduleDialog.InvalidDateError, Messages.ScheduleDialog.AlertHeaderText);
                    return;
                }
                var end = new Date(start);
                var startTime = start.parseTime(inputs[1]);
                var endTime = end.parseTime(inputs[2]);
                if (startTime != null) {
                    start.setHours(startTime.getHours());
                    start.setMinutes(startTime.getMinutes());
                    if (endTime != null) {
                        end.setHours(endTime.getHours());
                        end.setMinutes(endTime.getMinutes());
                    }
                    else { // if no end time, default to one hour duration
                        end.setHours(startTime.getHours() + 1);
                        end.setMinutes(startTime.getMinutes());
                    }
                }
                else {
                    // if no start time was set, create a full day appointment
                    start.setHours(0);
                    start.setMinutes(0);
                    end.setDate(end.getDate() + 1);
                    end.setHours(0);
                    end.setMinutes(0);
                }
                // create appointment object
                var loc = item.GetLocation();
                var location = (loc != null) ? loc.GetFieldValue(FieldNames.Address) : null;
                var name = (inputs[3].length > 0) ? inputs[3] : activity.Name;
                var appt = Appointment.Extend({ Name: name, StartTime: start, EndTime: end, Location: location, ItemID: item.ID });
                Service.InvokeController('Actions', 'CreateAppointment',
                    { 'Appointment': appt },
                    function (responseState) {
                        var result = responseState.result;
                        if (result.StatusCode != '200') {
                            Control.alert(Messages.ScheduleDialog.ServerError, Messages.ScheduleDialog.AlertHeaderText);
                        }
                        else {
                            var returnedItem = result.Result;
                            var success = item.update(returnedItem, null);  // update local DataModel (do not fire datachanged)
                            item.Complete();

                            // report success to the user
                            var formattedDate = (startTime != null) ? start.format('shortDateTime') : start.format('shortDate');
                            //Control.alert('An appointment for ' + formattedDate + ' was created on your calendar', name);
                        }
                    }
                );
                // put up an indication that event is being created
                Control.working(Messages.ScheduleDialog.AddingText, 1000);
            }
        });
        return false;   // do not propogate event
    });
    // wrap in anchor tag to get tooltips to work in Chrome
    return $('<a class="icon" />').append($icon);
}

Control.Icons.askFriendsBtn = function Control$Icons$askFriendsBtn(item) {
    var $icon = $('<i class="icon-facebook icon-large"></i>');
    $icon.data('item', item);
    Control.tooltip($icon, 'Ask Facebook Friends');
    $icon.attr('caption', 'Ask');
    $icon.bind('click', function () {
        var $this = $(this);
        $this.tooltip('hide');
        var item = $this.data('item');
        var activity = item.GetParent();
        var $dialog = $('<div><label>Question: </label><textarea /></div>');
        var location = 'Redmond'; // hardcode for now
        var text = 'Do you know a good ' + item.GetFieldValue(ExtendedFieldNames.Article) + ' in ' + location + '?';
        $dialog.find('textarea').val(text).css('height', '75');
        var header = Messages.AskFriendsDialog.HeaderText;
        Control.popup($dialog, header, function (inputs) {
            if (inputs[0].length == 0) {
                Control.alert(Messages.AskFriendsDialog.QuestionText, Messages.AskFriendsDialog.HeaderText);
            }
            else {
                text = inputs[0];
                Service.InvokeController('Actions', 'PostOnFacebook',
                    { 'Question': text },
                    function (responseState) {
                        var result = responseState.result;
                        if (result.StatusCode != '200') {
                            Control.alert(Messages.AskFriendsDialog.ServerError, Messages.AskFriendsDialog.HeaderText);
                        }
                        else {
                            var returnedItem = result.Result;
                            if (returnedItem != null) {
                                var success = item.update(returnedItem, null);  // update local DataModel (do not fire datachanged)
                                item.Complete();
                            }

                            // report success to the user
                            //Control.alert('Question posted on Facebook!', 'Ask Facebook friends');
                        }
                    }
                );
                // put up an indication that event is being created
                Control.working(Messages.AskFriendsDialog.PostingText, 1500);
            }
        });
        return false;   // do not propogate event
    });
    // wrap in anchor tag to get tooltips to work in Chrome
    return $('<a class="icon" />').append($icon);
}

// return an element that is an icon for finding a local business
Control.Icons.findLocalBtn = function Control$Icons$findLocalBtn(item) {
    var $icon = $('<i class="icon-search icon-large"></i>');
    $icon.data('item', item);
    Control.tooltip($icon, 'Find');
    $icon.bind('click', function () {
        var $this = $(this);
        $this.tooltip('hide');
        var item = $this.data('item');
        var term = item.Name.toLowerCase();
        term = term.replace(/^find an /, '');
        term = term.replace(/^find a /, '');
        term = term.replace(/^find /, '');
        window.open('https://maps.google.com/?q=' + term + '&radius=1');
        return false;   // do not propogate event
    });
    // wrap in anchor tag to get tooltips to work in Chrome
    return $('<a class="icon" />').append($icon);
}

Control.Icons.infoDialogForContactOrLocation = function Control$Icons$infoDialogForContactOrLocation(item, fieldName, labelName, inputType, handler) {
    // set up defaults
    fieldName = (fieldName == null) ? FieldNames.Phone : fieldName;
    labelName = (labelName == null) ? "Phone" : labelName;
    inputType = (inputType == null) ? "tel" : inputType;
    // set up dialog
    var entityName = item.IsLocation() ? 'location' : 'contact';
    var header = Messages.InfoDialogForContactOrLocation.HeaderText(entityName);
    var $dialog = $('<div><label>' + labelName + '</label><input type="' + inputType + '" id="dataField"/></div>');
    var $dataField = $dialog.find('#dataField');

    Control.popup($dialog, header, function (inputs) {
        if (inputs[0].length == 0) {
            Control.alert(Messages.InfoDialogForContactOrLocation.NoDataError(labelName.toLocaleLowerCase(), entityName),
                Messages.InfoDialogForContactOrLocation.AlertHeaderText);
        }
        else {
            // update the field with the data value 
            var dataValue = inputs[0];
            var updatedItem = Item.Extend(item);
            updatedItem.SetFieldValue(fieldName, dataValue);
            item.Update(updatedItem);

            // invoke handler
            if (handler != null) { handler(dataValue); }
        }
    });
}

Control.Icons.infoDialog = function Control$Icons$infoDialog(item, fieldName, labelName, inputType, handler) {
    // handle locations and contacts using a different dialog
    if (item.IsLocation() || item.IsContact()) { return Control.Icons.infoDialogForContactOrLocation(item, fieldName, labelName, inputType, handler); }

    // set up defaults
    fieldName = (fieldName == null) ? FieldNames.Phone : fieldName;
    labelName = (labelName == null) ? "Phone" : labelName;
    inputType = (inputType == null) ? "tel" : inputType;
    // set up dialog
    var header = Messages.InfoDialog.HeaderText;
    var $dialog = $('<div class="form-vertical control-group"></div>');
    $('<label class="control-label">' + Messages.InfoDialog.LocationText + '</label>').appendTo($dialog);
    var locfield = item.GetField(FieldNames.Locations);
    var $locfield = Control.LocationList.renderInput($dialog, item, locfield, function ($input) {
        if (fieldName == FieldNames.Phone) {
            var place = $input.data('place');
            if (place != null) { $dataField.val(place.formatted_phone_number); }
            else { $dataField.val(''); }
        }
        else { $dataField.val(''); }
    });
    $dialog.append('<label class="control-label">' + Messages.InfoDialog.ContactText + '</label>');
    var confield = item.GetField(FieldNames.Contacts);
    var $confield = Control.ContactList.renderInput($dialog, item, confield, function ($input) {
        var contactJson = $input.data(FieldNames.Contacts);
        var contact = Item.Extend($.parseJSON(contactJson));
        contact = DataModel.FindItem(contact.ID);
        if (contact != null) { $dataField.val(contact.GetFieldValue(fieldName)); }
        else { $dataField.val(''); }
    });
    $dialog.append('<div class="controls" style="margin-top:6px"><label class="control-label">' +
        labelName + '</label><input type="' + inputType + '" id="dataField"/></div>');
    var $dataField = $dialog.find('#dataField');

    $locfield.blur(function (e) {
        if ($locfield.val().length > 0) { $confield.attr('disabled', true); }
        else { $confield.attr('disabled', false); }
        return true;
    });
    $confield.blur(function (e) {
        if ($confield.val().length > 0) { $locfield.attr('disabled', true); }
        else { $locfield.attr('disabled', false); }
        return true;
    });

    Control.popup($dialog, header, function (inputs) {
        if (inputs[2].length == 0) {
            Control.alert(Messages.InfoDialog.NoDataError(labelName.toLocaleLowerCase(), 'location or contact'), Messages.InfoDialog.AlertHeaderText);
        }
        else if ((inputs[0].length == 0 || inputs[0] == 'Enter a location') && inputs[1].length == 0) {
            Control.alert(Messages.InfoDialog.NoContactOrLocationError, Messages.InfoDialog.AlertHeaderText);
        }
        else {
            var dataValue = inputs[2];

            // update the field with the contact or location 
            if (inputs[1].length > 0) {
                Control.ContactList.update($confield, function (returnedItem) {
                    // store the phone number in the contact
                    returnedItem = Item.Extend(returnedItem);
                    var contact = Item.Extend(returnedItem);
                    contact.SetFieldValue(fieldName, dataValue);
                    returnedItem.Update(contact);
                });
            }
            else if (inputs[0].length > 0) {
                Control.LocationList.update($locfield, function (returnedItem) {
                    // store the phone number in the location
                    returnedItem = Item.Extend(returnedItem);
                    var location = Item.Extend(returnedItem);
                    location.SetFieldValue(fieldName, dataValue);
                    returnedItem.Update(location);
                });
            }

            // invoke handler
            if (handler != null) { handler(dataValue); }
        }
    });
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

// ---------------------------------------------------------
// Control.ActionType static object
// static re-usable helper to display and update Action Type on an item
//
Control.ActionType = {};
Control.ActionType.renderDropdown = function Control$ActionType$renderDropdown($element, item, noLabel) {
    // return dummy $element if item has no ActionType field
    if (!item.HasField(FieldNames.ActionType)) return $('<dummy />');

    var currentActionTypeName = item.GetFieldValue(FieldNames.ActionType);
    if (currentActionTypeName == null) currentActionTypeName = ActionTypes.Reminder;
    var $wrapper = $wrapper = $('<div class="control-group"></div>').appendTo($element);
    if (noLabel != true) {
        var labelType = (item.IsFolder() || item.IsList) ? 'List' : 'Item';
        var label = '<label class="control-label">Type of ' + labelType + '</label>';
        $(label).appendTo($wrapper);
    }

    var $btnGroup = $('<div class="dropdown" />').appendTo($wrapper);
    var $btn = $('<a class="icon dropdown-toggle" data-toggle="dropdown" />').appendTo($btnGroup);
    Control.Icons.forActionType(currentActionTypeName).appendTo($btn);
    if (noLabel != true) {
        $('<span>&nbsp;&nbsp;' + currentActionTypeName + '</span>').appendTo($btn);
        $('<span class="pull-right">&nbsp;&nbsp;<span class="caret" /></span>').appendTo($btn);
    }

    var $dropdown = $('<ul class="dropdown-menu" />').appendTo($btnGroup);
    $dropdown.data('item', item);
    for (var id in ActionTypes) {
        var actionType = ActionTypes[id];
        if (actionType == ActionTypes.All) continue;
        var $menuitem = $('<li><a></a></li>').appendTo($dropdown);
        $menuitem.find('a').append(Control.Icons.forActionType(actionType));
        $menuitem.find('a').append('<span>&nbsp;&nbsp;' + actionType + '</span>');
        $menuitem.data('value', id);
        $menuitem.click(function (e) { Control.ActionType.update($(this)); e.preventDefault(); });
    }

    return $wrapper;
}

Control.ActionType.update = function Control$ActionType$update($menuitem) {
    var item = $menuitem.parent().data('item');
    var updatedItem = item.Copy();
    var newActionType = $menuitem.data('value');
    var newActionTypeName = ActionTypes[newActionType];
    updatedItem.SetFieldValue(updatedItem.GetField(FieldNames.ActionType), newActionTypeName);
    var $button = $menuitem.parents('.btn-group').first().find('.btn');
    $button.find('i').replaceWith(Control.Icons.forActionType(newActionTypeName));
    var $label = $menuitem.find('span').first();
    if ($label.length > 0) { $button.find('span').first().html($label.html()); }
    item.Update(updatedItem);
}

// ---------------------------------------------------------
// Control.DeferButton static object
// static re-usable helper to display defer button dropdown
//
Control.DeferButton = {};
Control.DeferButton.renderDropdown = function Control$DeferButton$renderDropdown($element, item) {
    // only render if the item type has an DueDate field within 30 days of today
    if (!item.HasField(FieldNames.DueDate)) { return; }
    // get the current due date
    var field = item.GetField(FieldNames.DueDate);
    var currentDueDate = item.GetFieldValue(field);
    var dueDate = new Date(currentDueDate);
    if (dueDate.compareTo(Date.today().add(30).days()) == 1) { return; }

    var $btnGroup = $('<div class="control-group inline" />').appendTo($element);
    if (Browser.IsMobile()) { $btnGroup.addClass('btn-group'); }
    else { $btnGroup.addClass('dropdown dropcenter'); }

    var $icon = Control.Icons.deferBtn(item);
    var $btn = $('<a class="dropdown-toggle" data-toggle="dropdown"></a>').append($icon).appendTo($btnGroup);
    if (Browser.IsMobile()) { $btn.addClass('btn btn-step'); }
    var $dropdown = $('<ul class="dropdown-menu" />').appendTo($btnGroup);
    $dropdown.data('item', item);

    var title = $icon.attr('title');
    $icon.attr('title', null);
    var $title = $('<p />').appendTo($btn);
    $title.html(title);

    var $menuitem;
    // defer to tomorrow
    if (dueDate.compareTo(Date.today().add(1).days()) == -1) {
        var $menuitem = $('<li><a></a></li>').css('border-top', '0px').appendTo($dropdown);
        $menuitem.find('a').append('<span>&nbsp;Tomorrow</span>');
        $menuitem.click(function (e) { Control.DeferButton.update(item, 1); e.preventDefault(); });
    }
    // defer to next week
    if (dueDate.compareTo(Date.today().add(6).days()) == -1) {
        $menuitem = $('<li><a></a></li>').css('border-top', '0px').appendTo($dropdown);
        $menuitem.find('a').append('<span>&nbsp;Next week</span>');
        $menuitem.click(function (e) { Control.DeferButton.update(item, 7); e.preventDefault(); });
    }
    if (dueDate.compareTo(Date.today().add(30).days()) == -1) {
        // defer to next month
        $menuitem = $('<li><a></a></li>').css('border-top', '0px').appendTo($dropdown);
        $menuitem.find('a').append('<span>&nbsp;Next month</span>');
        $menuitem.click(function (e) { Control.DeferButton.update(item, 30); e.preventDefault(); });
    }
    return $btnGroup;
}

Control.DeferButton.update = function Control$DeferButton$update(item, days) {
    var updatedItem = item.Copy();
    var field = item.GetField(FieldNames.DueDate);
    var date = Date.today();
    switch (days) {
        case 7:  // if deferring by a week, defer to the next Sunday
            date = date.next().sunday();
            break;
        case 30:  // if deferring by a month, defer to the first of the next month
            date = date.next().month().moveToFirstDayOfMonth();
            break;
        default:
            date = date.add(days).days();
            break;
    }
    updatedItem.SetFieldValue(field, date.format('shortDate'));
    item.Update(updatedItem);
}

// ---------------------------------------------------------
// Control.ThemePicker static object
// static re-usable helper to display theme picker and update UserSettings
//
Control.ThemePicker = {};
Control.ThemePicker.render = function Control$ThemePicker$render($element) {
    var themes = DataModel.Constants.Themes;
    var currentTheme = DataModel.UserSettings.Preferences.Theme;
    var $wrapper = $('<div class="control-group"><label class="control-label">Theme</label></div>').appendTo($element);

    var $btnGroup = $('<div class="btn-group" />').appendTo($wrapper);
    var $btn = $('<a class="btn dropdown-toggle" data-toggle="dropdown" />').appendTo($btnGroup);
    $('<span>' + currentTheme + '</span>').appendTo($btn);
    $('<span class="pull-right">&nbsp;&nbsp;<span class="caret" /></span>').appendTo($btn);

    var $dropdown = $('<ul class="dropdown-menu" />').appendTo($btnGroup);
    for (var i in themes) {
        $('<li><a>' + themes[i] + '</a></li>').appendTo($dropdown);
    }
    $dropdown.click(function (e) {
        var $element = $(e.target)
        var theme = $element.html();
        DataModel.UserSettings.UpdateTheme(theme);
        $element.parents('.btn-group').find('span').first().html(theme);
        e.preventDefault();
    });
    return $wrapper;
}

// ---------------------------------------------------------
// Control.Actions static object
// static re-usable helper to display action buttons
//
Control.Actions = {};
Control.Actions.render = function Control$Actions$render($element, item) {
    if (Browser.IsMobile()) {
        var $toolbar = $('<div class="btn-toolbar hide" />').appendTo($element);

        // render complete, action, and info buttons
        var $btn = this.iconButton(Control.Icons.completeBtn(item, function (item) { return Control.Icons.completeHandler(item); }), true).appendTo($toolbar);
        $btn.css('margin-right', '24px');
        // render the action button based on the action type
        var $actionButton = this.renderAction(item);
        if ($actionButton != null) {
            this.iconButton($actionButton).appendTo($toolbar);
        }
        //var $deferBtn = Control.DeferButton.renderDropdown($toolbar, item);
        //this.iconButton(Control.Icons.skipBtn(item), true).appendTo($toolbar);
        this.iconButton(Control.Icons.infoBtn(item), false).appendTo($toolbar);
    } else {
        var $toolbar = $('<div class="btn-toolbar pull-right" />').appendTo($element);

        // render complete, action, and info buttons
        var $btn = Control.Icons.completeBtn(item, function (item) { return Control.Icons.completeHandler(item); }).appendTo($toolbar);
        //$btn.css('margin-right', '24px');
        // render the action button based on the action type
        var $actionButton = this.renderAction(item);
        if ($actionButton != null) {
            $actionButton.prependTo($toolbar);
        }
        //var $deferBtn = Control.DeferButton.renderDropdown($toolbar, item);
        //Control.Icons.skipBtn(item).appendTo($toolbar);
    }
}

Control.Actions.renderAction = function Control$Actions$renderAction(item) {
    var actionType = item.GetActionType();
    if (actionType == null) return null;
    var actionTypeName = actionType.Name;
    switch (actionTypeName) {
        case ActionTypes.Call:
            return Control.Icons.callBtn(item);
        case ActionTypes.TextMessage:
            return Control.Icons.textBtn(item);
        case ActionTypes.SendEmail:
            return Control.Icons.emailBtn(item);
        case ActionTypes.Errand:
            return Control.Icons.mapBtn(item);
        case ActionTypes.Find:
            return Control.Icons.findLocalBtn(item);
        case ActionTypes.Schedule:
            return Control.Icons.scheduleBtn(item);
        case ActionTypes.AskFriends:
            return Control.Icons.askFriendsBtn(item);
    }
}

// wrap an icon within a btn 
Control.Actions.iconButton = function Control$Actions$mobileButton($iconButton, propagate) {
    var $btn = $('<a class="btn btn-step" />').append($iconButton);
    var $icon = $iconButton.find('i');
    $icon.addClass('icon-blue');
    var caption = $icon.attr('caption');
    var $caption = $('<p />').appendTo($btn);
    $caption.html(caption);
    $btn.click(function (e) { $icon.click(); return (propagate == true) ? true : false; });
    return $btn;
}
