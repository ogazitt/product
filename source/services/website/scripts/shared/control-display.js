//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// control-display.js
//
// Controls for rendering display types
//      Control.Text
//      Control.Checkbox
//      Control.LinkArray
//      Control.DateTime
//      Control.ContactList
//      Control.LocationList
//      Control.List

// ---------------------------------------------------------
// Control.Text static object
//
Control.Text = {};

// render text in tag (span is default)
Control.Text.render = function Control$Text$render($element, item, field, tag, textBefore, textAfter) {
    var tag = (tag == null) ? 'span' : tag;
    var $tag;
    var value = item.GetFieldValue(field);
    if (field.DisplayType == DisplayTypes.DatePicker) {
        value = Date.formatSafe(value, 'mediumDate');
    } else if (field.FieldType == FieldTypes.DateTime) {
        value = Date.formatSafe(value);
    }

    if (value != null) {
        $tag = $('<' + tag + '/>').appendTo($element);
        $tag.addClass(field.Class);
        value = ((textBefore == null) ? '' : textBefore) + value + ((textAfter == null) ? '' : textAfter);
        $tag.html(value);
    }
    return $tag;
}
// render label strong
Control.Text.renderLabel = function Control$Text$renderLabel($element, item, field) {
    var $label;
    var value = item.GetFieldValue(field);
    if (value != null) {
        $label = $('<label><strong>' + value + '</strong></label>').appendTo($element);
        $label.addClass(field.Class);
    }
    return $label;
}
// render email link
Control.Text.renderEmail = function Control$Text$renderEmail($element, item, field) {
    var $link;
    var value = item.GetFieldValue(field);
    if (value != null) {
        $link = $('<a />').appendTo($element);
        $link.addClass(field.Class);
        $link.attr('href', 'mailto:' + value);
        $link.html(value);
    }
    return $link;
}
// render activity link (can pass either a Step or an Activity)
Control.Text.renderActivityLink = function Control$Text$renderActivityLink($element, item, handler) {
    var $link;
    var name = item.Name;
    if (item.IsStep()) {
        var parent = item.GetParent();
        name = parent.Name;
    }
    if (name != null) {
        $link = $('<a>' + name + '</a>').appendTo($element);
        $link.css('whitespace', 'nowrap');
        $link.click(function (e) { handler(parent); });
    }
    return $link;
}
// render input with update onchange and onkeypress
Control.Text.renderInput = function Control$Text$renderInput($element, item, field) {
    if ($element.attr('type') == 'text') { $text = $element; }
    else { $text = $('<input type="text" />').appendTo($element); }
    $text = Control.Text.base($text, item, field);
    Control.Text.placeholder($text, field);
    $text.change(function (e) { Control.Text.update($(e.srcElement)); });
    $text.keypress(function (e) { if (e.which == 13) { Control.Text.update($(e.srcElement)); return false; } });
    return $text;
}
// render input with insert into list onkeypress (autocomplete based on ItemType)
Control.Text.renderInputNew = function Control$Text$renderInput($element, item, field, list) {
    $text = $('<input type="text" />').appendTo($element);
    $text = Control.Text.base($text, item, field);
    $text.data('list', list);       // list to insert into
    $text.keypress(function (e) { if (e.which == 13) { Control.Text.insert($(e.srcElement)); return false; } });
    // support autocomplete for new Locations and Contacts
    if (item.ItemTypeID == ItemTypes.Location) {
        //Control.Text.autoCompleteAddress($text, Control.Text.insert);
        Control.Text.autoCompletePlace($text, Control.Text.insert);
    } else if (item.ItemTypeID == ItemTypes.Contact) {
        Control.Text.autoCompleteContact($text, Control.Text.insert);
        Control.Text.placeholder($text, 'Enter a contact');
    } else if (item.ItemTypeID == ItemTypes.Step) {
    //    Control.Text.placeholder($text, 'Enter next step');
    } else {
        Control.Text.placeholder($text, 'Enter an item');
    }
    return $text;
}
// render textarea with update onchange
Control.Text.renderTextArea = function Control$Text$renderTextArea($element, item, field) {
    $text = $('<textarea></textarea>').appendTo($element);
    $text = Control.Text.base($text, item, field);
    Control.Text.placeholder($text, field);
    $text.change(function (e) { Control.Text.update($(e.srcElement)); });
    return $text;
}
// render input with update on keypress and autocomplete
Control.Text.renderInputAddress = function Control$Text$renderInputAddress($element, item, field, handler) {
    handler = (handler != null) ? handler : Control.Text.updateAddress;
    if ($element.attr('type') == 'text') { $text = $element; }
    else { $text = $('<input type="text" />').appendTo($element); }
    $text = Control.Text.base($text, item, field);
    $text.keypress(function (e) { if (e.which == 13) { handler($(e.srcElement)); return false; } });
    //$text = Control.Text.autoCompleteAddress($text, Control.Text.updateAddress);
    $text = Control.Text.autoCompletePlace($text, handler);
    return $text;
}
// render input with update on keypress and autocomplete
Control.Text.renderInputGrocery = function Control$Text$renderInputGrocery($element, item, field) {
    $text = $('<input type="text" />').appendTo($element);
    $text = Control.Text.base($text, item, field);
    $text.keypress(function (e) { if (e.which == 13) { Control.Text.updateGrocery($(e.srcElement)); return false; } });
    $text = Control.Text.autoCompleteGrocery($text, Control.Text.updateGrocery);
    return $text;
}
// attach place autocomplete behavior to input element
Control.Text.autoCompletePlace = function Control$Text$autoCompletePlace($input, selectHandler) {
    $input.unbind('keypress');
    $input.keypress(function (e) {
        // attempts at getting dropdown to accept click events in WP7 browser
        //$('.pac-container').css('z-index', 1000000000);
        //$('.pac-container div').css('z-index', 2000000000);
        if (e.which == 13) { return false; }
    });
    var autoComplete = new google.maps.places.Autocomplete($input[0]);
    var getBounds = function (lat, lng) {
        var x = 0.5;
        return new google.maps.LatLngBounds(new google.maps.LatLng(lat - x, lng - x), new google.maps.LatLng(lat + x, lng + x));
    }
    // TODO: review referencing DataModel from Control.Text
    if (DataModel.geoLocation != null) {
        var bounds = getBounds(DataModel.geoLocation[0], DataModel.geoLocation[1]);
        autoComplete.setBounds(bounds);
    }

    google.maps.event.addListener(autoComplete, 'place_changed', function () {
        $input.data('place', autoComplete.getPlace());
        selectHandler($input);
    });

    return $input;
}
// attach address autocomplete behavior to input element
Control.Text.autoCompleteAddress = function Control$Text$autoCompleteAddress($input, selectHandler) {
    $input.autocomplete({
        source: function (request, response) {
            Service.Geocoder().geocode({ 'address': request.term },
                function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        var addresses = $.map(results, function (item) {
                            return {
                                label: item.formatted_address,
                                value: item.formatted_address,
                                latlong: item.geometry.location.toUrlValue()
                            }
                        });
                        response(addresses);
                    }
                });
        },
        select: function (e, ui) {
            $(this).val(ui.item.label);
            $(this).data(FieldNames.LatLong, ui.item.latlong);
            selectHandler($(this));
            return false;
        },
        minLength: 2
    });
    return $input;
}
// attach contact autocomplete behavior to input element
Control.Text.autoCompleteContact = function Control$Text$autoCompleteContact($input, selectHandler) {
    $input.autocomplete({
        source: function (request, response) {
            Service.InvokeController('UserInfo', 'PossibleContacts',
                { 'startsWith': request.term },
                function (responseState) {
                    var result = responseState.result;
                    var contacts = [];
                    if (result.Count > 0) {
                        for (var name in result.Contacts) {
                            contacts.push({ label: name, value: name, json: result.Contacts[name] });
                        }
                    }
                    response(contacts);
                });
        },
        select: function (event, ui) {
            $(this).val(ui.item.label);
            $(this).data(FieldNames.Contacts, ui.item.json);
            selectHandler($(this));
            return false;
        },
        minLength: 1
    }); 
    return $input;
}
// attach grocery autocomplete behavior to input element
Control.Text.autoCompleteGrocery = function Control$Text$autoCompleteGrocery($input, selectHandler) {
    $input.autocomplete({
        source: function (request, response) {
            Service.InvokeController('Grocery', 'GroceryNames',
                { 'startsWith': request.term },
                function (responseState) {
                    var result = responseState.result;
                    var groceries = [];
                    if (result.Count > 0) {
                        for (var i in result.Groceries) {
                            var item = result.Groceries[i];
                            groceries.push({ label: item.Name, value: item.Name, json: item });
                        }
                    }
                    response(groceries);
                });
        },
        select: function (event, ui) {
            $(this).val(ui.item.label);
            $(this).data('grocery', ui.item.json);
            selectHandler($(this));
            return false;
        },
        minLength: 1
    });
    return $input;
}

