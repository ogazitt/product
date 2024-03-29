﻿//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// ActionTypeList.js

// ---------------------------------------------------------
// ActionTypeList control
function ActionTypeList(actionTypes) {
    // fires notification when selected actionType changes
    this.onSelectionChangedHandlers = {};
    this.init(actionTypes);
}

ActionTypeList.prototype.init = function (actionTypes) {
    this.actionTypes = actionTypes;
    this.$element = null;
}

ActionTypeList.prototype.addSelectionChangedHandler = function (name, handler) {
    this.onSelectionChangedHandlers[name] = handler;
}

ActionTypeList.prototype.removeSelectionChangedHandler = function (name) {
    this.onSelectionChangedHandlers[name] = undefined;
}

ActionTypeList.prototype.fireSelectionChanged = function (actionType, userAction) {
    for (var name in this.onSelectionChangedHandlers) {
        var handler = this.onSelectionChangedHandlers[name];
        if (typeof (handler) == "function") {
            handler(actionType, userAction);
        }
    }
}

ActionTypeList.prototype.render = function ($element, actionTypes, userAction) {
    if (actionTypes != null) {
        $element.empty();
        this.init(actionTypes);
        this.renderActionTypeList($element, actionTypes);
    }
    else if (this.$element == null) {
        this.renderActionTypeList($element, this.actionTypes);
    }
    else if ($element.find('.actiontypelist') == null) {
        this.$element.appendTo($element);
    }
    this.show();
    // select current ActionType
    this.select(this.$currentActionType, this.currentActionType);
    this.fireSelectionChanged(this.currentActionType, (userAction == null) ? true : userAction);
}

ActionTypeList.prototype.renderActionTypeList = function ($element, actionTypes) {
    if (!Browser.IsMobile()) {
        $header = $('<div class="nav-header"></div>').appendTo($element);
        this.renderTabs($header);
    }
    this.$element = $('<ul class="nav nav-pills nav-stacked actiontypelist" />').appendTo($element);
    //Control.List.sortable(this.$element);
    this.$currentActionType = null;
    for (var id in this.actionTypes) {
        var actionType = this.actionTypes[id];
        var $li = $('<li />').appendTo(this.$element);
        $li.data('control', this);
        $li.data('item', actionType);
        $li.click(function () { Control.get(this).actionTypeClicked($(this)); });

        var $icon = Control.Icons.forActionType(actionType);
        var $actionType = $('<a />').appendTo($li);

        if (Browser.IsMobile()) {
            $icon.addClass('icon-large icon-blue');
            //$('<p>' + actionType.Name + '</p>').appendTo($actionType);
        } else {
            if (actionType.Name != ActionTypes.All) { $li.addClass('itemlist'); }
            $('<span>&nbsp;' + actionType.Name + '</span>').appendTo($actionType);
        }
        $actionType.prepend($icon);

        if (this.currentActionType == null) {
            this.currentActionType = actionType;
            this.$currentActionType = $li;
        }
        if (this.currentActionType == actionType) { this.$currentActionType = $li; }
    }
}

ActionTypeList.prototype.renderTabs = function ($header) {
    var $tabs = $('<ul class="nav nav-tabs" />').appendTo($header);
    var $tab = $('<li><a data-toggle="tab"><i class="icon-dashboard"></i></a></li>').appendTo($tabs);
    $tab.css('width', '30%');
    Control.tooltip($tab, 'Organizer', 'bottom');
    $tab.click(function () { window.location = '/dashboard/home'; });    // TEMPORARY
    $tab = $('<li class="active"><a data-toggle="tab"><i class="icon-play"></i> Next Steps</a></li>').appendTo($tabs);
    $tab.css('width', '70%');
}

ActionTypeList.prototype.actionTypeClicked = function ($actionType) {
    var actionType = $actionType.data('item');
    this.select($actionType, actionType);
    this.currentActionType = actionType;
    this.$currentActionType = $actionType;
    this.fireSelectionChanged(actionType, true);  // signal that this was a user click
}

ActionTypeList.prototype.select = function ($item, item) {
    this.deselect();
    $item.addClass('active');
}

ActionTypeList.prototype.deselect = function () {
    this.$element.find('li').removeClass('active');
}

ActionTypeList.prototype.show = function () {
    if (this.$element != null) {
        this.$element.show();
    }
}

ActionTypeList.prototype.hide = function () {
    if (this.$element != null) {
        this.$element.hide();
    }
}
