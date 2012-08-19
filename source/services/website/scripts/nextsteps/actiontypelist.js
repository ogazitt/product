//----------------------------------------------------------
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

ActionTypeList.prototype.fireSelectionChanged = function (actionType) {
    for (var name in this.onSelectionChangedHandlers) {
        var handler = this.onSelectionChangedHandlers[name];
        if (typeof (handler) == "function") {
            handler(actionType);
        }
    }
}

ActionTypeList.prototype.render = function ($element, actionTypes) {
    if (actionTypes != null) {
        this.init(actionTypes);
    }
    $element.empty();
    this.$element = $('<ul class="nav nav-pills nav-stacked" />').appendTo($element);
    //Control.List.sortable(this.$element);
    for (var id in this.actionTypes) {
        var actionType = this.actionTypes[id];
        $actionType = $('<li><a><strong>&nbsp;' + actionType.Name + '</strong></a></li>').appendTo(this.$element);
        $actionType.data('control', this);
        $actionType.data('item', actionType);
        $actionType.click(function () { Control.get(this).actionTypeClicked($(this)); });
        $actionType.find('strong').prepend(Control.Icons.forActionType(actionType));
    }
    // select last ActionType
    // TODO: change this to first ActionType 
    this.select($actionType, actionType);
    this.fireSelectionChanged(actionType);
}

ActionTypeList.prototype.actionTypeClicked = function ($actionType) {
    var actionType = $actionType.data('item');
    this.select($actionType, actionType);
    this.fireSelectionChanged(actionType);
}

ActionTypeList.prototype.select = function ($item, item) {
    this.deselect();
    $item.addClass('active');
}

ActionTypeList.prototype.deselect = function () {
    this.$element.find('li').removeClass('active');
}
