//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// StepManager.js

// ---------------------------------------------------------
// StepManager control
function StepManager(parentControl, $parentElement) {
    this.parentControl = parentControl;
    this.$parentElement = $parentElement;
    this.addWell = false;

    this.$element = null;
    this.currentActionType = null;
    this.currentItem = null;
    this.views = {};
    this.onSelectionChangedHandlers = {};
    this.stepList = new StepList(this);
}

StepManager.ListView = "fm-list-view";

StepManager.prototype.addSelectionChangedHandler = function (name, handler) {
    this.onSelectionChangedHandlers[name] = handler;
}

StepManager.prototype.removeSelectionChangedHandler = function (name) {
    this.onSelectionChangedHandlers[name] = undefined;
}

StepManager.prototype.fireSelectionChanged = function (item) {
    for (var name in this.onSelectionChangedHandlers) {
        var handler = this.onSelectionChangedHandlers[name];
        if (typeof (handler) == "function") {
            //handler(item.GetActionType());
            handler(null);
            this.activeView(StepManager.ListView);  // refresh ListView
        }
    }
}

StepManager.prototype.hide = function () {
    if (this.$element != null) {
        this.$element.hide();
    }
}

StepManager.prototype.show = function (forceRender) {
    if (this.$element == null) {
        this.$element = $('<div class="manager-folders" />').appendTo(this.$parentElement);
        // render tabs
        var $tabs = $('<ul class="nav nav-tabs" />').appendTo(this.$element);
        $tabs.data('control', this);
        var $tab = $('<li><a data-toggle="tab">List View</a></li>').appendTo($tabs);
        $tab.find('a').attr('href', '.' + StepManager.ListView);

        // render views
        var $tabContent = $('<div class="tab-content" />').appendTo(this.$element);
        // try to force proper height for scrolling (smillet workaround 8/30/12)
        var parentHeight = this.$parentElement.height();
        //$tabContent.css('max-height', parentHeight);

        var $view = $('<div class="tab-pane" />').appendTo($tabContent);
        $view.addClass(StepManager.ListView);
        this.views[StepManager.ListView] = $view;

        $('a[data-toggle="tab"]').on('shown', function (e) {
            var $tabs = $(e.target).parents('.nav-tabs');
            Control.get($tabs).viewChanged($(e.target)); ;
        });
    }
    if (forceRender == true) { this.render(); }
    this.$element.show();
}

// render is only called internally by show method
StepManager.prototype.render = function () {
    var $tabs = this.$element.find('.nav-tabs');
    var $tabContent = this.$element.find('.tab-content');
    $tabs.find('li a:first').empty().append(this.activeListName());

    var activeView = this.activeView();
    var activeItem = this.activeItem();
    var $view = this.views[activeView];
    var maxContentHeight = this.$parentElement.outerHeight() - $tabs.outerHeight();
    // temporary workaround (smillet 8/30/12)
    // Omri changes have cause tab-content to overflow dashboard-center height 
    // force max-height of tab-content
    $tabContent.css('max-height', maxContentHeight - 30);

    if (activeView == StepManager.ListView) {
        this.stepList.render($view, this.activeList(), maxContentHeight);
    }
    $tabs.find('a[href=".' + activeView + '"]').tab('show');
}

StepManager.prototype.selectActionType = function (actionType) {
    if (actionType != null) {
        this.currentActionType = actionType;
        this.currentItem = null;
    }
    if (this.currentActionType != null) this.render();
}

StepManager.prototype.selectItem = function (item) {
    this.currentItem = item;
    if (this.currentItem != null) {
        this.currentActionType = this.currentItem.GetActionType();
        this.render();
    } else {
        this.selectActionType(this.currentActionType);
    }
}

StepManager.prototype.activeItem = function () {
    var parent = null;
    if (this.currentItem != null) {
        if (this.currentItem.IsList) {
            parent = this.currentItem;
        } else {
            return this.currentItem;
        }
    } else if (this.currentActionType != null) {
        parent = this.currentActionType;
    }

    if (parent != null) {
        // select first item in list
        var items = parent.GetSteps();
        for (var id in items) {
            if (!items[id].IsList) {
                this.currentItem = items[id];
                //this.currentItem.Select();
                break;
            }
        };
    }
    return null;
}

StepManager.prototype.activeList = function () {
    return this.currentActionType;
}

StepManager.prototype.activeListName = function () {
    var activeList = this.activeList();
    if (activeList != null) {
        var $icon = Control.Icons.forActionType(activeList);
        return $('<span>&nbsp;' + activeList.Name + '</span>').prepend($icon);
    }
    return $('<span>List View</span>');
}

StepManager.prototype.activeView = function (viewName) {
    var dataModel = Control.findParent(this, 'dataModel').dataModel;
    if (viewName === undefined) {       // get
        return StepManager.ListView;
    } else {                            // set
        this.render();
    }
}

StepManager.prototype.viewChanged = function ($tab) {
    this.activeView($tab.attr('href').substr(1));
}
