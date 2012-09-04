//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// ActivityManager.js

// ---------------------------------------------------------
// ActivityManager control
function ActivityManager(parentControl, $parentElement) {
    this.parentControl = parentControl;
    this.$parentElement = $parentElement;
    this.addWell = false;

    this.$element = null;
    this.currentCategory = null;
    this.currentItem = null;
    this.views = {};
    this.onSelectionChangedHandlers = {};
    this.activityList = new ActivityList(this);
}

ActivityManager.ListView = "fm-list-view";

ActivityManager.prototype.addSelectionChangedHandler = function (name, handler) {
    this.onSelectionChangedHandlers[name] = handler;
}

ActivityManager.prototype.removeSelectionChangedHandler = function (name) {
    this.onSelectionChangedHandlers[name] = undefined;
}

ActivityManager.prototype.fireSelectionChanged = function (item) {
    for (var name in this.onSelectionChangedHandlers) {
        var handler = this.onSelectionChangedHandlers[name];
        if (typeof (handler) == "function") {
            handler(null);
            this.activeView(ActivityManager.ListView);  // refresh ListView
        }
    }
}

ActivityManager.prototype.hide = function () {
    if (this.$element != null) {
        this.$element.hide();
    }
}

ActivityManager.prototype.show = function (forceRender) {
    if (this.$element == null) {
        this.$element = $('<div class="manager-folders" />').appendTo(this.$parentElement);
        // render tabs
        var $tabs = $('<ul class="nav nav-tabs" />').appendTo(this.$element);
        $tabs.data('control', this);
        var $tab = $('<li><a data-toggle="tab">List View</a></li>').appendTo($tabs);
        $tab.find('a').attr('href', '.' + ActivityManager.ListView);

        // render views
        var $tabContent = $('<div class="tab-content" />').appendTo(this.$element);
        // try to force proper height for scrolling (smillet workaround 8/30/12)
        var parentHeight = this.$parentElement.height();
        //$tabContent.css('max-height', parentHeight);

        var $view = $('<div class="tab-pane" />').appendTo($tabContent);
        $view.addClass(ActivityManager.ListView);
        this.views[ActivityManager.ListView] = $view;

        $('a[data-toggle="tab"]').on('shown', function (e) {
            var $tabs = $(e.target).parents('.nav-tabs');
            Control.get($tabs).viewChanged($(e.target)); ;
        });
    }
    if (forceRender == true) { this.render(); }
    this.$element.show();
}

// render is only called internally by show method
ActivityManager.prototype.render = function () {
    var $tabs = this.$element.find('.nav-tabs');
    var $tabContent = this.$element.find('.tab-content');
    $tabs.find('li a:first').empty().append(this.activeCategoryName());

    var activeView = this.activeView();
    var activeItem = this.activeItem();
    var $view = this.views[activeView];
    var maxContentHeight = this.$parentElement.outerHeight() - $tabs.outerHeight();
    // temporary workaround (smillet 8/30/12)
    // Omri changes have cause tab-content to overflow dashboard-center height 
    // force max-height of tab-content
    $tabContent.css('max-height', maxContentHeight - 30);

    if (activeView == ActivityManager.ListView) {
        this.activityList.render($view, this.activeCategory(), maxContentHeight);
    }
    $tabs.find('a[href=".' + activeView + '"]').tab('show');
}

ActivityManager.prototype.selectCategory = function (category) {
    if (category != null) {
        this.currentCategory = category;
        this.currentItem = null;
    }
    if (this.currentCategory != null) this.render();
}

ActivityManager.prototype.selectItem = function (item) {
    this.currentItem = item;
    if (this.currentItem != null) {
        this.currentCategory = this.currentItem.GetFolder();
        this.render();
    } else {
        this.selectCategory(this.currentCategory);
    }
}

ActivityManager.prototype.activeItem = function () {
    var parent = null;
    if (this.currentItem != null) {
        if (this.currentItem.IsList) {
            parent = this.currentItem;
        } else {
            return this.currentItem;
        }
    } else if (this.currentCategory != null) {
        parent = this.currentCategory;
    }

    if (parent != null) {
        // select first item in list
        var items = parent.GetItems();
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

ActivityManager.prototype.activeCategory = function () {
    return this.currentCategory;
}

ActivityManager.prototype.activeCategoryName = function () {
    var activeCategory = this.activeCategory();
    if (activeCategory != null) {
        var $icon = Control.Icons.forFolder(activeCategory);
        return $('<span>&nbsp;' + activeCategory.Name + '</span>').prepend($icon);
    }
    return $('<span>List View</span>');
}

ActivityManager.prototype.activeView = function (viewName) {
    var dataModel = Control.findParent(this, 'dataModel').dataModel;
    if (viewName === undefined) {       // get
        return ActivityManager.ListView;
    } else {                            // set
        this.render();
    }
}

ActivityManager.prototype.viewChanged = function ($tab) {
    this.activeView($tab.attr('href').substr(1));
}