// handler for inserting new item into list
Control.Text.insert = function Control$Text$insert($input) {
    var field = $input.data('field');
    if (field.Name == FieldNames.Name) {
        var value = $input.val();
        if (value == null || value.length == 0) { return false; }

        var item = $input.data('item');         // item to insert
        var list = $input.data('list');         // list to insert into
        if (item.ItemTypeID == ItemTypes.Location) {
            // autocomplete for new Locations
            var place = $input.data('place');
            var latlong = $input.data(FieldNames.LatLong);
            if (place != null && place.geometry != null) {
                item = Control.Text.applyPlace(item, place);
                value = place.name;
            } else if (latlong != null) {
                item.SetFieldValue(FieldNames.LatLong, latlong);
                item.SetFieldValue(FieldNames.Address, value);
            }
        }
        if (item.ItemTypeID == ItemTypes.Contact) {
            // autocomplete for new Contacts
            var jsonContact = $input.data(FieldNames.Contacts);
            if (jsonContact != null) {
                contact = $.parseJSON(jsonContact);
                if (contact.ItemTypeID == ItemTypes.Contact) {
                    item = Item.Extend(contact);
                }
            }
        }
        if (item.ItemTypeID == ItemTypes.Grocery) {
            // autocomplete for new Grocery
            var grocery = $input.data('grocery');
            if (grocery != null) {
                Control.Text.applyGrocery(item, grocery);
                value = grocery.Name;
            }
        }

        item.SetFieldValue(field, value);
        list.InsertItem(item);
        Events.Track(Events.Categories.Organizer, Events.Organizer.AddStepButton);
    }
}
// handler for updating text
Control.Text.update = function Control$Text$update($input, activeItem) {
    var item = $input.data('item');
    var field = $input.data('field');
    var value = $input.val();
    var currentValue = item.GetFieldValue(field);
    if (value != currentValue) {
        var updatedItem = item.Copy();
        updatedItem.SetFieldValue(field, value);
        item.Update(updatedItem, activeItem);
    }
}
// handler for updating address
Control.Text.updateAddress = function Control$Text$updateAddress($input) {
    var item = $input.data('item');
    var field = $input.data('field');
    var value = $input.val();
    var currentValue = item.GetFieldValue(field);
    var updatedItem = item.Copy();
    var place = $input.data('place');
    var latlong = $input.data(FieldNames.LatLong);
    if (place != null && place.geometry != null) {
        updatedItem = Control.Text.applyPlace(updatedItem, place, field.Name);
    } else if (latlong != null) {
        var currentLatLong = item.GetFieldValue(FieldNames.LatLong);
        if (currentLatLong == null || currentLatLong != latlong) {
            updatedItem.SetFieldValue(FieldNames.LatLong, latlong);
            updatedItem.SetFieldValue(field, value);
        }
    } else if (value != currentValue) {
        updatedItem.SetFieldValue(field, value);
    }
    item.Update(updatedItem);
}
// helper function for applying place properties to an item
Control.Text.applyPlace = function Control$Text$applyPlace(item, place, fieldName) {
    if (item.Name == null || fieldName == FieldNames.Name) { item.SetFieldValue(FieldNames.Name, place.name); }
    item.SetFieldValue(FieldNames.LatLong, place.geometry.location.toUrlValue());
    item.SetFieldValue(FieldNames.Address, place.formatted_address);
    if (place.formatted_phone_number != null && item.GetFieldValue(FieldNames.Phone) == null) {
        item.SetFieldValue(FieldNames.Phone, place.formatted_phone_number);
    }
    var links = item.GetFieldValue(FieldNames.WebLinks);
    if (links == null || links == '[]') {
        var weblinks = new LinkArray();
        if (place.types[0] == 'street_address') {
            weblinks.Add('http://maps.google.com/maps?z=15&t=m&q=' + place.formatted_address, 'Map');
        } else {
            weblinks.Add(place.url, 'Map');
        }
        if (place.website != null) { weblinks.Add(place.website, 'Website'); }
        item.SetFieldValue(FieldNames.WebLinks, weblinks.ToJson());
    }
    return item;
}
// handler for updating grocery
Control.Text.updateGrocery = function Control$Text$updateGrocery($input) {
    var item = $input.data('item');
    var field = $input.data('field');
    var value = $input.val();
    var currentValue = item.GetFieldValue(field);
    var updatedItem = item.Copy();
    var grocery = $input.data('grocery');
    if (grocery != null) {
        updatedItem = Control.Text.applyGrocery(updatedItem, grocery, field.Name);
    } else if (value != currentValue) {
        updatedItem.SetFieldValue(field, value);
    }
    item.Update(updatedItem);
}
// helper function for applying grocery properties to an item
Control.Text.applyGrocery = function Control$Text$applyGrocery(item, grocery, fieldName) {
    if (item.Name == null || fieldName == FieldNames.Name) { item.SetFieldValue(FieldNames.Name, grocery.Name); }
    item.SetFieldValue(FieldNames.Category, grocery.Category);
    item.SetFieldValue(FieldNames.Picture, grocery.ImageUrl);
    return item;
}
// base function for applying class, item, field, and value to element
Control.Text.base = function Control$Text$base($element, item, field) {
    $element.addClass(field.Class);
    $element.data('item', item);
    $element.data('field', field);
    $element.val(item.GetFieldValue(field));
    return $element;
}
// add placeholder attribute to an input element, work-around in IE
Control.Text.placeholder = function Control$Text$placeholder($input, placeholdertext) {
    if (typeof (placeholdertext) == 'object') {     // may pass field object to get a default placeholder
        placeholdertext = 'Enter ' + placeholdertext.DisplayName.toLowerCase();
    }

    $input.attr('placeholder', placeholdertext);
    if (Browser.IsMSIE()) {
        if ($input.val() == null || $input.val().length == 0) {
            $input.val(placeholdertext);
            $input.addClass('ie-placeholder');
        }

        $input.focus(function () {
            var $this = $(this);
            if ($this.val() == $this.attr('placeholder')) {
                $this.val('');
                $this.removeClass('ie-placeholder');
            }
        });
        $input.blur(function () {
            var $this = $(this);
            if ($this.val() == null || $this.val().length == 0) {
                $this.val($this.attr('placeholder'));
                $this.addClass('ie-placeholder');
            }
        });
    }
}

