//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// control-icons.js
//
// Controls for rendering icons and types
//      Control.Actions
//      Control.ActionType

// ---------------------------------------------------------
// Control.Actions static object
// static re-usable helper to display action buttons
//
Control.Actions = {};

// render toolbar of action buttons for all actions applicable to item
Control.Actions.render = function Control$Actions$render($element, item, control) {
    var $dueDate;
    if (item.HasField(FieldNames.DueDate)) {
        $dueDate = $('<div />');
        var $dueDateBtn = Control.DateTime.renderDatePickerIcon($dueDate, item, item.GetField(FieldNames.DueDate));
        $dueDate = $dueDate.find('input');
    }

    var $toolbar;
    if (Browser.IsMobile()) {
        // render action, complete, due, and info buttons
        $toolbar = $('<div class="btn-toolbar hide" />').appendTo($element);
        this.mobileButton(this.actionIcon(item)).prependTo($toolbar).removeClass('pull-right');
        this.mobileButton(Control.Actions.infoBtn(item)).appendTo($toolbar);
        if ($dueDate != null) {
            $dueDate.appendTo($toolbar);
            $dueDateBtn.find('i').addClass('icon-large').attr('caption', 'Due');
            this.mobileButton($dueDateBtn).appendTo($toolbar);
        }
        this.mobileButton(Control.Actions.completeBtn(item, function (item) { return Control.Actions.completeHandler(item); })).appendTo($toolbar);
    } else {
        $toolbar = $('<div class="btn-toolbar pull-right" />').appendTo($element);
        // render complete, due, edit, delete buttons
        if (item.IsActive()) {
            var $completeBtn = this.iconButton(Control.Actions.completeBtn(item, function (item) { return Control.Actions.completeHandler(item); })).appendTo($toolbar);
            $completeBtn.addClass('btn-primary btn-complete');
        }
        if ($dueDate != null && !(item.IsComplete() || item.IsSkipped())) {
            $dueDate.appendTo($toolbar);
            $dueDateBtn.find('i').addClass('icon-large');
            this.iconButton($dueDateBtn).appendTo($toolbar);
        }
        if (control != null) {  // include edit and delete buttons
            this.iconButton(Control.Actions.editBtn(item, control)).appendTo($toolbar);
            this.iconButton(Control.Actions.deleteBtn(item)).appendTo($toolbar);
        }
    }
    return $toolbar;
}

// render a single action button based on ActionType of item 
Control.Actions.renderButton = function Control$Actions$actionButton(item) {
    return this.iconButton(this.actionIcon(item));
}

Control.Actions.actionIcon = function Control$Actions$actionIcon(item) {
    var actionType = item.GetActionType();
    if (actionType == null) return null;
    var actionTypeName = actionType.Name;
    switch (actionTypeName) {
        case ActionTypes.Call:
            return Control.Actions.callBtn(item);
        case ActionTypes.TextMessage:
            return Control.Actions.textBtn(item);
        case ActionTypes.SendEmail:
            return Control.Actions.emailBtn(item);
        case ActionTypes.Errand:
            return Control.Actions.mapBtn(item);
        case ActionTypes.Find:
            return Control.Actions.findLocalBtn(item);
        case ActionTypes.Schedule:
            return Control.Actions.scheduleBtn(item);
        case ActionTypes.AskFriends:
            return Control.Actions.askFriendsBtn(item);
        default:
            return Control.Icons.forActionType(actionType).addClass('icon-large');
    }
}
// wrap icon within a btn with a caption for mobile
Control.Actions.mobileButton = function Control$Actions$mobileButton($icon) {
    var $btn = $icon;
    if ($btn.hasClass('btn')) { $btn.addClass('btn-step pull-right'); }
    else { $btn = $('<a class="btn btn-step pull-right" />').append($icon); }
    $icon = $icon.find('i');
    $icon.addClass('icon-blue');
    var $caption = $('<p />').appendTo($btn);
    $caption.html($icon.attr('caption'));
    return $btn;
}
// wrap icon within a btn
Control.Actions.iconButton = function Control$Actions$iconButton($icon) {
    var $btn = $icon;
    if ($btn.hasClass('btn')) { $btn.addClass('btn-step icon'); }
    else { $btn = $('<a class="btn btn-step icon" />').append($icon); }
    $btn.find('i').addClass('icon-blue');
    return $btn;
}

