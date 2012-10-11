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

    // render new item input (render before listView to get height)
    $newItem = this.newItemEditor.render(this.$element, list);
    newItemHeight = ($newItem != null) ? $newItem.outerHeight() : 0;

    // render child items (list scrolls based on remaining height)
    this.listView.render(this.$element, list, maxHeight - activityHeight - newItemHeight - 28);   // exclude top & bottom padding 

    // move new item input after listView
    $newItem.appendTo(this.$element);
    //if ($newItem != null) { $newItem.find('.fn-name').focus(); }
}

ListEditor.prototype.renderActivity = function ($element, activity) {
    if (this.$activity == null) {
        this.$activity = $('<ul class="nav nav-list" />').prependTo($element);
    }
    this.$activity.empty();
    if (!activity.IsActivity()) { return this.$activity; }

    var steps = activity.GetItems(true);
    var hasSteps = ItemMap.count(steps) > 0;
    var $li = $('<li />').appendTo(this.$activity);
    var $form = $('<div class="form-inline"/>').appendTo($li);
    if (hasSteps) {
        $('<label class="control-label large">Steps</label>').css('margin-bottom', '0').appendTo(this.$activity);
    }
    // activity with steps, display repeat
    $li.attr('style', 'margin-bottom: 12px; border-top-color: transparent;');
    //this.renderActivityController($form, activity);
    var field = activity.GetField(FieldNames.Repeat);
    Control.Repeat.render($form, activity, field);
    /*
    if (activity.IsComplete()) {
    field = activity.GetField(FieldNames.CompletedOn);
    Control.Text.render($form, activity, field, 'small', 'Completed on ');
    } else {
    field = activity.GetField(FieldNames.DueDate);
    Control.Text.render($form, activity, field, 'small', 'Due on ');
    }
    */
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
        // render input for new item 
        this.list = list;
        this.newItem = Item.Extend({ Name: '', ItemTypeID: (list.IsActivity() ? ItemTypes.Step : list.ItemTypeID) });
        var $field = this.renderNameField(this.$element);
        $field.val('');
    }
    return this.$element;
}

NewItemEditor.prototype.renderNameField = function ($element) {
    // render name field
    var fields = this.newItem.GetFields();
    var nameField = fields[FieldNames.Name];
    var $form = $('<form class="new-item form-vertical well"/>').appendTo($element);
    if (this.newItem.IsStep()) {
        $('<label class="control-label large">Add Step</label>').appendTo($form);
    }
    var $nameField = Control.Text.renderInputNew($form, this.newItem, nameField, this.list);

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
        $li.data('control', this);
        $li.data('item', item);
        if (item.IsSelected()) { $li.addClass('selected'); }
        if (item.IsStep()) { $li.addClass(item.StatusClass()); }

        var $wrapper = $('<div class="inline drag-handle" />').appendTo($li).css('width', '100%');

        if (item.IsActive()) {
            var $item = $('<div class="btn-toolbar pull-left" />').appendTo($wrapper);
            Control.Actions.actionButton(item).appendTo($item).addClass('btn-primary');
        }
        var $item = $('<div class="form-inline pull-left" />').appendTo($wrapper);
        this.renderNameField($item, item);
        this.renderFields($item, item);

        if (!item.IsCompleted()) {
            Control.Actions.render($wrapper, item, this);
        }
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
            $item.append(Control.Icons.forMapLink(item));
        }
        $item.append(Control.Icons.forSources(item));
    } else if (!item.IsActive()) {
        if (!item.IsStopped()) {
            $item.append(Control.Icons.forStatusType(item));
        } else {
            $item.append(Control.Icons.forActionType(item.GetActionType()));
        }
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
                $field = Control.Text.render($element, item, field, 'small', 'Complete by ');
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