// ---------------------------------------------------------
// Control.Checkbox static object
//
Control.Checkbox = {};
Control.Checkbox.render = function Control$Checkbox$render($element, item, field) {
    if ($element.attr('type') == 'checkbox') { $checkbox = $element; }
    else { $checkbox = $('<input type="checkbox" class="checkbox" />').appendTo($element); }
    $checkbox.addClass(field.Class);
    Control.tooltip($checkbox, field.DisplayName);
    if (item.GetFieldValue(field) == true) {
        $checkbox.attr('checked', 'checked');
    }
    $checkbox.data('item', item);
    $checkbox.data('field', field);
    $checkbox.change(function () { Control.Checkbox.update($(this)); });

    // disable if completed or skipped in running activity
    var parent = item.GetParentContainer();
    if (item.IsStep() && parent.IsActivity() && parent.IsRunning() && (item.IsComplete() || item.IsSkipped())) {
        $checkbox.attr('disabled', 'disabled');
    }
    return $checkbox;
}

Control.Checkbox.update = function Control$Checkbox$update($checkbox) {
    $checkbox.tooltip('hide');
    var item = $checkbox.data('item');
    var field = $checkbox.data('field');
    var value = ($checkbox.attr('checked') == 'checked');
    var currentValue = item.GetFieldValue(field);
    if (value != currentValue) {
        // when Complete field is set true, timestamp CompletedOn field
        if (value == true && field.Name == FieldNames.Complete && item.HasField(FieldNames.CompletedOn)) {
            item.Complete();
        } else {
            var copy = item.Copy();
            copy.SetFieldValue(field, value);
            item.Update(copy);
        }
    }
}