// return an element that is an icon to edit an item
Control.Actions.editBtn = function Control$Actions$editBtn(item, control) {
    var $icon = $('<i class="icon-pencil"></i>');
    $icon.data('control', control);
    $icon.data('item', item);
    Control.tooltip($icon, 'Edit');
    $icon.click(function () {
        $(this).tooltip('hide');
        var item = $(this).data('item');
        Control.get(this).parentControl.selectItem(item);
        Events.Track(Events.Categories.Organizer, Events.Organizer.EditStep);
        return false;   // do not propogate event
    });
    // wrap in anchor tag to get tooltips to work in Chrome
    return $('<a class="icon" />').append($icon);
}

// return an element that is an icon for deleting an item
Control.Actions.deleteBtn = function Control$Actions$deleteBtn(item) {
    var $icon = $('<i class="icon-remove-sign"></i>');
    $icon.css('cursor', 'pointer');
    $icon.data('item', item);
    Control.tooltip($icon, 'Delete');
    $icon.click(function () {
        $(this).tooltip('hide');
        var item = $(this).data('item');
        var activeItem = (item.ParentID == null) ? item.GetFolder() : item.GetParent();
        item.Delete(activeItem);
        Events.Track(Events.Categories.Organizer, Events.Organizer.DeleteStep);
        return false;   // do not propogate event
    });
    // wrap in anchor tag to get tooltips to work in Chrome
    return $('<a class="icon" />').append($icon);
}

// return an element that is an icon for completing an item
Control.Actions.completeBtn = function Control$Actions$completeBtn(item, handler) {
    var $icon = $('<i class="icon-check icon-large"></i>');
    $icon.data('item', item);
    Control.tooltip($icon, 'Complete', null);
    $icon.attr('caption', 'Done');
    $icon.click(function () {
        $(this).tooltip('hide');
        var item = $(this).data('item');
        if (handler == null || handler(item) == true) {
            item.Complete();
            Events.Track(Events.Categories.Organizer, Events.Organizer.CompleteButton);
        } 
        return true;    // always let event propogate
    });
    // wrap in anchor tag to get tooltips to work in Chrome
    return $('<a class="icon" />').append($icon);
}

// handler for completing an item, prompts for location if necessary
Control.Actions.completeHandler = function Control$Actions$completeHandler(item) {
    var activity = item.GetParent();
    var actionType = item.GetActionType();
    if (activity != null && actionType != null) {
        var $dialog = null;
        var header = null;
        switch (actionType.Name) {
            case ActionTypes.Find:
                $dialog = $('<div>' + Messages.CompleteHandler.FindText + '<p/></div>');
                var field = item.GetField(FieldNames.Locations);
                var $field = Control.LocationList.renderInput($dialog, item, field, function (input) { return false; });
                $field.addClass('input-xxlarge');
                header = activity.Name;
                break;
            default:
                return true; // indicate that complete returned successfully
        }
        if ($dialog != null) {
            Control.popup($dialog, header, 
                function (inputs) {
                    Control.LocationList.update($field);
                    item.Complete();
                    Events.Track(Events.Categories.Organizer, Events.Organizer.CompleteButton);
                    return true;
                },
                function (inputs) { return false; }
            );
        }
    }
    return false;
}

// return an element that is an icon for skipping an item
Control.Actions.skipBtn = function Control$Actions$skipBtn(item) {
    var $icon = $('<i class="icon-share icon-large"></i>');
    $icon.data('item', item);
    Control.tooltop($icon, 'Skip');
    $icon.click(function () {
        $(this).tooltip('hide');
        var item = $(this).data('item');
        item.Skip();
        return true;   // propogate event to refresh display
    });
    // wrap in anchor tag to get tooltips to work in Chrome
    return $('<a class="icon" />').append($icon);
}

