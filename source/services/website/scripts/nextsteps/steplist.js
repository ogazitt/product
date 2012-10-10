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
        if ($selected.length == 0) {
            this.$element.find('li:first').click();
        } else {
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
            Control.Actions.render($wrapper, item);

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
            var $wrapper = $('<div class="inline" />').appendTo($li).css('width', '100%');
            var $item = $('<div class="pull-left" />').appendTo($wrapper);
            if (!Browser.IsMobile() && item.IsActive()) {
                $item.append(Control.Actions.actionButton(item).addClass('btn-primary')).addClass('btn-toolbar');
                $item = $('<div class="pull-left" />').appendTo($wrapper);
            }
            this.renderNameField($item, item);
            this.renderFields($item, item);
            Control.Actions.render($wrapper, item);
        }

        itemCount++;
    }

    // make the dropdown for the defer button of the last button row into a drop-up
    if (itemCount > 1) { $li.find('div.control-group').addClass('dropup'); }
    return itemCount;
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
                $field = Control.Text.render($element, item, field, 'small', 'Complete by ');
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