// ---------------------------------------------------------
// Control.LinkArray static object
//
Control.LinkArray = {};
Control.LinkArray.render = function Control$LinkArray$render($element, item, field) {
    var $wrapper = $('<div class="link-array" />').appendTo($element);
    $text = $('<input type="text" />').appendTo($wrapper);
    $text = Control.Text.base($text, item, field);
    $text.val('');
    Control.Text.placeholder($text, 'Add a link');
    $text.change(function (e) { Control.LinkArray.update($(e.srcElement)); });
    $text.keypress(function (e) { if (e.which == 13) { Control.LinkArray.update($(e.srcElement)); return false; } });

    var linkArray = new LinkArray(item.GetFieldValue(field));
    var links = linkArray.Links();
    if (links.length > 0) {                 // display existing links with delete
        for (var i in links) {
            Control.LinkArray.deleteBtn(i).appendTo($wrapper);
            var link = links[i];
            var $link = $('<a/>').appendTo($wrapper);
            var name = (link.Name == null) ? link.Url : link.Name;
            $link.html(name);
            $link.attr('href', link.Url);
            $link.attr('target', 'new');
        }
    }
    return $text;
}

Control.LinkArray.update = function Control$LinkArray$update($input) {
    var item = $input.data('item');
    var field = $input.data('field');
    var linkArray = new LinkArray(item.GetFieldValue(field));
    var value = $input.val();
    if (value != null && value.length > 0) {
        linkArray.Add(value);
        var updatedItem = item.Copy();
        updatedItem.SetFieldValue(field, linkArray.ToJson());
        item.Update(updatedItem);
    }
}

