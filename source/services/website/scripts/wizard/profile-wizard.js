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
    var activePanel = this.dataModel.UserSettings.ActiveWizardPanel();
    activePanel = (activePanel == null || activePanel == 'last_info') ? 'user_info' : activePanel;
    this.$activePanel = this.$element.find('#' + activePanel);

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

    // bind input elements to UserProfile item fields
    this.bindFields();

    // bind events
    this.$element.find('.btn-success').click(function () {
        ProfileWizard.showNextPanel();
    });
    $(window).bind('load', ProfileWizard.resize);
    $(window).bind('resize', ProfileWizard.resize);

    this.showActivePanel();
}

ProfileWizard.showActivePanel = function ProfileWizard$showActivePanel() {
    this.$element.find('.info-pane').removeClass('active');
    this.$activePanel.addClass('active');
    //this.getUserInfo();
}

ProfileWizard.showNextPanel = function ProfileWizard$showNextPanel() {
    //this.installActivities(this.$activePanel);
    this.$activePanel = this.$element.find('.info-pane.active').next('.info-pane');
    if (this.$activePanel.length > 0) {
        this.showActivePanel();
        this.dataModel.UserSettings.ActiveWizardPanel(this.$activePanel.attr('id'));
        this.dataModel.UserSettings.Save();
    } else {
        Service.NavigateToDashboard();
    }
}

ProfileWizard.bindFields = function ProfileWizard$bindFields() {
    var item = this.dataModel.UserSettings.GetUserProfileItem();
    for (var fn in UserProfileFields) {
        var field = UserProfileFields[fn];
        var fieldClass = '.fn-' + field.Name.toLowerCase();
        var $field = this.$element.find(fieldClass);
        if ($field.length == 1) {
            switch (field.DisplayType) {
                case DisplayTypes.Hidden:
                    break;
                case DisplayTypes.Gender:
                    break;
                case DisplayTypes.Checkbox:
                    Control.Checkbox.render(this.$element.find(fieldClass), item, field);
                    break;
                case DisplayTypes.DatePicker:
                    Control.DateTime.renderDatePicker(this.$element.find(fieldClass), item, field);
                    break;
                case DisplayTypes.Address:
                    Control.Text.renderInputAddress(this.$element.find(fieldClass), item, field, ProfileWizard.updateAddress);
                    break;
                default:
                    Control.Text.renderInput(this.$element.find(fieldClass), item, field);
                    break;
            }
        }
    }
}

ProfileWizard.updateAddress = function ProfileWizard$updateAddress($input) {
    var item = $input.data('item');
    var field = $input.data('field');
    var value = $input.val();
    var currentValue = item.GetFieldValue(field);
    var updatedItem = item.Copy();
    var place = $input.data('place');
    if (place != null && place.geometry != null) {
        updatedItem.SetFieldValue(UserProfileFields.GeoLocation, place.geometry.location.toUrlValue());
        updatedItem.SetFieldValue(UserProfileFields.Address, place.formatted_address);
    } else if (value != currentValue) {
        updatedItem.SetFieldValue(field, value);
    }
    item.Update(updatedItem);
}

ProfileWizard.installActivities = function ProfileWizard$installActivities($panel) {
    var panel = $panel.attr('id');
    if (panel == 'home_info') {
        if ($panel.find('.fn-homeowner').attr('checked') == 'checked') {
            var category = GalleryCategory.Extend({ Name: UserEntities.Home });
            category.Install();
        }
    } else if (panel == 'auto_info') {
        var automake = $panel.find('.fn-automake').val();
        if (automake != null && automake.length > 0) {
            var category = GalleryCategory.Extend({ Name: UserEntities.Auto });
            category.Install();
        }
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

// ---------------------------------------------------------
// UserProfile constants
var UserProfileFields = {
    FirstName:  { Name: "FirstName",   DisplayName: "First Name",  FieldType: FieldTypes.String,   DisplayType: DisplayTypes.Text },
    LastName:   { Name: "LastName", DisplayName: "Last Name", FieldType: FieldTypes.String, DisplayType: DisplayTypes.Text },
    Gender:     { Name: "Gender", DisplayName: "Gender", FieldType: FieldTypes.String, DisplayType: DisplayTypes.Gender },
    Birthday:   { Name: "Birthday", DisplayName: "Birthday", FieldType: FieldTypes.DateTime, DisplayType: DisplayTypes.DatePicker },
    Mobile:     { Name: "Mobile", DisplayName: "Mobile", FieldType: FieldTypes.Phone, DisplayType: DisplayTypes.Phone },
    Address:    { Name: "Address", DisplayName: "Address", FieldType: FieldTypes.Address, DisplayType: DisplayTypes.Address },
    GeoLocation:{ Name: "GeoLocation", DisplayName: "LatLong", FieldType: FieldTypes.String, DisplayType: DisplayTypes.Hidden },
    HomeOwner:  { Name: "HomeOwner", DisplayName: "Home Owner", FieldType: FieldTypes.Boolean, DisplayType: DisplayTypes.Checkbox },
    Yardwork:   { Name: "Yardwork", DisplayName: "Yardwork", FieldType: FieldTypes.Boolean, DisplayType: DisplayTypes.Checkbox }
};