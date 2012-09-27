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
    if (hasSteps || activity.IsRunning()) {
        var $li = $('<li />').appendTo(this.$activity);
        var $form = $('<div class="form-inline"/>').appendTo($li);
        $('<label class="control-label">Steps</label>').css('margin-bottom','0').appendTo(this.$activity);

        if (hasSteps) {
            // activity with steps, display repeat
            $li.attr('style', 'margin-bottom: 12px; border-top-color: transparent;');
            this.renderActivityController($form, activity);
            var field = activity.GetField(FieldNames.Repeat);
            Control.Repeat.render($form, activity, field);
        } else if (activity.IsRunning()) {
            // TODO: remove support for Activity without steps?
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

ListEditor.prototype.renderActivityController = function ($element, activity) {
    $element = $('<div class="inline vcr-controls"></div>').appendTo($element);

    // render disabled restart button
    var $btnRestart = $('<a class="btn btn-primary icon disabled"><i class="icon-backward"></i></a>').prependTo($element);
    
    if (activity.IsRunning()) {     
        // render enabled pause button
        var $btnPause = $('<a class="btn btn-warning icon"><i class="icon-pause"></i></a>').appendTo($element);
        $btnPause.attr('title', 'Pause').tooltip(Control.noDelay);
        $btnPause.click(function () {
            $(this).tooltip('hide');
            activity.Pause();
        });
    } else {                        
        // render disabled start button
        var $btnStart = $('<a class="btn btn-success icon disabled"><i class="icon-play"></i></a>').appendTo($element);
    }

    // render disabled forward button
    var $btnForward = $('<a class="btn btn-primary icon disabled"><i class="icon-forward"></i></a>').appendTo($element);
    
    if (activity.IsRunning()) {
        // enable forward button if activity complete and recurrence enabled
        if (activity.IsComplete()) {
            var rrule = Recurrence.Extend(activity.GetFieldValue(FieldNames.Repeat));
            if (rrule.IsEnabled()) {
                $btnForward.removeClass('disabled');
                $btnForward.attr('title', 'Repeat').tooltip(Control.noDelay);
                $btnForward.click(function () {
                    $(this).tooltip('hide');
                    activity.Repeat();
                });
            }
        }
    } else {       
        var status = activity.CanResume();
        if (status.Start || status.Resume) {
            // enable start or resume button
            var title = (status.Start) ? 'Start' : 'Resume';
            $btnStart.attr('title', title).tooltip(Control.noDelay);
            $btnStart.click(function () {
                $(this).tooltip('hide');
                var itemNeedsDueDate = activity.Start();
                if (itemNeedsDueDate != null) {
                    // item needs a due date
                    popupDueDate(itemNeedsDueDate, activity);
                }
            });
            $btnStart.removeClass('disabled');
        }
    
        if (status.Restart) {
            // enable restart button
            $btnRestart.removeClass('disabled');
            $btnRestart.attr('title', 'Restart').tooltip(Control.noDelay);
            $btnRestart.click(function () {
                $(this).tooltip('hide');
                var itemNeedsDueDate = activity.Restart();
                if (itemNeedsDueDate != null) {
                    popupDueDate(itemNeedsDueDate, activity);       // item needs a due date
                }
            });

            if (status.Resume && activity.IsStopped()) { activity.UpdateStatus(StatusTypes.Paused); }
            if (!status.Resume && activity.IsPaused()) { activity.UpdateStatus(StatusTypes.Stopped); }
        }
    }

    // helper function for displaying popup dialog to input due date
    var popupDueDate = function (item, activity) {
        var header = 'Select date';
        header += (item.IsActivity()) ? ' for activity' : ' for first step';
        var field = item.GetField(FieldNames.DueDate);
        var $dialog = $('<div class="control-group"><label class="control-label">Due Date</label></div>');
        Control.DateTime.renderDatePicker($dialog, item, field);
        Control.popup($dialog, header, function (inputs) {
            if (inputs.length == 1 && inputs[0].length > 0) {
                var itemNeedsDueDate = activity.Start(inputs[0]);
                if (itemNeedsDueDate != null) {
                    // unable to set valid due date on activity or next step
                    Control.alert('Activity is not running.', 'Could not set valid due date on activity or next step. Try setting due date first.');
                }
            }
        });
    }
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
    var $form = $('<form class="new-item form-vertical well"/>').appendTo($element);
    if (this.newItem.IsStep()) {
        $('<label class="control-label">Add next step</label>').appendTo($form);
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
            }
        } else {
            if (item.IsCompleted()) { itemCount++; continue; }
            if (item.IsSelected()) { $li.addClass('selected'); }
            if (item.IsStep()) { $li.addClass(item.StatusClass()); }

            $li.data('control', this);
            $li.data('item', item);

            $item = $('<a class="form-inline drag-handle" />').appendTo($li);
            $item.data('control', this);
            $item.data('item', item);

            var $editBtns = $('<div class="absolute-right" />').appendTo($li);
            Control.Icons.deleteBtn(item).appendTo($editBtns).addClass('pull-right');
            this.editBtn(item).appendTo($editBtns).addClass('pull-right');

            // TODO: may enable inline edit of action, save this code
            //var $actions = Control.ActionType.renderDropdown($editBtns, item, true).addClass('pull-right');
            // adjust location of dropdown menu to avoid clipping
            //if (itemCount > 1 || (totalCount == 2 && itemCount == 1)) {
            //    $actions.find('.dropdown').addClass('dropup');
            //}
            //else {
            //    $actions.find('.dropdown').addClass('dropcenter');
            //}

            this.renderNameField($item, item);

            /* TODO: using edit icon, remove this code
            // click item to select
            $item.bind('click', function (e) {
                if ($(this).hasClass('ui-sortable-helper') ||
                $(e.srcElement).hasClass('dt-checkbox') ||
                $(e.srcElement).hasClass('dt-email')) {
                return;
                }
                var item = $(this).data('item');
                Control.get(this).parentControl.selectItem(item);
            });
            */
        }
        this.renderFields($item, item);
        itemCount++;
    }
    return itemCount;
}

ListView.prototype.editBtn = function (item) {
    var $icon = $('<i class="icon-pencil"></i>');
    $icon.data('control', this);
    $icon.data('item', item);
    $icon.attr('title', 'Edit').tooltip(Control.noDelay);
    $icon.bind('click', function () {
        $(this).tooltip('hide');
        var item = $(this).data('item');
        Control.get(this).parentControl.selectItem(item);
        return false;   // do not propogate event
    });
    // wrap in anchor tag to get tooltips to work in Chrome
    return $('<a class="icon" />').append($icon);
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
        if (item.IsStopped()) {
            $item.append(Control.Icons.forActionType(item.GetActionType()));
        } else {
            $item.append(Control.Icons.forStatusType(item));
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
