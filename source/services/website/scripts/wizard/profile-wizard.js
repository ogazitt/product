//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// profile-wizard.js

// ---------------------------------------------------------
// ProfileWizard static object - 
// script for the userinfo/wizard.aspx template

var ProfileWizard = function ProfileWizard$() {
    // data members used
    this.dataModel = null;
    this.suggestionManager = null;
}

// ---------------------------------------------------------
// public methods

ProfileWizard.Init = function ProfileWizard$Init(dataModel, consentStatus) {
    this.dataModel = dataModel;

    this.checkBrowser();
    this.checkConsent(consentStatus);

    // wizard region
    this.$element = $('.wizard-region');
    this.$activePanel = this.$element.find('#user_info');

    // suggestions manager for handling connect
    this.suggestionManager = new SuggestionManager(this.dataModel);
    // initialize connect buttons
    this.dataModel.GetSuggestions(function (suggestions) {
        var fbConsent = SuggestionManager.findSuggestion(suggestions, SuggestionTypes.GetFBConsent);
        var $btn = ProfileWizard.$element.find('.connect .fb');
        if (fbConsent != null) {
            $btn.css('display', 'block');
            $btn.attr('title', 'Connect to Facebook').tooltip(Control.ttDelayBottom);
            $btn.click(function () { ProfileWizard.suggestionManager.select(fbConsent, 'wizard'); });
        }
        var gcConsent = SuggestionManager.findSuggestion(suggestions, SuggestionTypes.GetGoogleConsent);
        $btn = ProfileWizard.$element.find('.connect .google');
        if (gcConsent != null) {
            $btn.css('display', 'block');
            $btn.attr('title', 'Connect to Calendar').tooltip(Control.ttDelayBottom);
            $btn.click(function () { ProfileWizard.suggestionManager.select(gcConsent, 'wizard'); });
        }
    });

    // bind events
    this.$element.find('.btn-success').click(function () {
        ProfileWizard.storeUserInfo();
        ProfileWizard.showNextPanel();
    });
    $(window).bind('load', ProfileWizard.resize);
    $(window).bind('resize', ProfileWizard.resize);

    this.showActivePanel();
}

ProfileWizard.showActivePanel = function ProfileWizard$showActivePanel() {
    this.$element.find('.info-pane').removeClass('active');
    this.$activePanel.addClass('active');
}

ProfileWizard.showNextPanel = function ProfileWizard$showNextPanel() {
    this.$activePanel = this.$element.find('.info-pane.active').next('.info-pane');
    if (this.$activePanel.length > 0) { this.showActivePanel(); }
    else { Service.NavigateToDashboard(); }
}

ProfileWizard.storeUserInfo = function ProfileWizard$storeUserInfo() {
    var $activePanel = this.$element.find('.info-pane.active');
    var id = $activePanel.attr('id');

    switch (id) {
        case 'user_info':
            break;
        case 'home_info':
            var $homeCheckbox = $activePanel.find('input[name=homeowner]');
            if ($homeCheckbox.attr('checked') == 'checked') {
                // install home category
                var homeCategory = GalleryCategory.Extend({ Name: UserEntities.Home });
                homeCategory.Install();
            }
            break;
        case 'auto_info':
            var $autoMakeModel = $activePanel.find('input[name=make_model]');
            if ($autoMakeModel.val() != "") {
                // install auto category
                var autoCategory = GalleryCategory.Extend({ Name: UserEntities.Auto });
                autoCategory.Install();
            }
            break;
    }
}

ProfileWizard.resize = function ProfileWizard$resize() {
    if (ProfileWizard.resizing) { return; }

    ProfileWizard.resizing = true;
    $(window).unbind('resize', ProfileWizard.resize);

    var winHeight = $(window).height();
    var headerHeight = $('.navbar-fixed-top').height();
    var footerHeight = $('.navbar-fixed-bottom').height();
    var paneHeight = winHeight - (headerHeight + footerHeight + 30);

    ProfileWizard.$element.find('.well').height(paneHeight);

    $(window).bind('resize', ProfileWizard.resize);
    ProfileWizard.resizing = false;
}

ProfileWizard.checkBrowser = function ProfileWizard$checkBrowser() {
    if (Browser.IsMSIE() && Browser.MSIE_Version() < 9) {
        var header = "We're Sorry!";
        var message = "This application currently requires an HTML5-compatible browser. We encourage you to try using the application with the latest version of Internet Explorer, Chrome, or FireFox.<br/>Thank you";
        Control.alert(message, header);
    }
}

ProfileWizard.checkConsent = function ProfileWizard$checkConsent(consentStatus) {
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
                    ProfileWizard.consentStatus = consentStatus;
                    ProfileWizard.dataModel.GetSuggestions(ProfileWizard.completeConsent);
                }
        }
        if (message != null) {
            Control.alert(message, header, function () { Service.NavigateToProfileWizard(); });
        }
    }
}

ProfileWizard.completeConsent = function ProfileWizard$completeConsent(suggestions) {
    if (ProfileWizard.consentStatus != null && ProfileWizard.consentStatus.length > 0) {
        var message, header, suggestion;

        switch (ProfileWizard.consentStatus) {
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
        ProfileWizard.consentStatus = null;
        if (suggestion != null && suggestion.ReasonSelected != Reasons.Chosen) {
            ProfileWizard.dataModel.SelectSuggestion(suggestion, Reasons.Chosen);
            Control.alert(message, header, function () { Service.NavigateToProfileWizard(); });
        }
    }
}