// return an element that is an icon for deleting an link in the array
Control.LinkArray.deleteBtn = function Control$Icons$deleteBtn(index) {
    var $icon = $('<i class="icon-remove-circle"></i>');
    $icon.css('cursor', 'pointer');
    Control.tooltip($icon, 'Remove Link');
    $icon.data('index', index);
    $icon.click(function () {
        var $this = $(this);
        $this.tooltip('hide');
        var $input = $this.parents('.link-array').first().find('input');
        var item = $input.data('item');
        var field = $input.data('field');
        var linkArray = new LinkArray(item.GetFieldValue(field));
        linkArray.Remove($this.data('index'));
        var updatedItem = item.Copy();
        updatedItem.SetFieldValue(field, linkArray.ToJson());
        item.Update(updatedItem);
        return false;   // do not propogate event
    });
    // wrap in anchor tag to get tooltips to work in Chrome
    return $('<a class="icon" />').append($icon);
}

// ---------------------------------------------------------
// Control.DateTime static object
//
Control.DateTime = {};
Control.DateTime.renderDatePicker = function Control$DateTime$renderDatePicker($element, item, field) {
    if ($element.attr('type') == 'text') { $date = $element; }
    else { $date = $('<input type="text" />').appendTo($element); }
    $date.addClass(field.Class);
    $date.data('item', item);
    $date.data('field', field);
    $date.val(Date.formatSafe(item.GetFieldValue(field), 'shortDate'));
    var year = Date.now().getFullYear();
    var yearRange = (year - 1).toString() + ':' + (year + 10).toString();
    $date.datepicker({
        defaultDate: +1,
        showOtherMonths: true,
        changeMonth: true,
        changeYear: true,
        yearRange: yearRange,
        onClose: function (value, picker) { Control.DateTime.update(picker.input); }
    });
    return $date;
}