// return an element that is an icon for viewing item information
Control.Actions.infoBtn = function Control$Actions$infoBtn(item) {
    var $icon = $('<i class="icon-info-sign  icon-large"></i>');
    $icon.data('item', item);
    Control.tooltip($icon, 'Info');
    $icon.click(function () {
        $(this).tooltip('hide');
        var item = $(this).data('item');
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
Control.Actions.callBtn = function Control$Actions$callBtn(item) {
    var $icon = $('<i class="icon-phone icon-large"></i>');
    $icon.data('item', item);
    Control.tooltip($icon, 'Call');

    // handler for calling phone number
    var handler = function (phoneNumber) {
        phoneNumber = phoneNumber.replace(/[^0-9]+/g, '');
        if (Browser.IsMobile()) {
            window.open("tel:" + phoneNumber);
            return false;
        } else {
            Control.alert(Messages.CallButton.ActionNotSupported,
                'Call ' + Control.Actions.formatPhoneNumber(phoneNumber),
                Control.Actions.infoDialogCloseHandler);
            return true;
        }
    };

    $icon.click(function () {
        $(this).tooltip('hide');
        var item = $(this).data('item');
        var phone = item.GetPhoneNumber();
        var propogate = true;
        if (phone == null) {
            // prompt for phone number and invoke handler
            Control.Actions.infoDialog(item, FieldNames.Phone, 'Phone', 'tel', handler);
        } else {
            propogate = handler(phone);
        }
        Events.Track(Events.Categories.Organizer, Events.Organizer.CallButton);
        return propogate;   
    });
    // wrap in anchor tag to get tooltips to work in Chrome
    return $('<a class="icon" />').append($icon);
}

// return an element that is an icon for texting
Control.Actions.textBtn = function Control$Actions$textBtn(item) {
    var $icon = $('<i class="icon-list-alt icon-large"></i>');
    $icon.data('item', item);
    Control.tooltip($icon, 'Text');
    // handler for texting phone number
    var handler = function (phoneNumber) {
        phoneNumber = phoneNumber.replace(/[^0-9]+/g, '');
        if (Browser.IsMobile()) {
            window.open("sms:" + phoneNumber);
        } else {
            Control.alert(Messages.TextButton.ActionNotSupported,
                'Send text to ' + Control.Actions.formatPhoneNumber(phoneNumber));
        }
    };

    $icon.click(function () {
        $(this).tooltip('hide');
        var item = $(this).data('item');
        var phone = item.GetPhoneNumber();
        if (phone == null) {
            // prompt for phone number and invoke handler
            Control.Actions.infoDialog(item, FieldNames.Phone, 'Phone', 'sms', handler);
        } else {        
            handler(phone);
        }
        Events.Track(Events.Categories.Organizer, Events.Organizer.TextButton);
        return false;   // do not propogate event
    });
    // wrap in anchor tag to get tooltips to work in Chrome
    return $('<a class="icon" />').append($icon);
}

// TODO: find and use js library for formatting phone numbers
Control.Actions.formatPhoneNumber = function Control$Actions$formatPhoneNumber(phone) {
    if (phone.length == 7) { return phone.slice(0, 3) + '-' + phone.slice(3, 7); }
    if (phone.length == 10) { return '(' + phone.slice(0, 3) + ') ' + phone.slice(3, 6) + '-' + phone.slice(6, 10); }
    return phone;
}

// return an element that is an icon for mapping
Control.Actions.mapBtn = function Control$Actions$mapBtn(item) {
    var $icon = $('<i class="icon-map-marker icon-large icon-blue"></i>');
    $icon.data('item', item);
    Control.tooltip($icon, 'Map');

    $icon.click(function () {
        $(this).tooltip('hide');
        var item = $(this).data('item');
        var link = item.GetMapLink();
        if (link != null) {
            window.open(link); 
        } else {
            var header = item.Name;
            var $dialog, $field, field;
            if (item.IsLocation()) {    // bind Address field and autocomplete location
                $dialog = $('<div>' + Messages.MapDialog.LocationText + '<p/></div>');
                field = item.GetField(FieldNames.Address);
                $field = Control.Text.renderInputAddress($dialog, item, field, function (input) { return false; });
                $field.addClass('input-xxlarge');
                Control.popup($dialog, header, function (inputs) {
                    Control.Text.updateAddress($field);
                    var place = $field.data('place');
                    if (place != null) {
                        if (Browser.IsMobile()) { window.open('maps:' + escape(place.formatted_address)); }
                        else { window.open('http://maps.google.com/?q=' + escape(place.formatted_address)); }
                    }
                });
            }
            else {  // bind the Locations field and autocomplete location
                var dialogText;
                if (item.IsActivity() || item.IsStep()) {
                    dialogText = Messages.MapDialog.ActivityOrStepText;
                } else if (item.IsContact()) {
                    dialogText = Messages.MapDialog.ContactText; 
                }
                $dialog = $('<div>' + dialogText + '<p/></div>');
                field = item.GetField(FieldNames.Locations);
                $field = Control.LocationList.renderInput($dialog, item, field, function (input) { return false; });
                $field.addClass('input-xxlarge');
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
        Events.Track(Events.Categories.Organizer, Events.Organizer.MapButton);
        return false;
    });
    // wrap in anchor tag to get tooltips to work in Chrome
    return $('<a class="icon" />').append($icon);
}

// return an element that is an icon for emailing
Control.Actions.emailBtn = function Control$Actions$emailBtn(item) {
    var $icon = $('<i class="icon-envelope icon-large icon-blue"></i>');
    $icon.data('item', item);
    Control.tooltip($icon, 'Email');
    var handler = function (email) { window.open('mailto:' + email); };

    $icon.click(function () {
        $(this).tooltip('hide');
        var item = $(this).data('item');
        var email = item.GetEmail();
        if (email != null) {
            handler(email); 
        } else {        // prompt for email and invoke handler
            Control.Actions.infoDialog(item, FieldNames.Email, 'Email', 'email', handler);
        }
        Events.Track(Events.Categories.Organizer, Events.Organizer.EmailButton);
        return false;   // do not propogate event
    });
    // wrap in anchor tag to get tooltips to work in Chrome
    return $('<a class="icon" />').append($icon);
}

Control.Actions.scheduleBtn = function Control$Actions$scheduleBtn(item) {
    var $icon = $('<i class="icon-time icon-large"></i>');
    $icon.data('item', item);
    Control.tooltip($icon, 'Add Appointment');
    $icon.attr('caption', 'Calendar');

    $icon.click(function () {
        $(this).tooltip('hide');
        var item = $(this).data('item');
        var activity = item.GetParent();
        var $dialog = $('<div><label>Date: </label><input type="date" class="schedule-date"/><label>Start time: </label><input type="time"/><label>End time: </label><input type="time"/><label>Title: </label><input type="text" class="schedule-name" /></div>');
        $dialog.find('.schedule-name').val(activity.Name);
        $dialog.find('.schedule-date').val((new Date()).format('shortDate'));
        if (!Browser.IsMobile() && Browser.IsMSIE()) {
            $dialog.find('.schedule-date').datepicker();
        }
        var header = Messages.ScheduleDialog.HeaderText;
        Control.popup($dialog, header, function (inputs) {
            if (inputs[0].length == 0) {
                Control.alert(Messages.ScheduleDialog.NoDateError, Messages.ScheduleDialog.AlertHeaderText);
            } else {
                var now = new Date().setHours(0, 0, 0, 0);
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
                    else {
                        // no end time, default to one hour duration
                        end.setHours(startTime.getHours() + 1);
                        end.setMinutes(startTime.getMinutes());
                    }
                }
                else {
                    // no start time, create full day appointment
                    start.setHours(0);
                    start.setMinutes(0);
                    end.setDate(end.getDate() + 1);
                    end.setHours(0);
                    end.setMinutes(0);
                }

                // create appointment object
                var location = item.GetLocation();
                if (location != null) {
                    location = location.GetFieldValue(FieldNames.Address);
                }
                var name = (inputs[3].length > 0) ? inputs[3] : activity.Name;
                var appt = Appointment.Extend({ Name: name, StartTime: start, EndTime: end, Location: location, ItemID: item.ID });
                Service.InvokeController('Actions', 'CreateAppointment', { 'Appointment': appt },
                    function (responseState) {
                        var result = responseState.result;
                        if (result.StatusCode != '200') {
                            Control.alert(Messages.ScheduleDialog.ServerError, Messages.ScheduleDialog.AlertHeaderText);
                        } else {
                            var returnedItem = result.Result;
                            var success = item.update(returnedItem, null);  // update local DataModel (do not fire datachanged)
                            item.Complete();
                            // report success to the user
                            //var formattedDate = (startTime != null) ? start.format('shortDateTime') : start.format('shortDate');
                            //Control.alert('An appointment for ' + formattedDate + ' was created on your calendar', name);
                        }
                    }
                    // TODO: handle failure case?
                );
                // display working animation (assume success)
                Control.working(Messages.ScheduleDialog.AddingText, 1500);
            }
        });
        Events.Track(Events.Categories.Organizer, Events.Organizer.ScheduleButton);
        return false;   // do not propogate event
    });
    // wrap in anchor tag to get tooltips to work in Chrome
    return $('<a class="icon" />').append($icon);
}

Control.Actions.askFriendsBtn = function Control$Actions$askFriendsBtn(item) {
    var $icon = $('<i class="icon-facebook icon-large"></i>');
    $icon.data('item', item);
    Control.tooltip($icon, 'Ask Facebook Friends');
    $icon.attr('caption', 'Ask');

    $icon.click(function () {
        $(this).tooltip('hide');
        var item = $(this).data('item');
        var activity = item.GetParent();
        var $dialog = $('<div><label>Question: </label><textarea class="input-xxlarge" style="height: 75px;"/></div>');
        var article = item.GetFieldValue(ExtendedFieldNames.Article);
        if (article == null) { article = '<replace this!>'; }
        // TODO: replace 'this area' with the location from the user's profile
        var location = 'this area'; 
        var text = 'Do you know a good ' + item.GetFieldValue(ExtendedFieldNames.Article) + ' in ' + location + '?';
        var header = Messages.AskFriendsDialog.HeaderText;
        Control.popup($dialog, header, function (inputs) {
            if (inputs[0].length == 0) {
                Control.alert(Messages.AskFriendsDialog.QuestionText, Messages.AskFriendsDialog.HeaderText);
            } else {
                text = inputs[0];
                Service.InvokeController('Actions', 'PostOnFacebook', { 'Question': text },
                    function (responseState) {
                        var result = responseState.result;
                        if (result.StatusCode != '200') {
                            Control.alert(Messages.AskFriendsDialog.ServerError, Messages.AskFriendsDialog.HeaderText);
                        } else {
                            var returnedItem = result.Result;
                            if (returnedItem != null) {
                                var success = item.update(returnedItem, null);  // update local DataModel (do not fire datachanged)
                                item.Complete();
                            }
                            // report success to the user
                            //Control.alert('Question posted on Facebook!', 'Ask Facebook friends');
                        }
                    }
                    // TODO: handle failure case?
                );
                // display working animation (assume success)
                Control.working(Messages.AskFriendsDialog.PostingText, 1500);
            }
        });
        return false;   // do not propogate event
        Events.Track(Events.Categories.Organizer, Events.Organizer.AskFriendsButton);
    });
    // wrap in anchor tag to get tooltips to work in Chrome
    return $('<a class="icon" />').append($icon);
}

// return an element that is an icon for finding a local business
Control.Actions.findLocalBtn = function Control$Actions$findLocalBtn(item) {
    var $icon = $('<i class="icon-search icon-large"></i>');
    $icon.data('item', item);
    Control.tooltip($icon, 'Find');

    $icon.click(function () {
        $(this).tooltip('hide');
        var item = $(this).data('item');
        var term = item.Name.toLowerCase();
        term = term.replace(/^find an /, '');
        term = term.replace(/^find a /, '');
        term = term.replace(/^find /, '');
        if (Browser.IsMobile() && Browser.IsMSIE()) {
            window.open('http://maps.google.com/search?q=' + term + '&tbm=plcs&radius=1');
        }
        else {
            window.open('https://maps.google.com/?q=' + term + '&radius=1');
            if (Control.Actions.openWindowHandler != null) {
                Control.Actions.openWindowHandler();
            }
        }
        Events.Track(Events.Categories.Organizer, Events.Organizer.FindButton);
        return false;   
    });
    // wrap in anchor tag to get tooltips to work in Chrome
    return $('<a class="icon" />').append($icon);
}

Control.Actions.infoDialog = function Control$Actions$infoDialog(item, fieldName, labelName, inputType, handler) {
    if (item.IsLocation() || item.IsContact()) {
        // handle locations and contacts using a different dialog
        return Control.Actions.infoDialogForContactOrLocation(item, fieldName, labelName, inputType, handler);
    }

    // set up defaults
    fieldName = (fieldName == null) ? FieldNames.Phone : fieldName;
    labelName = (labelName == null) ? "Phone" : labelName;
    inputType = (inputType == null) ? "tel" : inputType;
    // set up dialog
    var header = Messages.InfoDialog.HeaderText;
    var $dialog = $('<div class="form-vertical control-group"></div>');
    // add location input
    $('<label class="control-label">' + Messages.InfoDialog.LocationText + '</label>').appendTo($dialog);
    var field = item.GetField(FieldNames.Locations);
    var $location = Control.LocationList.renderInput($dialog, item, field, function ($input) {
        $phoneInput.val('');
        if (fieldName == FieldNames.Phone) {
            var place = $input.data('place');
            if (place != null) {
                $phoneInput.val(place.formatted_phone_number);
            }
        }
    });
    $location.addClass('input-xxlarge');

    // add contact input
    $dialog.append('<label class="control-label">' + Messages.InfoDialog.ContactText + '</label>');
    field = item.GetField(FieldNames.Contacts);
    var $contact = Control.ContactList.renderInput($dialog, item, field, function ($input) {
        var contactJson = $input.data(FieldNames.Contacts);
        var contact = Item.Extend($.parseJSON(contactJson));
        contact = DataModel.FindItem(contact.ID);
        if (contact != null) {
            $phoneInput.val(contact.GetFieldValue(fieldName));
        } else {
            $phoneInput.val('');
        }
    });
    $contact.addClass('input-xxlarge');

    $dialog.append('<div class="controls" style="margin-top:6px"><label class="control-label">' +
        labelName + '</label><input type="' + inputType + '" class="fn-phone"/></div>');
    // this element in forward-referenced via closure in location and contact handlers
    var $phoneInput = $dialog.find('.fn-phone').attr('disabled', true);

    $location.blur(function (e) {
        if ($location.val().length > 0) {
            $phoneInput.attr('disabled', false);
            $contact.attr('disabled', true);
        } else {
            if ($contact.val().length == 0) { $phoneInput.attr('disabled', true); }
            $contact.attr('disabled', false);
        }
        return true;
    });
    $contact.blur(function (e) {
        if ($contact.val().length > 0) {
            $phoneInput.attr('disabled', false);
            $location.attr('disabled', true);
        } else {
            if ($location.val().length == 0) { $phoneInput.attr('disabled', true); }
            $location.attr('disabled', false); 
        }
        return true;
    });

    Control.popup($dialog, header, function (inputs) {
        // three inputs (location, contact, phone)
        if (inputs[2].length == 0) {
            // phone number is not defined
            Control.alert(Messages.InfoDialog.NoDataError(labelName.toLocaleLowerCase(), 'location or contact'), Messages.InfoDialog.AlertHeaderText);
        } else if (Control.LocationList.IsValid(inputs[0]) && Control.ContactList.IsValid(inputs[1])) {
            // both location and contact are not defined
            Control.alert(Messages.InfoDialog.NoContactOrLocationError, Messages.InfoDialog.AlertHeaderText);
        } else {
            // phone number is defined
            var phone = inputs[2];
            // update the field with the contact or location 
            if (inputs[1].length > 0) {
                Control.ContactList.update($contact, function (item) {
                    // store the phone number in the contact
                    item = Item.Extend(item);
                    var copy = item.Copy();
                    copy.SetFieldValue(fieldName, phone);
                    item.Update(copy);
                });
            } else if (inputs[0].length > 0) {
                Control.LocationList.update($location, function (item) {
                    // store the phone number in the location
                    item = Item.Extend(item);
                    var copy = item.Copy();
                    copy.SetFieldValue(fieldName, phone);
                    item.Update(copy);
                });
            }
            // invoke handler
            if (handler != null) { handler(phone); }
        }
    });
}

Control.Actions.infoDialogForContactOrLocation = function Control$Actions$infoDialogForContactOrLocation(item, fieldName, labelName, inputType, handler) {
    // set up defaults
    fieldName = (fieldName == null) ? FieldNames.Phone : fieldName;
    labelName = (labelName == null) ? "Phone" : labelName;
    inputType = (inputType == null) ? "tel" : inputType;
    // set up dialog
    var entityName = item.IsLocation() ? 'location' : 'contact';
    var header = Messages.InfoDialogForContactOrLocation.HeaderText(entityName);
    var $dialog = $('<div><label>' + labelName + '</label><input type="' + inputType + '" /></div>');

    Control.popup($dialog, header, function (inputs) {
        // single input is either contact or location
        if (inputs[0].length == 0) {
            Control.alert(Messages.InfoDialogForContactOrLocation.NoDataError(labelName.toLocaleLowerCase(), entityName),
                Messages.InfoDialogForContactOrLocation.AlertHeaderText);
        } else {
            // update the field with the input value 
            var copy = item.Copy();
            copy.SetFieldValue(fieldName, inputs[0]);
            item.Update(copy);
            // invoke handler
            if (handler != null) { handler(inputs[0]); }
        }
    });
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





