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
    this.categoryList = null;
    this.currentList = null;
    this.currentManager = null;
}

// ---------------------------------------------------------
// public methods

NextStepsPage.Init = function NextStepsPage$Init(dataModel) {
    NextStepsPage.dataModel = dataModel;

    NextStepsPage.checkBrowser();

    NextStepsPage.dataModel.AddDataChangedHandler('nextsteps', NextStepsPage.ManageDataChange);

    // dashboard regions
    NextStepsPage.$element = $('.dashboard-region');
    NextStepsPage.$center = $('.dashboard-center');
    NextStepsPage.$left = $('.dashboard-left');
    NextStepsPage.$left.empty();

    // actionType list
    NextStepsPage.actionTypeList = new ActionTypeList(dataModel.ActionTypes);
    NextStepsPage.actionTypeList.addSelectionChangedHandler('nextsteps', NextStepsPage.ManageActionType);

    // category list
    if (Browser.IsMobile()) {
        NextStepsPage.categoryList = new CategoryList(dataModel.Folders);
        NextStepsPage.categoryList.addSelectionChangedHandler('nextsteps', NextStepsPage.ManageCategory);
        NextStepsPage.activityManager = new ActivityManager(NextStepsPage, NextStepsPage.$center);
        //NextStepsPage.activityManager.addSelectionChangedHandler('nextsteps', NextStepsPage.ManageCategory);
    }

    // set initial list (actionTypeList)
    //NextStepsPage.currentList = NextStepsPage.actionTypeList;

    // info manager
    NextStepsPage.infoManager = new InfoManager(NextStepsPage, NextStepsPage.$center);
    //NextStepsPage.infoManager.addSelectionChangedHandler('nextsteps', NextStepsPage.ManageActionType);

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

    // render the page
    NextStepsPage.render();
}

NextStepsPage.Close = function NextStepsPage$Close(event) {
    $('.header-icons').hide();
    NextStepsPage.dataModel.Close();
}

// event handler, do not reference 'this' to access static NextStepsPage
NextStepsPage.ManageDataChange = function NextStepsPage$ManageDataChange(folderID, itemID) {
    //NextStepsPage.actionTypeList.render(NextStepsPage.$left, NextStepsPage.dataModel.ActionTypes);
    NextStepsPage.currentList.render(NextStepsPage.$left, null, false);
    //NextStepsPage.render(NextStepsPage.currentList);
}

// event handler, do not reference 'this' to access static NextStepsPage
NextStepsPage.ManageActionType = function NextStepsPage$ManageActionType(actionType, userAction) {
    // reset manager to Step Manager only if this was a user action
    var manager = (userAction == true) ? NextStepsPage.stepManager : NextStepsPage.currentManager;
    NextStepsPage.showManager(manager, (userAction != true));
    NextStepsPage.stepManager.selectActionType(actionType);
}

// event handler, do not reference 'this' to access static NextStepsPage
NextStepsPage.ManageCategory = function NextStepsPage$ManageCategory(category, userAction) {
    // reset manager to Step Manager only if this was a user action
    var manager = NextStepsPage.activityManager;
    NextStepsPage.showManager(manager);
    NextStepsPage.activityManager.selectCategory(category);
}

// ---------------------------------------------------------
// private methods

NextStepsPage.render = function NextStepsPage$render(list) {
    if (list == null) list = NextStepsPage.actionTypeList;
    if (NextStepsPage.currentList != list) {
        NextStepsPage.currentList = list;
        NextStepsPage.actionTypeList.hide();
        if (NextStepsPage.categoryList != null) { NextStepsPage.categoryList.hide(); }
        NextStepsPage.currentList.render(NextStepsPage.$left);
    }
}