Control.DateTime.renderDatePickerIcon = function Control$DateTime$renderDatePicker($element, item, field) {
    var $date = $('<input type="hidden" />').appendTo($element);
    $date.addClass(field.Class);
    $date.data('item', item);
    $date.data('field', field);
    $date.val(Date.formatSafe(item.GetFieldValue(field), 'shortDate'));
    var year = Date.now().getFullYear();
    var yearRange = (year - 1).toString() + ':' + (year + 10).toString();
    $date.datepicker({
        defaultDate: +1,
        showOn: 'button',
        buttonText: '<i class="icon-calendar"></i>',
        showOtherMonths: true,
        changeMonth: true,
        changeYear: true,
        yearRange: yearRange,
        onClose: function (value, picker) { Control.DateTime.update(picker.input); }
    });
    var $button = $element.find('button.ui-datepicker-trigger').addClass('btn');
    Control.tooltip($button, 'Set Date');
    return $button;
}

Control.DateTime.renderDateTimePicker = function Control$DateTime$renderDateTimePicker($element, item, field) {
    $date = $('<input type="text" />').appendTo($element);
    $date.addClass(field.Class);
    $date.data('item', item);
    $date.data('field', field);
    $date.val(Date.formatSafe(item.GetFieldValue(field), 'shortDateTime'));
    $date.datetimepicker({
        ampm: true,
        timeFormat: 'h:mm TT',
        hourGrid: 4,
        minuteGrid: 15,
        stepMinute: 15,
        numberOfMonths: 2,
        onClose: function (value, picker) { Control.DateTime.update(picker.input); }
    });
    return $date;
}

Control.DateTime.renderRange = function Control$DateTime$renderRange($element, item, fieldStart, fieldEnd, tag) {
    var tag = (tag == null) ? 'span' : tag;
    var $tag, value;
    var startDate = item.GetFieldValue(fieldStart);
    var endDate = item.GetFieldValue(fieldEnd);
    if (startDate != null && endDate != null) {
        if (fieldStart.FieldType == FieldTypes.DateTime && fieldEnd.FieldType == FieldTypes.DateTime) {
            if (startDate.toDateString() == endDate.toDateString()) {
                // display range as same day
                var endParts = endDate.format().split(' ');
                var endHour = endParts[endParts.length - 2] + ' ' + endParts[endParts.length - 1];
                value = 'On ' + startDate.format() + ' to ' + endHour;
            } else {
                // display range as multiple days
                value = 'From ' + startDate.format() + ' until ' + endDate.format();
            }
        } else {
            value = 'From ' + startValue + ' until ' + endValue;
        }
    }
    if (value != null) {
        $tag = $('<' + tag + '/>').appendTo($element);
        $tag.addClass(fieldStart.Class);
        $tag.html(value);
    }
    return $tag;
}

Control.DateTime.closeHandler = null;     // set closeHandler to get called when any datepicker is closed
Control.DateTime.update = function Control$DateTime$update($input) {
    // suppress refresh to prevent jquery-ui bug using multiple datetimepickers
    Control.Text.update($input, null);
    if (Control.DateTime.closeHandler != null) { Control.DateTime.closeHandler(); }
}

