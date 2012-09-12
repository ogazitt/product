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
    }

    this.hide();
    this.$element.empty();

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

        if (Browser.IsMobile()) {
            var $wrapper = $('<a class="inline" />').appendTo($li);
            this.renderNameField($wrapper, item);
            this.renderFields($wrapper, item);
            this.renderToolbar($wrapper, item);

            // select
            $li.click(function (e) {
                if ($(e.target).hasClass('btn-step') || $(e.target.parentElement).hasClass('btn-step'))
                { return true; }

                $(this).siblings('li').removeClass('selected');
                $(this).siblings('li').find('.btn-toolbar').hide();
                $(this).addClass('selected');
                $(this).find('.btn-toolbar').toggle();
            });

        }
        else {
            var $wrapper = $('<dive class="inline" />').appendTo($li);
            $wrapper.css('width', '100%');
            var $item = $('<div class="pull-left" />').appendTo($wrapper);
            this.renderNameField($item, item);
            this.renderFields($item, item);

            var $toolbar = $('<div class="btn-toolbar pull-right" />').appendTo($wrapper);
            // render info, complete, skip, and defer buttons
            var $deferBtn = Control.DeferButton.renderDropdown($toolbar, item);
            var $skipBtn = Control.Icons.skipBtn(item).appendTo($toolbar);
            var $completeBtn = Control.Icons.completeBtn(item, function (item) { return Control.Icons.completeHandler(item); }).appendTo($toolbar);
            var $infoBtn = Control.Icons.infoBtn(item).appendTo($toolbar);

            // render the action button based on the action type
            var $actionButton = this.actionButton(item);
            if ($actionButton != null) {
                $actionButton.prependTo($toolbar);
            }
        }

        itemCount++;
    }

    // make the dropdown for the defer button of the last button row into a drop-up
    if (itemCount > 1) { $li.find('div.control-group').addClass('dropup'); }
    return itemCount;
}

ListView.prototype.renderToolbar = function ($item, item) {
    var $toolbar = $('<div class="btn-toolbar hide" />').appendTo($item);

    // render defer dropdown button
    var $deferBtn = Control.DeferButton.renderDropdown($toolbar, item);
    // render skip, complete, info buttons
    this.mobileButton(Control.Icons.skipBtn(item), true).appendTo($toolbar);
    this.mobileButton(Control.Icons.completeBtn(item, function (item) { return Control.Icons.completeHandler(item); }), true).appendTo($toolbar);
    this.mobileButton(Control.Icons.infoBtn(item), false).appendTo($toolbar);

    // render action buttons
    var $actionButton = this.actionButton(item);
    if ($actionButton != null) {
        this.mobileButton($actionButton).prependTo($toolbar);
    }
}

ListView.prototype.actionButton = function (item) {
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

// wrap an icon with a btn style appropriate for rendering on mobile devices
ListView.prototype.mobileButton = function Control$Icons$mobileButton($iconButton, propagate) {
    var $btn = $('<a class="btn btn-step" />').append($iconButton);
    var $icon = $iconButton.find('i');
    $icon.addClass('icon-blue');
    var title = $icon.attr('title');
    $icon.attr('title', null);
    var $title = $('<p />').appendTo($btn);
    $title.html(title);
    $btn.click(function (e) { 
        $icon.click();
        return (propagate == true) ? true : false;
    });
    return $btn;
}

ListView.prototype.renderNameField = function ($item, item) {
    var fields = item.GetFields();
    field = fields[FieldNames.Name];
    var $strong = $('<strong />').appendTo($item);
    Control.Text.renderActivityLink($strong, item, function (activity) {
        NextStepsPage.showManager(NextStepsPage.infoManager);
        NextStepsPage.infoManager.selectItem(activity);
    });
    Control.Text.render($strong, item, field, 'span', ' : ').appendTo($item);
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

