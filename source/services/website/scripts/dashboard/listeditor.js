//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// ListEditor.js

// ---------------------------------------------------------
// ListEditor control
function ListEditor(parentControl) {
    this.parentControl = parentControl;
    this.$element = null;

    this.newItemEditor = new NewItemEditor(this);
    this.listView = new ListView(this);
}

ListEditor.prototype.render = function ($element, list, maxHeight) {
    if (this.$element == null) { this.$element = $element; }
    var $newItem = this.newItemEditor.render(this.$element, list);
    var newItemHeight = ($newItem != null) ? $newItem.outerHeight() : 0;
    this.listView.render(this.$element, list, maxHeight - newItemHeight - 28);   // exclude top & bottom padding
    $newItem.find('.fn-name').focus();
}

ListEditor.prototype.selectItem = function (item) {
    this.parentControl.fireSelectionChanged(item);
}

// ---------------------------------------------------------
// NewItemEditor control
function NewItemEditor(parentControl) {
    this.parentControl = parentControl;
    this.$element = null;
    this.list;
    this.newItem;
}

NewItemEditor.prototype.render = function ($element, list) {
    if (list != null && (list.IsFolder() || list.IsList)) {
        if (this.$element == null) {
            this.$element = $('<div class="row-fluid" />').appendTo($element);
        }
        this.$element.empty();
        this.list = list;

        if (list.IsActivity() && !list.IsPaused()) {
            // activity is running
            var steps = list.GetItems();
            if (ItemMap.count(steps) == 0) {
                // activity without steps, just display properties
                var $form = $('<a class="form-inline icon"/>').appendTo(this.$element);
                var field = list.GetField(FieldNames.Complete);
                Control.Checkbox.render($form, list, field);

                if (list.IsComplete()) {
                    field = list.GetField(FieldNames.CompletedOn);
                    Control.Text.render($form, list, field, 'small', 'Completed on ');
                } else {
                    field = list.GetField(FieldNames.DueDate);
                    Control.Text.render($form, list, field, 'small', 'Due on ');
                }
            }
        } else {
            // render name field for new item 
            this.newItem = Item.Extend({ Name: '', ItemTypeID: (list.IsActivity() ? ItemTypes.Step : list.ItemTypeID) });
            var $field = this.renderNameField(this.$element);
            $field.val('');
        }
    }
    return this.$element;
}

NewItemEditor.prototype.renderNameField = function ($element) {
    // render name field
    var fields = this.newItem.GetFields();
    var nameField = fields[FieldNames.Name];
    var $form = $('<form class="form-inline"/>').appendTo($element);

    var $nameField = Control.Text.renderInputNew($form, this.newItem, nameField, this.list);

    // TODO: figure out how to append button but keep on one line 100% wide
    //var $append = $('<div class="input-append" />').appendTo($form);
    //var $addButton = $('<span class="add-on"><i class="icon-plus-sign"></i></span>').appendTo($append);

    $nameField.addClass('input-block-level');
    return $nameField;
}

// ---------------------------------------------------------
// ListView control
function ListView(parentControl) {
    this.parentControl = parentControl;
    this.$element = null;
    this.list = null;
}

ListView.prototype.hide = function () {
    if (this.$element != null) {
        this.$element.hide();
    }
}

ListView.prototype.show = function () {
    if (this.$element != null) {
        this.$element.show();
    }
}

ListView.prototype.render = function ($element, list, height) {
    if (list == null) { return; }
    if (this.$element == null) {
        this.$element = $('<ul class="nav nav-list" />').appendTo($element);
        Control.List.sortable(this.$element);
    }

    this.hide();
    this.$element.empty();
    if (height != null) { this.$element.css('max-height', height); }
    if (this.renderListItems(list) > 0) {
        this.show();
        var $selected = this.$element.find('li.selected');
        if ($selected.length == 1) {
            // scroll selected item into view
            var scroll = $selected.offset().top - height + this.$element.scrollTop();
            if (scroll > 0) {
                this.$element.animate({ scrollTop: scroll }, 500);
            }
        }
    }
}

ListView.prototype.renderListItems = function (list) {
    var listItems = list.GetItems(true);
    var runMode = list.IsActivity() && list.IsActive();
    var itemCount = 0;
    for (var id in listItems) {
        var item = listItems[id];
        var $li = $('<li class="position-relative" />').appendTo(this.$element);
        $li.data('control', this);
        $li.data('item', item);

        var $item;
        if (runMode) {
            if (item.IsActive()) { $li.addClass('selected'); }
            if (!item.IsNullStatus()) { $li.addClass(item.Status.toLowerCase()); }
            $item = $('<a class="form-inline" />').appendTo($li);
            this.renderNameField($item, item);
        } else {
            if (item.IsSelected()) { $li.addClass('selected'); }
            if (item.IsPaused()) { $li.addClass('paused'); }

            $item = $('<a class="form-inline drag-handle" />').appendTo($li);
            var $deleteBtn = Control.Icons.deleteBtn(item).appendTo($li);
            $deleteBtn.addClass('absolute-right');
            this.renderNameField($item, item);

            // click item to select
            $li.bind('click', function (e) {
                if ($(this).hasClass('ui-sortable-helper') ||
                $(e.srcElement).hasClass('dt-checkbox') ||
                $(e.srcElement).hasClass('dt-email')) {
                    return;
                }
                var item = $(this).data('item');
                Control.get(this).parentControl.selectItem(item);
            });
        }
        this.renderFields($item, item);
        itemCount++;
    }
    return itemCount;
}

ListView.prototype.renderNameField = function ($item, item) {
    var fields = item.GetFields();
    // render complete field if exists 
    var field = fields[FieldNames.Complete];
    if (field != null) {
        Control.Checkbox.render($item, item, field);
    }
    // render map icon if weblinks exists 
    var field = fields[FieldNames.WebLinks];
    if (field != null) {
        $item.append(Control.Icons.forMap(item));
    }
    // render name field
    $item.append(Control.Icons.forSources(item));
    field = fields[FieldNames.Name];
    Control.Text.renderLabel($item, item, field);
}

ListView.prototype.renderFields = function ($element, item) {
    var $fields = $('<div />').appendTo($element);
    var fields = item.GetFields();
    for (var name in fields) {
        var field = fields[name];
        this.renderField($fields, item, field);
    }
    $('<small>&nbsp;</small>').appendTo($fields); 
}

ListView.prototype.renderField = function ($element, item, field) {
    var $field;
    switch (field.Name) {
        case FieldNames.DueDate:
            if (item.HasField(FieldNames.EndDate)) {
                var endField = item.GetField(FieldNames.EndDate);
                $field = Control.DateTime.renderRange($element, item, field, endField, 'small');
            }
            else if (item.HasField(FieldNames.Complete) && item.GetFieldValue(FieldNames.Complete) != true) {
                $field = Control.Text.render($element, item, field, 'small', 'Due on ');
            }
            break;
        case FieldNames.CompletedOn:
            if (item.GetFieldValue(FieldNames.Complete) == true) {
                $field = Control.Text.render($element, item, field, 'small', 'Completed on ');
            }
            break;
        case FieldNames.Category:
            $field = Control.Text.render($element, item, field, 'small');
            break;
        case FieldNames.Email:
            $field = Control.Text.renderEmail($element, item, field);
            break;
        case FieldNames.Address:
            var address = item.GetFieldValue(FieldNames.Address);
            if (address != item.Name) {
                $field = Control.Text.render($element, item, field, 'small');
            }
            break;
        default:
            break;
    }
    return $field;
}
