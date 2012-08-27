//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// InfoManager.js

// ---------------------------------------------------------
// InfoManager control
function InfoManager(parentControl, $parentElement) {
    this.parentControl = parentControl;
    this.$parentElement = $parentElement;
    this.addWell = false;

    this.$element = null;
    this.currentItem = null;
    this.views = {};
    this.onSelectionChangedHandlers = {};
    this.itemEditor = new ItemEditor(this);
}

InfoManager.ActivityView = "fm-list-view";
InfoManager.StepView = "fm-item-view";

InfoManager.prototype.addSelectionChangedHandler = function (name, handler) {
    this.onSelectionChangedHandlers[name] = handler;
}

InfoManager.prototype.removeSelectionChangedHandler = function (name) {
    this.onSelectionChangedHandlers[name] = undefined;
}

InfoManager.prototype.fireSelectionChanged = function (item) {
    for (var name in this.onSelectionChangedHandlers) {
        var handler = this.onSelectionChangedHandlers[name];
        if (typeof (handler) == "function") {
            handler(item.FolderID, item.ID);
            this.activeView(InfoManager.StepView);  // refresh StepView
        }
    }
}

InfoManager.prototype.hide = function () {
    if (this.$element != null) {
        this.$element.hide();
    }
}

InfoManager.prototype.show = function (forceRender) {
    if (this.$element == null) {
        this.$element = $('<div class="manager-folders" />').appendTo(this.$parentElement);
        // render tabs
        var $tabs = $('<ul class="nav nav-tabs" />').appendTo(this.$element);
        $tabs.data('control', this);
        var $tab = $('<li><a data-toggle="tab">Info View</a></li>').appendTo($tabs);
        $tab.find('a').attr('href', '.' + InfoManager.StepView);

        // render views
        var $tabContent = $('<div class="tab-content" />').appendTo(this.$element);
        var $view = $('<div class="tab-pane" />').appendTo($tabContent);
        $view.addClass(InfoManager.StepView);
        this.views[InfoManager.StepView] = $view;
        $view = $('<div class="tab-pane" />').appendTo($tabContent);
        $view.addClass(InfoManager.ActivityView);
        this.views[InfoManager.ActivityView] = $view;

        $('a[data-toggle="tab"]').on('shown', function (e) {
            var $tabs = $(e.target).parents('.nav-tabs');
            Control.get($tabs).viewChanged($(e.target)); ;
        });
    }
    if (forceRender == true) { this.render(); }
    this.$element.show();
}

// render is only called internally by show method
InfoManager.prototype.render = function () {
    var $tabs = this.$element.find('.nav-tabs');
    var $tabContent = this.$element.find('.tab-content');
    $tabs.find('li a:first').empty().append(this.activeItemName());

    var activeView = this.activeView();
    var activeItem = this.activeItem();
    var $view = this.views[activeView];
    var maxContentHeight = this.$parentElement.outerHeight() - $tabs.outerHeight();

    if (activeView == InfoManager.StepView) {
        this.itemEditor.render($view, this.activeItem(), maxContentHeight);
    }
    if (activeView == InfoManager.ActivityView) {
        this.itemEditor.render($view, this.activeItem().parent(), maxContentHeight);
    }
    $tabs.find('a[href=".' + activeView + '"]').tab('show');
}

InfoManager.prototype.selectItem = function (item) {
    this.currentItem = item;
    if (this.currentItem != null) {
        this.render();
    }
}

InfoManager.prototype.activeItem = function () {
    var parent = null;
    if (this.currentItem != null) {
        return this.currentItem;
    }
    return null;
}

InfoManager.prototype.activeItemName = function () {
    var activeItem = this.activeItem();
    if (activeItem != null) {
        var $icon = Control.Icons.forActionType(activeItem);
        return $('<span>&nbsp;' + activeItem.Name + '</span>').prepend($icon);
    }
    return $('<span>Item View</span>');
}

InfoManager.prototype.activeView = function (viewName) {
    if (viewName === undefined) {       // get
        return this.currentView != null ? this.currentView : InfoManager.StepView;
    } else {                            // set
        this.currentView = viewName;
        this.render();
    }
}

InfoManager.prototype.viewChanged = function ($tab) {
    this.activeView($tab.attr('href').substr(1));
}
