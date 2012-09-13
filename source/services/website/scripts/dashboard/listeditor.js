//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// ListEditor.js

// ---------------------------------------------------------
// ListEditor control
function ListEditor(parentControl) {
    this.parentControl = parentControl;
    this.$element = null;
    this.$activity = null;

    this.newItemEditor = new NewItemEditor(this);
    this.listView = new ListView(this);
}

ListEditor.prototype.render = function ($element, list, maxHeight) {
    if (this.$element == null) { this.$element = $element; }
    var $activity = null, $newItem = null;
    var activityHeight = 0, newItemHeight = 0;

    // render activity
    $activity = this.renderActivity(this.$element, list);
    activityHeight = ($activity != null) ? $activity.outerHeight() : 0;

    // render new item input
    $newItem = this.newItemEditor.render(this.$element, list);
    newItemHeight = ($newItem != null) ? $newItem.outerHeight() : 0;

    // render child items
    this.listView.render(this.$element, list, maxHeight - activityHeight - newItemHeight - 28);   // exclude top & bottom padding
    if ($newItem != null) { $newItem.find('.fn-name').focus(); }
}

ListEditor.prototype.renderActivity = function ($element, activity) {
    if (this.$activity == null) {
        this.$activity = $('<ul class="nav nav-list" />').prependTo($element);
    }
    this.$activity.empty();
    if (!activity.IsActivity()) { return this.$activity; }
    var steps = activity.GetItems(true);
    var hasSteps = ItemMap.count(steps) > 0;

    if (hasSteps || activity.IsRunning()) {
        var $li = $('<li />').appendTo(this.$activity);
        var $form = $('<div class="form-inline icon"/>').appendTo($li);

        if (hasSteps) {
            // activity with steps, display repeat
            $li.attr('style', 'margin-bottom: 12px; border-top-color: transparent;');
            var field = activity.GetField(FieldNames.Repeat);
            Control.Repeat.render($form, activity, field);
        } else if (activity.IsRunning()) {
            // running activity without steps, display properties
            $li.addClass(activity.StatusClass());
            var field = activity.GetField(FieldNames.Complete);
            Control.Checkbox.render($form, activity, field);

            if (activity.IsComplete()) {
                field = activity.GetField(FieldNames.CompletedOn);
                Control.Text.render($form, activity, field, 'small', 'Completed on ');
            } else {
                field = activity.GetField(FieldNames.DueDate);
                Control.Text.render($form, activity, field, 'small', 'Due on ');
            }
        }
    }
    return this.$activity;
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
        // render input for new item if not a running activity
        if (!list.IsRunning()) {
            this.list = list;
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
    var totalCount = ItemMap.count(listItems);
    var itemCount = 0;
    for (var id in listItems) {
        var item = listItems[id];
        var $li = $('<li class="position-relative" />').appendTo(this.$element);
        //$li.data('control', this);
        //$li.data('item', item);

        var $item;
        if (list.IsRunning()) {
            var $wrapper = $('<div class="inline" />').appendTo($li);
            $wrapper.css('width', '100%');

            if (item.IsActive()) { $li.addClass('selected'); }
            $li.addClass(item.StatusClass());
            $item = $('<div class="form-inline pull-left" />').appendTo($wrapper);
            this.renderNameField($item, item);

            if (item.IsActive()) {      // display actions for active step
                Control.Actions.render($wrapper, item);
            } else {                    // display action type icon
                $icon = $('<a class="icon absolute-right" style="cursor: default;" />').appendTo($li);
                Control.Icons.forActionType(item.GetActionType()).appendTo($icon);
            }
        } else {
            if (item.IsSelected()) { $li.addClass('selected'); }
            $li.addClass(item.StatusClass());

            $item = $('<a class="form-inline drag-handle" />').appendTo($li);
            $item.data('control', this);
            $item.data('item', item);

            var $editBtns = $('<div class="absolute-right" />').appendTo($li);
            Control.Icons.deleteBtn(item).appendTo($editBtns).addClass('pull-right');
            var $actions = Control.ActionType.renderDropdown($editBtns, item, true).addClass('pull-right');
            // adjust location of dropdown menu to avoid clipping
            if (itemCount > 1 || (totalCount == 2 && itemCount == 1)) { 
                $actions.find('.dropdown').addClass('dropup'); }
            else {
                $actions.find('.dropdown').addClass('dropcenter'); 
            }

            this.renderNameField($item, item);

            // click item to select
            //$li.bind('click', function (e) {
            $item.bind('click', function (e) {
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
    if (!item.IsStep()) {
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
        $item.append(Control.Icons.forSources(item));
    } else {
        $item.append(Control.Icons.forStatusType(item));
    }
    // render name field
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
            else if (!(item.IsComplete() || item.IsSkipped())) {
                $field = Control.Text.render($element, item, field, 'small', 'Due on ');
            }
            break;
        case FieldNames.CompletedOn:
            if (item.IsComplete()) {
                $field = Control.Text.render($element, item, field, 'small', 'Completed on ');
            } else if (item.IsSkipped()) {
                $field = Control.Text.render($element, item, field, 'small', 'Skipped on ');
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