// ---------------------------------------------------------
// Control.ContactList static object
//
Control.ContactList = {};
Control.ContactList.renderInput = function Control$ContactList$renderInput($element, item, field, handler) {
    $input = $('<input type="text" />').appendTo($element);
    $input.addClass(field.Class);
    $input.data('item', item);
    $input.data('field', field);
    Control.Text.placeholder($input, 'Enter a contact');

    handler = (handler == null) ? Control.ContactList.update : handler;
    $input.keypress(function (e) { if (e.which == 13) { handler($(e.srcElement)); return false; } });
    var value = item.GetFieldValue(field);
    var text = '';
    if (value != null && value.IsList) {
        var contacts = value.GetItems();
        for (var id in contacts) {
            var contactRef = contacts[id].GetFieldValue(FieldNames.EntityRef);
            if (contactRef != null) {
                text += contactRef.Name;
                //text += '; ';                 // TODO: support multiple contacts
            }
            break;
        }
    }
    $input.val(text);

    Control.Text.autoCompleteContact($input, handler);

    return $input;
}

// if passed, handler is called with the new contact item that is inserted into the DataModel
Control.ContactList.update = function Control$ContactList$update($input, handler) {
    var item = $input.data('item');
    var field = $input.data('field');
    var contactName = $input.val();
    if (contactName == null || contactName.length == 0) {
        item.RemoveReferences(field);
        return;
    }

    var contact;
    var jsonContact = $input.data(FieldNames.Contacts);
    if (jsonContact != null) {
        contact = $.parseJSON(jsonContact);
    }

    var parent = item.GetParent();

    if (contact != null && contact.ItemTypeID == ItemTypes.Reference) {
        // add reference to existing contact
        var contactRef = { Name: contact.Name, ID: contact.FieldValues[0].Value };
        item.AddReference(field, contactRef, true);
        if (parent != null && parent.IsActivity) {
            // if parent is an activity, add a reference in its location list as well 
            // (but do not replace any references - hence flag = false below
            parent.AddReference(field, contactRef, false);
        }
        if (handler) { handler(contact); }
    } else {
        if (contact != null) {
            contact = Item.Extend(contact);
            var fbID = contact.GetFieldValue(FieldNames.FacebookID);
            var existingContact = DataModel.FindContact(contact.Name, fbID);
            if (existingContact != null) {
                // add reference to existing contact
                item.AddReference(field, contact, true);
                if (parent != null && parent.IsActivity) {
                    // if parent is an activity, add a reference in its location list as well 
                    // (but do not replace any references - hence flag = false below
                    parent.AddReference(field, existingContact, false);
                }
                if (handler) { handler(existingContact); }
                return;
            }
        } else {
            contact = Item.Extend({ Name: contactName, ItemTypeID: ItemTypes.Contact });
        }
        // create new contact and add reference
        var contactList = DataModel.UserSettings.GetDefaultList(ItemTypes.Contact);
        DataModel.InsertItem(contact, contactList, null, null, null,
            function (insertedContact) {
                item.AddReference(field, insertedContact, true);
                if (parent != null && parent.IsActivity) {
                    // if parent is an activity, add a reference in its location list as well 
                    // (but do not replace any references - hence flag = false below
                    parent.AddReference(field, insertedContact, false);
                }
                if (handler) { handler(insertedContact); }
            });
    }
}

// ---------------------------------------------------------
// Control.LocationList static object
//
Control.LocationList = {};
Control.LocationList.renderInput = function Control$LocationList$renderInput($element, item, field, handler) {
    $input = $('<input type="text" />').appendTo($element);
    $input.addClass(field.Class);
    $input.data('item', item);
    $input.data('field', field);
    handler = (handler == null) ? Control.LocationList.update : handler;

    $input.keypress(function (e) { if (e.which == 13) { handler($(e.srcElement)); return false; } });
    var value = item.GetFieldValue(field);
    var text = '';
    if (value != null && value.IsList) {
        var locations = value.GetItems();
        for (var id in locations) {
            var locationRef = locations[id].GetFieldValue(FieldNames.EntityRef);
            if (locationRef != null) {
                /*
                var address = locationRef.GetFieldValue(FieldNames.Address);
                text += address;
                if (locationRef.Name != address) {
                text += ' ( ' + locationRef.Name + ' )';
                }
                */
                text = locationRef.Name;
            }
            break;
        }
    }
    $input.val(text);

    //Control.Text.autoCompleteAddress($input, Control.LocationList.update);
    Control.Text.autoCompletePlace($input, handler);

    return $input;
}

