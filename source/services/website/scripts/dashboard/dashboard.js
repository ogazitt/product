//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// Dashboard.js

// ---------------------------------------------------------
// Dashboard static object - manages controls for dashboard
// assumes there are three panes marked by classes:
// dashboard-left, dashboard-center, dashboard-right

var Dashboard = function Dashboard$() {
    // data members used
    this.dataModel = null;
    this.folderList = null;
    this.helpManager = null;
    this.settingsManager = null;
    this.folderManager = null;
    this.suggestionManager = null;
}

// ---------------------------------------------------------
// public methods

Dashboard.Init = function Dashboard$Init(dataModel, renewFBToken, consentStatus) {
    Dashboard.dataModel = dataModel;

    Dashboard.checkBrowser();
    Dashboard.checkConsent(consentStatus);
    if (renewFBToken == true) {
        Service.GetFacebookConsent();
    }

    Dashboard.dataModel.AddDataChangedHandler('dashboard', Dashboard.ManageDataChange);

    // dashboard regions
    Dashboard.$element = $('.dashboard-region');
    Dashboard.$center = $('.dashboard-center');
    Dashboard.$left = $('.dashboard-left');
    Dashboard.$right = $('.dashboard-right');

    // folders list
    Dashboard.folderList = new FolderList(this.dataModel.Folders);
    Dashboard.folderList.addSelectionChangedHandler('dashboard', Dashboard.ManageFolder);

    // activity gallery 
    Dashboard.activityGallery = new ActivityGallery();
    Dashboard.activityGallery.addSelectionChangedHandler('dashboard', Dashboard.ManageGallery);
    Dashboard.activityGallery.addActivityInstalledHandler('dashboard', Dashboard.refreshAfterInstall);
    Dashboard.dataModel.GetGalleryCategories(Dashboard.renderGallery);

    // suggestions manager
    Dashboard.suggestionManager = new SuggestionManager(Dashboard.dataModel);
    // help and settings managers
    Dashboard.helpManager = new HelpManager(Dashboard, Dashboard.$center);
    Dashboard.settingsManager = new SettingsManager(Dashboard, Dashboard.$center);

    // folder manager
    Dashboard.folderManager = new FolderManager(Dashboard, Dashboard.$center);
    Dashboard.folderManager.addSelectionChangedHandler('dashboard', Dashboard.ManageFolder);
    if (Dashboard.dataModel.UserSettings.ViewState.SelectedFolder != null) {
        Dashboard.showManager(Dashboard.folderManager);
        Dashboard.dataModel.restoreSelection();
    } else {
        Dashboard.showManager(Dashboard.helpManager);
        Dashboard.folderList.render(Dashboard.$left, Dashboard.dataModel.Folders);
    }

    // bind events
    $(window).bind('load', Dashboard.resize);
    $(window).bind('resize', Dashboard.resize);
    $(window).bind('unload', Dashboard.Close);
    $logo = $('.brand a');
    $logo.unbind('click');
    $logo.click(function () { Dashboard.dataModel.Refresh(); return false; });

    // add options to header dropdown
    Dashboard.showHeaderOptions();
}

Dashboard.Close = function Dashboard$Close(event) {
    $('.header-icons').hide();
    Dashboard.dataModel.Close();
}

// event handler, do not reference 'this' to access static Dashboard
Dashboard.ManageDataChange = function Dashboard$ManageDataChange(folderID, itemID, changeType) {
    // cleanup dangling tooltips
    $('.dashboard-region a').tooltip('hide');
    $('.dashboard-region i').tooltip('hide');

    var item = Dashboard.ManageFolder(folderID, itemID);

    if (changeType == DataChangeTypes.Update || 
        (changeType == DataChangeTypes.Insert && item.IsActivity())) {
        Dashboard.folderList.refreshItem(item);         // only refresh changed item
    } else {                                            // refresh entire list
        Dashboard.folderList.render(Dashboard.$left, Dashboard.dataModel.Folders);
    }
}

// event handler, do not reference 'this' to access static Dashboard
Dashboard.ManageFolder = function Dashboard$ManageFolder(folderID, itemID) {
    var item;
    var folder = (folderID != null) ? Dashboard.dataModel.Folders[folderID] : null;
    if (itemID == null) {
        Dashboard.dataModel.UserSettings.Selection(folderID, itemID);
        if (folder != null && folder.ItemTypeID != ItemTypes.Category) {
            Dashboard.showManager(Dashboard.folderManager);
            Dashboard.folderManager.selectFolder(folder);
        } else {
            Dashboard.showManager(Dashboard.helpManager);
        }
        return folder;
    } else {
        item = (folder != null && itemID != null) ? folder.Items[itemID] : null;
        Dashboard.dataModel.UserSettings.Selection(folderID, itemID);
        Dashboard.showManager(Dashboard.folderManager);
        Dashboard.folderManager.selectItem(item);
        return item;
    }
}

// ---------------------------------------------------------
// private methods

Dashboard.render = function Dashboard$render(folderID, itemID) {
    Dashboard.folderList.render(Dashboard.$left);
    Dashboard.dataModel.GetGalleryCategories(Dashboard.renderGallery);
}