// show options in header dropdown (refresh, settings, etc.)
NextStepsPage.showHeaderOptions = function NextStepsPage$showHeaderOptions() {
    var $navbar = $('.navbar-fixed-top .pull-right');
    var $navbtn = $navbar.find('.option-nextsteps a i').addClass('icon-white');

    // refresh
    var $dropdown = $('.navbar-fixed-top .pull-right .dropdown-menu');
    var $menuitem = $navbar.find('.option-refresh');
    $menuitem.show();
    $menuitem.click(function (e) {
        NextStepsPage.dataModel.Refresh();
        e.preventDefault();
    });

    if (!Browser.IsMobile()) {
        $navbar.find('.option-categories a i').attr('title', 'Activity Dashboard').tooltip(Control.ttDelayBottom);
        $navbar.find('.option-nextsteps a i').attr('title', 'Next Steps').tooltip(Control.ttDelayBottom);
        /*
        // user settings
        $menuitem = $dropdown.find('.option-settings');
        $menuitem.show();
        $menuitem.click(function (e) {
        Dashboard.showManager(Dashboard.settingsManager);
        e.preventDefault();
        });
        // help
        $menuitem = $dropdown.find('.option-help');
        $menuitem.show();
        $menuitem.click(function (e) {
        Dashboard.showManager(Dashboard.helpManager);
        e.preventDefault();
        });
        */
    } else {
        // 2012-09-20 OG: temporary fix - make both "mode" buttons white, to make them legible
        $navbar.find('.option-nextsteps a i').addClass('icon-white');//.addClass('icon-large');
        $navbar.find('.option-categories a i').addClass('icon-white');//.addClass('icon-large');

        // next steps
        var $navbtn = $navbar.find('.option-nextsteps');
        $navbtn.show();
        $navbtn.click(function (e) {
            NextStepsPage.render(NextStepsPage.actionTypeList);
            //$navbar.find('.option-nextsteps a i').addClass('icon-white');
            //$navbar.find('.option-categories a i').removeClass('icon-white');
            e.preventDefault();
        });
        // categories
        $navbtn = $navbar.find('.option-categories');
        $navbtn.show();
        $navbtn.click(function (e) {
            NextStepsPage.render(NextStepsPage.categoryList);
            //$navbar.find('.option-nextsteps a i').removeClass('icon-white');
            //$navbar.find('.option-categories a i').addClass('icon-white');
            e.preventDefault();
        });
        // add
        $navbtn = $navbar.find('.option-add');
        $navbtn.show();
        var $dialog = $('<div><label>Activity name: </label><input type="text" /></div>');
        var header = 'Add a new activity';
        $navbtn.click(function (e) {
            Control.popup($dialog, header, function (inputs) {
                if (inputs[0].length == 0) {
                    Control.alert('Please provide a name for the activity', 'Add activity');
                }
                else {
                    var name = inputs[0];
                    // create the activity
                    var activity = Item.Extend({ Name: name, ItemTypeID: ItemTypes.Activity, IsList: true, Status: StatusTypes.Active });
                    var inbox = DataModel.UserSettings.GetDefaultList(ItemTypes.Activity);
                    // insert into the default folder for activities (inbox)
                    DataModel.InsertItem(activity, inbox, null, null, null, function (insertedActivity) {
                        // success handler: insert a reminder step into the new activity
                        insertedActivity = Item.Extend(insertedActivity);
                        var reminder = Item.Extend({ Name: name, ItemTypeID: ItemTypes.Step, IsList: false, Status: StatusTypes.Active });
                        reminder.SetFieldValue(FieldNames.DueDate, Date.today().format('shortDate'));
                        insertedActivity.InsertItem(reminder);
                    });
                }
            });
            e.preventDefault();
        });
    }
}

NextStepsPage.showManager = function NextStepsPage$showManager(manager, forceRender) {
    if (NextStepsPage.currentManager != manager) {
        NextStepsPage.stepManager.hide();
        NextStepsPage.infoManager.hide();
        if (NextStepsPage.activityManager != null) {
            NextStepsPage.activityManager.hide();
        }
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
    // set min height for phone in landscape mode
    dbHeight = (dbHeight < 280) ? 280 : dbHeight;
    NextStepsPage.$left.height(dbHeight);
    NextStepsPage.$center.height(dbHeight);

    NextStepsPage.render(NextStepsPage.currentList);
    NextStepsPage.showManager(NextStepsPage.currentManager, true);

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

