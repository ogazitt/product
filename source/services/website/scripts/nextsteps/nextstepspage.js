//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// NextStepsPage.js

// ---------------------------------------------------------
// NextStepsPage static object - manages controls for the next steps page

var NextStepsPage = function NextStepsPage$() {
    // data members used
    this.dataModel = null;
    this.stepList = null;
    this.actionTypeList = null;
}

// ---------------------------------------------------------
// public methods

NextStepsPage.Init = function NextStepsPage$Init(dataModel) {
    NextStepsPage.dataModel = dataModel;

    NextStepsPage.checkBrowser();

    //NextStepsPage.dataModel.AddDataChangedHandler('nextsteps', NextStepsPage.ManageDataChange);

    // dashboard regions
    NextStepsPage.$element = $('.dashboard-region');
    NextStepsPage.$center = $('.dashboard-center');
    NextStepsPage.$left = $('.dashboard-left');

    // actionType list
    NextStepsPage.actionTypeList = new ActionTypeList(dataModel.ActionTypes);
    NextStepsPage.actionTypeList.addSelectionChangedHandler('nextsteps', NextStepsPage.ManageActionType);

    // step manager
    NextStepsPage.stepManager = new StepManager(NextStepsPage, NextStepsPage.$center);
    NextStepsPage.stepManager.addSelectionChangedHandler('nextsteps', NextStepsPage.ManageActionType);
    NextStepsPage.showManager(NextStepsPage.stepManager);

    // bind events
    $(window).bind('load', NextStepsPage.resize);
    $(window).bind('resize', NextStepsPage.resize);
    $(window).bind('unload', NextStepsPage.Close);
    $logo = $('.brand a');
    $logo.unbind('click');
    $logo.click(function () { NextStepsPage.dataModel.Refresh(); return false; });

    // add options to header dropdown
    NextStepsPage.showHeaderOptions();
}

NextStepsPage.Close = function NextStepsPage$Close(event) {
    $('.header-icons').hide();
    NextStepsPage.dataModel.Close();
}

// event handler, do not reference 'this' to access static NextStepsPage
/*
NextStepsPage.ManageDataChange = function NextStepsPage$ManageDataChange(folderID, itemID) {
    NextStepsPage.ManageActionType(actionType);
    NextStepsPage.actionTypeList.render(NextStepsPage.$left, NextStepsPage.dataModel.ActionTypes);
}
*/

// event handler, do not reference 'this' to access static NextStepsPage
NextStepsPage.ManageActionType = function NextStepsPage$ManageActionType(actionType) {
    NextStepsPage.showManager(NextStepsPage.stepManager);
    NextStepsPage.stepManager.selectActionType(actionType);
}

// ---------------------------------------------------------
// private methods

NextStepsPage.render = function NextStepsPage$render(folderID, itemID) {
    NextStepsPage.actionTypeList.render(NextStepsPage.$left);
}

// show options in header dropdown (refresh, settings, etc.)
NextStepsPage.showHeaderOptions = function NextStepsPage$showHeaderOptions() {
    $dropdown = $('.navbar-fixed-top .pull-right .dropdown-menu');
    // refresh
    $menuitem = $dropdown.find('.option-refresh');
    $menuitem.show();
    $menuitem.click(function (e) {
        NextStepsPage.dataModel.Refresh();
        e.preventDefault();
    });
    // user settings
    $menuitem = $dropdown.find('.option-settings');
    $menuitem.show();
    $menuitem.click(function (e) {
        NextStepsPage.showManager(NextStepsPage.settingsManager);
        e.preventDefault();
    });
    // help
    $menuitem = $dropdown.find('.option-help');
    $menuitem.show();
    $menuitem.click(function (e) {
        NextStepsPage.showManager(NextStepsPage.helpManager);
        e.preventDefault();
    });
}

NextStepsPage.showManager = function NextStepsPage$showManager(manager, forceRender) {
    if (NextStepsPage.currentManager != manager) {
        NextStepsPage.currentManager = manager;
        (manager.addWell == true) ? NextStepsPage.$center.addClass('well') : NextStepsPage.$center.removeClass('well');
    }
    // always show to force render if necessary
    manager.show(forceRender);
}

NextStepsPage.resize = function NextStepsPage$resize() {
    if (NextStepsPage.resizing) { return; }

    NextStepsPage.resizing = true;
    $(window).unbind('resize', NextStepsPage.resize);

    var winHeight = $(window).height();
    var headerHeight = $('.navbar-fixed-top').height();
    var footerHeight = $('.navbar-fixed-bottom').height();
    var dbHeight = winHeight - (headerHeight + footerHeight + 30);

    NextStepsPage.$left.height(dbHeight);
    NextStepsPage.$center.height(dbHeight);

    //NextStepsPage.showManager(NextStepsPage.currentManager, true);
    NextStepsPage.actionTypeList.render(NextStepsPage.$left);
    //NextStepsPage.folderManager.render();

    $(window).bind('resize', NextStepsPage.resize);
    NextStepsPage.resizing = false;
}

NextStepsPage.checkBrowser = function NextStepsPage$checkBrowser() {
    if (Browser.IsMSIE() && Browser.MSIE_Version() < 9) {
        var header = "We're Sorry!";
        var message = "This application currently requires an HTML5-compatible browser. We encourage you to try using the application with the latest version of Internet Explorer, Chrome, or FireFox.<br/>Thank you";
        Control.alert(message, header);
    }
}