// show options in header dropdown (refresh, settings, etc.)
Dashboard.showHeaderOptions = function Dashboard$showHeaderOptions() {
    var $navbar = $('.navbar-fixed-top .pull-right');
    var $navbtn = $navbar.find('.option-categories a i').addClass('icon-white');
    $navbtn.attr('title', 'Activity Dashboard').tooltip(Control.ttDelayBottom);
    $navbar.find('.option-nextsteps a i').attr('title', 'Next Steps').tooltip(Control.ttDelayBottom);

    var $dropdown = $('.navbar-fixed-top .pull-right .dropdown-menu');
    // refresh
    var $menuitem = $dropdown.find('.option-refresh');
    $menuitem.show();
    $menuitem.click(function (e) {
        Dashboard.dataModel.Refresh();
        e.preventDefault();
    });
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
        Dashboard.showManager(Dashboard.helpManager, null, HelpManager.Views.Help);
        e.preventDefault();
    });
}

Dashboard.showManager = function Dashboard$showManager(manager, forceRender, view) {
    if (Dashboard.currentManager != manager) {
        Dashboard.currentManager = manager;
        Dashboard.folderManager.hide();
        Dashboard.settingsManager.hide();
        Dashboard.helpManager.hide();
        (manager.addWell == true) ? Dashboard.$center.addClass('well') : Dashboard.$center.removeClass('well');
    }
    // always show to force render if necessary
    manager.show(forceRender, view);
}

Dashboard.resize = function Dashboard$resize() {
    if (Dashboard.resizing) { return; }

    Dashboard.resizing = true;
    $(window).unbind('resize', Dashboard.resize);

    var winHeight = $(window).height();
    var navTopHeight = $('.navbar-fixed-top').height();
    var navBottomHeight = $('.navbar-fixed-bottom').height();
    var listHeaderHeight = Dashboard.$left.children('.nav-header').height() + 30;
    var dbHeight = winHeight - (navTopHeight + navBottomHeight + 20);

    Dashboard.$left.height(dbHeight);
    Dashboard.$left.children('ul').first().height(dbHeight - listHeaderHeight);
    Dashboard.$center.height(dbHeight);
    Dashboard.$right.height(dbHeight);
    Dashboard.$right.children('ul').first().height(dbHeight - listHeaderHeight);

    Dashboard.showManager(Dashboard.currentManager, true);
    //Dashboard.folderList.render(Dashboard.$left);
    //Dashboard.folderManager.render();

    $(window).bind('resize', Dashboard.resize);
    Dashboard.resizing = false;
}

Dashboard.checkBrowser = function Dashboard$checkBrowser() {
    if (Browser.IsMSIE() && Browser.MSIE_Version() < 9) {
        var header = "We're Sorry!";
        var message = "This application currently requires an HTML5-compatible browser. We encourage you to try using the application with the latest version of Internet Explorer, Chrome, or FireFox.<br/>Thank you";
        Control.alert(message, header);
    }
}

Dashboard.checkConsent = function Dashboard$checkConsent(consentStatus) {
    if (consentStatus != null && consentStatus.length > 0) {
        var message, header;
        switch (consentStatus) {
            case "FBConsentFail":
                header = "Failed!";
                message = "This application was not able to receive consent for accessing your Facebook information.";
                break;
            case "GoogleConsentFail":
                header = "Failed!";
                message = "This application was not able to receive consent for managing your Google calendar.";
                break;
            case "CloudADConsentFail":
                header = "Failed!";
                message = "This application was not able to receive consent for accessing your Cloud Directory.";
                break;
            default:
                {
                    Dashboard.consentStatus = consentStatus;
                    Dashboard.dataModel.GetSuggestions(Dashboard.completeConsent);
                }
        }
        if (message != null) {
            Control.alert(message, header, function () { Service.NavigateToDashboard(); });
        }
    }
}

Dashboard.completeConsent = function Dashboard$completeConsent(suggestions) {
    if (Dashboard.consentStatus != null && Dashboard.consentStatus.length > 0) {
        var message, header, suggestion;

        switch (Dashboard.consentStatus) {
            case "FBConsentSuccess":
                header = "Success!";
                message = "This application has successfully received consent for accessing your Facebook information.";
                suggestion = SuggestionManager.findSuggestion(suggestions, SuggestionTypes.GetFBConsent);
                break;
            case "GoogleConsentSuccess":
                header = "Success!";
                message = "This application has successfully received consent for managing your Google calendar.";
                suggestion = SuggestionManager.findSuggestion(suggestions, SuggestionTypes.GetGoogleConsent);
                break;
            case "CloudADConsentSuccess":
                header = "Success!";
                message = "This application has successfully received consent for accessing your Cloud Directory.";
                suggestion = SuggestionManager.findSuggestion(suggestions, SuggestionTypes.GetADConsent);
                break;
        }
        Dashboard.consentStatus = null;
        if (suggestion != null && suggestion.ReasonSelected != Reasons.Chosen) {
            Dashboard.dataModel.SelectSuggestion(suggestion, Reasons.Chosen);
            Control.alert(message, header, function () { Service.NavigateToDashboard(); });
        }
    }
}

Dashboard.renderGallery = function Dashboard$renderGallery(categories) {
    Dashboard.activityGallery.render(Dashboard.$right, categories);
}

Dashboard.refreshAfterInstall = function Dashboard$refreshAfterInstall(folderID, itemID) {
    // expand and select newly installed category or activity and refresh 
    var settings = Dashboard.dataModel.UserSettings;
    var selectedFolderID = settings.ViewState.SelectedFolder;
    if (selectedFolderID != null) { settings.ExpandFolder(selectedFolderID, false); }
    settings.ExpandFolder(folderID, true);
    settings.Selection(folderID, itemID);

    if (Dashboard.helpManager.gettingStarted == 1) {
        Dashboard.helpManager.gettingStarted = 2;   // set early due to callback
        Dashboard.dataModel.Refresh(Dashboard.helpManager.getStartedStep2);
    } else {
        Dashboard.dataModel.Refresh();
    }
}