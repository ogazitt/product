//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// ActivityList.js

// ---------------------------------------------------------
// ActivityList control
function ActivityList(parentControl) {
    this.parentControl = parentControl;
    this.$element = null;
    this.listView = new ActivityListView(this);
}

ActivityList.prototype.render = function ($element, list, maxHeight) {
    if (this.$element == null) { this.$element = $element; }
    this.listView.render(this.$element, list, maxHeight);   
}

ActivityList.prototype.selectItem = function (item) {
    this.parentControl.fireSelectionChanged(item);
}


// ---------------------------------------------------------
// ActivityListView control
function ActivityListView(parentControl) {
    this.parentControl = parentControl;
    this.$element = null;
    this.list = null;
}

ActivityListView.prototype.hide = function () {
    if (this.$element != null) {
        this.$element.hide();
    }
}

ActivityListView.prototype.show = function () {
    if (this.$element != null) {
        this.$element.show();
    }
}

ActivityListView.prototype.render = function ($element, list, height) {
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

    if (this.renderListItems(list.GetItems()) > 0) {
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

ActivityListView.prototype.renderListItems = function (listItems) {
    var itemCount = 0;
    for (var id in listItems) {
        var item = listItems[id];
        var $li = $('<li />').appendTo(this.$element);
        $li.data('control', this);
        $li.data('item', item);

        var $item = $('<a class="form-inline" />').appendTo($li);
        this.renderNameField($item, item);
        this.renderFields($item, item);
        this.renderToolbar($item, item);

        // click item to select
        $li.bind('click', function (e) {
            if ($(e.target).hasClass('btn-step') || $(e.target.parentElement).hasClass('btn-step'))
            { return true; }

            $(this).siblings('li').removeClass('selected');
            $(this).siblings('li').find('.btn-toolbar').hide();
            $(this).addClass('selected');
            $(this).find('.btn-toolbar').toggle();
        });

        itemCount++;
    }

    return itemCount;
}

ActivityListView.prototype.renderToolbar = function ($item, item) {
    var $toolbar = $('<div class="btn-toolbar hide" />').appendTo($item);    
    this.mobileButton(Control.Icons.mapBtn(item)).appendTo($toolbar);
    this.mobileButton(Control.Icons.callBtn(item)).appendTo($toolbar);
    this.mobileButton(Control.Icons.textBtn(item)).appendTo($toolbar);
    this.mobileButton(Control.Icons.emailBtn(item)).appendTo($toolbar);
}

// wrap an icon with a btn style appropriate for rendering on mobile devices
ActivityListView.prototype.mobileButton = function Control$Icons$mobileButton($iconButton, propagate) {
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

ActivityListView.prototype.renderNameField = function ($item, item) {
    var fields = item.GetFields();
    field = fields[FieldNames.Name];
    var $icon = Control.Icons.forItemType(item);

    var $strong = $('<strong />').appendTo($item);
    var $link = Control.Text.renderActivityLink($strong, item, function (activity) {
        NextStepsPage.showManager(NextStepsPage.infoManager);
        NextStepsPage.infoManager.selectItem(item);
    });
    $link.prepend($icon);
}

ActivityListView.prototype.renderFields = function ($element, item) {
    var $fields = $('<div />').appendTo($element);
    var fields = item.GetFields();
    for (var name in fields) {
        var field = fields[name];
        this.renderField($fields, item, field);
    }
    $('<small>&nbsp;</small>').appendTo($fields); 
}

ActivityListView.prototype.renderField = function ($element, item, field) {
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