// if passed, handler is called with the new location item that is inserted into the DataModel
Control.LocationList.update = function Control$LocationList$update($input, handler) {
    var item = $input.data('item');
    var field = $input.data('field');
    var address = $input.val();
    if (address == null || address.length == 0) {
        item.RemoveReferences(field);
        return;
    }

    var parent = item.GetParent();
    var latlong = $input.data(FieldNames.LatLong);
    var place = $input.data('place');
    if (place != null && place.geometry != null) {
        latlong = place.geometry.location.toUrlValue();
    }
    var existingLocation = DataModel.FindLocation(address, latlong);
    if (existingLocation != null) {
        // add reference to existing location
        item.AddReference(field, existingLocation, true);
        if (parent != null && parent.IsActivity) {
            // if parent is an activity, add a reference in its location list as well 
            // (but do not replace any references - hence flag = false below
            parent.AddReference(field, existingLocation, false);
        }
        if (handler) { handler(existingLocation); }
    } else {
        // create new location and add reference
        var locationList = DataModel.UserSettings.GetDefaultList(ItemTypes.Location);
        var newLocation = Item.Extend({ Name: address, ItemTypeID: ItemTypes.Location });
        if (place != null && place.geometry != null) {
            Control.Text.applyPlace(newLocation, place);
        } else {
            newLocation.SetFieldValue(FieldNames.Address, address);
            if (latlong != null) {
                newLocation.SetFieldValue(FieldNames.LatLong, latlong);
            }
        }
        DataModel.InsertItem(newLocation, locationList, null, null, null,
            function (insertedLocation) {
                item.AddReference(field, insertedLocation, true);
                if (parent != null && parent.IsActivity) {
                    // if parent is an activity, add a reference in its location list as well 
                    // (but do not replace any references - hence flag = false below
                    parent.AddReference(field, insertedLocation, false);
                }
                if (handler) { handler(insertedLocation); }
            });
    }
}

// ---------------------------------------------------------
// Control.List static object
// static re-usable helper to support List elements <ul>
//
Control.List = {};

// make a list of items sortable, apply to <ul> element
// each <li> in list must have attached data('item')
Control.List.sortable = function Control$List$sortable($element) {
    $element.sortable({
        //revert: true,
        axis: 'y',
        handle: '.drag-handle',
        stop: function (e, ui) {
            $('i').tooltip('hide');
            var $item = ui.item;
            var item = $item.data('item');
            if (item != null) {
                var liElements = $item.parent('ul').children('li');
                for (var i in liElements) {
                    var currentItem = $(liElements[i]).data('item');
                    if (currentItem != null && item.ID == currentItem.ID) {
                        var $liBefore = $(liElements[i]).prevAll('li').first();
                        var itemBefore = ($liBefore.length == 0) ? null : $liBefore.data('item');
                        var before = Number((itemBefore == null) ? 0 : itemBefore.SortOrder);
                        var $liAfter = $(liElements[i]).nextAll('li').first();
                        var itemAfter = ($liAfter.length == 0) ? null : $liAfter.data('item');
                        var after = Number((itemAfter == null) ? before + 1000 : itemAfter.SortOrder);
                        var updatedItem = item.Copy();
                        updatedItem.SortOrder = before + ((after - before) / 2);
                        item.Update(updatedItem);
                        break;
                    }
                }
            }
        }
    });
}
