//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// StepList.js

// ---------------------------------------------------------
// StepList control
function StepList(parentControl) {
    this.parentControl = parentControl;
    this.$element = null;
    this.listView = new ListView(this);
}

StepList.prototype.render = function ($element, list, maxHeight) {
    if (this.$element == null) { this.$element = $element; }
    this.listView.render(this.$element, list, maxHeight);   
}

StepList.prototype.selectItem = function (item) {
    this.parentControl.fireSelectionChanged(item);
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
        //Control.List.sortable(this.$element);
    }

    this.hide();
    this.$element.empty();
    // temporary workaround (smillet 8/30/12)
    // Omri changes have caused tab-content to overflow dashboard-center height 
    // force max-height of tab-content in StepManager
    //if (height != null) { this.$element.css('max-height', height); }

    if (this.renderListItems(list.GetSteps()) > 0) {
        this.show();
        var $selected = this.$element.find('li.selected');
        if ($selected.offset() != null) {
            // scroll selected item into view
            var scroll = $selected.offset().top - height + this.$element.scrollTop();
            if (scroll > 0) {
                this.$element.animate({ scrollTop: scroll }, 500);
            }
        }
    }
}

ListView.prototype.renderListItems = function (listItems) {
    var itemCount = 0;
    for (var id in listItems) {
        var item = listItems[id];
        var $li = $('<li />').appendTo(this.$element);
        $li.data('control', this);
        $li.data('item', item);

        var $item = $('<a class="form-inline" />').appendTo($li);

        if (Browser.IsMobile()) {
            this.renderToolbar($li, item);
        }
        else {
            // render info, complete, skip, and defer buttons
            var $infoBtn = Control.Icons.infoBtn(item).appendTo($item);
            $infoBtn.addClass('pull-right btn-step');
            var $completeBtn = Control.Icons.completeBtn(item, function (item) { return Control.Icons.completeHandler(item); }).appendTo($item);
            $completeBtn.addClass('pull-right btn-step');
            var $skipBtn = Control.Icons.skipBtn(item).appendTo($item);
            $skipBtn.addClass('pull-right btn-step');
            var $deferBtn = Control.DeferButton.renderDropdown($item, item);
            $deferBtn.addClass('pull-right btn-step');

            // render the action button based on the action type
            var $actionButton = this.actionButton(item);
            if ($actionButton != null) {
                $actionButton.appendTo($item);
                $actionButton.addClass('pull-right btn-step');
            }
        }

        this.renderNameField($item, item);

        // click item to select
        $li.bind('click', function (e) {
            if ($(this).hasClass('ui-sortable-helper') ||
                $(e.srcElement).hasClass('dt-checkbox') ||
                $(e.srcElement).hasClass('dropdown-toggle') ||
                $(e.srcElement).parent().hasClass('dropdown-toggle') ||
                $(e.srcElement).hasClass('dt-email')) {
                return;
            }
            var item = $(this).data('item');
            Control.get(this).parentControl.selectItem(item);
        });

        this.renderFields($item, item);
        itemCount++;
    }

    // make the dropdown for the defer button of the last button row into a drop-up
    if (itemCount > 1) { $li.find('div.control-group div').addClass('dropup'); }
    return itemCount;
}

ListView.prototype.renderToolbar = function ($item, item) {
    var $toolbar = $('<div class="btn-toolbar" />').appendTo($item);
    // HACK: somehow the height is computed to zero on list items past the first one
    $toolbar.css('height', '28px');  
    
    // render defer dropdown button
    var $deferBtn = Control.DeferButton.renderDropdown($toolbar, item);
    $deferBtn.addClass('pull-left');
    // render complete, skip, info buttons
    Control.Icons.createToolbarButton(Control.Icons.completeBtn(item, function (item) { Control.Icons.completeHandler(item); }), true).appendTo($toolbar);
    Control.Icons.createToolbarButton(Control.Icons.skipBtn(item), true).appendTo($toolbar);
    Control.Icons.createToolbarButton(Control.Icons.infoBtn(item), false).appendTo($toolbar);
    // render action button
    var $actionButton = this.actionButton(item);
    if ($actionButton != null) {
        Control.Icons.createToolbarButton($actionButton).appendTo($toolbar);
    }
}

ListView.prototype.actionButton = function (item) {
    var actionType = item.GetActionType();
    if (actionType == null) return null;
    var actionTypeName = actionType.Name;
    switch (actionTypeName) {
        case ActionTypes.Call:
            if (item.GetPhoneNumber() != null) {
                return Control.Icons.callBtn(item);
            }
            break;
        case ActionTypes.TextMessage:
            if (item.GetPhoneNumber() != null) {
                return Control.Icons.textBtn(item);
            }
            break;
        case ActionTypes.SendEmail:
            if (item.GetEmail() != null) {
                return Control.Icons.emailBtn(item);
            }
            break;
        case ActionTypes.Errand:
            if (item.GetMapLink() != null) {
                return Control.Icons.mapBtn(item);
            }
            break;
        case ActionTypes.Find:
            return Control.Icons.findLocalBtn(item);
        case ActionTypes.Schedule:
            return Control.Icons.scheduleBtn(item);
    }
}

ListView.prototype.renderNameField = function ($item, item) {
    var fields = item.GetFields();
    field = fields[FieldNames.Name];
    // workaround for IE9 bug - where the name field for list items past the first one is indented. 
    // adding a zero-height <p> fixes this.
    $('<p style="height: 0px;" />').appendTo($item);
    Control.Text.renderActivityLink($item, item, function (activity) {
        NextStepsPage.showManager(NextStepsPage.infoManager);
        NextStepsPage.infoManager.selectItem(activity);        
    });
    Control.Text.renderLabel($item, item, field).appendTo($item);
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

