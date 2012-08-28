﻿//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// ItemEditor.js

// ---------------------------------------------------------
// ItemViewer control
function ItemViewer(parentControl) {
    this.parentControl = parentControl;
    this.$element = null;
    this.expanded = true;
    this.item;
}

ItemViewer.prototype.hide = function () {
    this.$element.hide();
}

ItemViewer.prototype.show = function () {
    this.$element.show();
}

ItemViewer.prototype.render = function ($element, item) {
    if (item != null && !(item.IsFolder() || item.IsList)) {
        if (this.$element == null) {
            this.$element = $('<form class="row-fluid form-vertical carousel" />').appendTo($element);
            this.$element.data('control', this);
        }
        this.$element.empty();

        this.item = item;
        // render all fields of item
        this.renderFields(this.$element);

        // TODO: handle focus and default text selection properly
    }
}

ItemViewer.prototype.renderFields = function ($element) {
    this.renderNameField($element);
    var $fields = $('<div />').appendTo($element);
    var fields = this.item.GetFields();
    for (var name in fields) {
        var field = fields[name];
        if (field.IsPrimary || this.expanded) {
            this.renderField($fields, field);
        }
    }
}

ItemViewer.prototype.renderNameField = function ($element) {
    var inputClass = 'span12';
    var fields = this.item.GetFields();
    var field = fields[FieldNames.Complete];
    var $form = $('<form class="form-inline well"/>').appendTo($element);
    $controls = $('<div class="span10" />').appendTo($form);
    if (field != null) {
        var $checkbox = Control.Checkbox.render($controls, this.item, field);
        $checkbox.addClass('inline-left');
        inputClass = 'span11';
    }

    // render name field
    var $field;
    field = fields[FieldNames.Name];
    if (this.item.ItemTypeID == ItemTypes.Location) {
        $field = Control.Text.renderInputAddress($controls, this.item, field);
    } else if (this.item.ItemTypeID == ItemTypes.Grocery) {
        $field = Control.Text.renderInputGrocery($controls, this.item, field);
    } else {
        $field = Control.Text.renderInput($controls, this.item, field);
    }
    $field.addClass(inputClass);

    // render toolbar
    var $toolbar = $('<div class="btn-toolbar span12" />').prependTo($controls);
    Control.Icons.deleteBtn(this.item).appendTo($toolbar);
    //var $itemTypePicker = Control.ItemType.renderDropdown($toolbar, this.item, true);
    //$itemTypePicker.addClass('pull-right');
    //$itemTypePicker.find('.btn').addClass('btn-mini').css('border-style', 'none');

    // render the action type picker 
    var $actionTypePicker = Control.ActionType.renderDropdown($toolbar, this.item, true);
    if ($actionTypePicker != null) {
        $actionTypePicker.addClass('pull-right');
        $actionTypePicker.find('.btn').addClass('btn-mini').css('border-style', 'none');
    }

    // render thumbnail
    var $thumbnail = $('<div class="span2 thumbnail" />').appendTo($form);
    var imageUrl = this.item.GetFieldValue(FieldNames.Picture);
    if (imageUrl != null) {
        $image = $('<img />').appendTo($thumbnail);
        $image.attr('src', imageUrl);
    }

    return $field;
}

ItemViewer.prototype.renderField = function ($element, field) {
    // handled by renderNameField
    if (field.Name == FieldNames.Name || field.Name == FieldNames.Complete)
        return;

    var $field;
    var $wrapper = $('<div class="control-group"><label class="control-label">' + field.DisplayName + '</label></div>');
    switch (field.DisplayType) {
        case DisplayTypes.Hidden:
        case DisplayTypes.Priority:
        case DisplayTypes.Reference:
        case DisplayTypes.TagList:
            break;
        case DisplayTypes.ContactList:
            $field = Control.ContactList.renderInput($wrapper, this.item, field);
            break;
        case DisplayTypes.LocationList:
            $field = Control.LocationList.renderInput($wrapper, this.item, field);
            break;
        case DisplayTypes.Address:
            $field = Control.Text.renderInputAddress($wrapper, this.item, field);
            break;
        case DisplayTypes.LinkArray:
            $field = Control.LinkArray.render($wrapper, this.item, field);
            break;
        case DisplayTypes.DateTimePicker:
            $field = Control.DateTime.renderDateTimePicker($wrapper, this.item, field);
            break;
        case DisplayTypes.DatePicker:
            $field = Control.DateTime.renderDatePicker($wrapper, this.item, field);
            break;
        case DisplayTypes.TextArea:
            $field = Control.Text.renderTextArea($wrapper, this.item, field);
            break;
        case DisplayTypes.Checkbox:
            $field = Control.Checkbox.render($wrapper, this.item, field);
            break;
        case DisplayTypes.Text:
        default:
            $field = Control.Text.renderInput($wrapper, this.item, field);
            break;
    }
    if ($field != null) {
        $field.addClass('input-block-level');
        $wrapper.appendTo($element);
    }
    return $field;
}
