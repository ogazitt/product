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
    this.dataModel.GetGalleryCategories();

    // wizard region
    this.$element = $('.wizard-region');

    this.firstPanel = 'user_info';
    this.lastPanel = 'connect_info';
    var activePanel = this.dataModel.UserSettings.ActiveWizardPanel();
    activePanel = (activePanel == null) ? this.firstPanel : activePanel;
    this.$activePanel = this.$element.find('#' + activePanel);
    if (this.$activePanel.length == 0) {
        this.$activePanel = this.$element.find('#' + this.firstPanel);
    }

    // suggestions manager for handling connect
    this.suggestionManager = new SuggestionManager(this.dataModel);

    // bind input elements to UserProfile item fields
    this.bindFields();

    // bind button events
    this.$element.find('.btn-success').click(function () {
        ProfileWizard.showNextPanel();
    });
    this.$element.find('.btn-primary').click(function () {
        ProfileWizard.showPrevPanel();
    });

    // bind resize events
    $(window).bind('load', ProfileWizard.resize);
    $(window).bind('resize', ProfileWizard.resize);

    this.showActivePanel();
}

ProfileWizard.initConnect = function ProfileWizard$initConnect() {
    this.dataModel.GetSuggestions(function (suggestions) {
        var fbConsent = SuggestionManager.findSuggestion(suggestions, SuggestionTypes.GetFBConsent);
        var $btn = ProfileWizard.$element.find('a.fb');
        Control.tooltip($btn, 'Connect to Facebook');
        if (fbConsent == null) {
            ProfileWizard.$element.find('small.fb').addClass('connected').html('Connected');
            fbConsent = { SuggestionType: SuggestionTypes.GetFBConsent };
        }
        $btn.click(function () { ProfileWizard.suggestionManager.select(fbConsent, 'wizard'); });

        var gcConsent = SuggestionManager.findSuggestion(suggestions, SuggestionTypes.GetGoogleConsent);
        $btn = ProfileWizard.$element.find('a.google');
        Control.tooltip($btn, 'Connect to Calendar');
        if (gcConsent == null) {
            ProfileWizard.$element.find('small.google').addClass('connected').html('Connected');
            gcConsent = { SuggestionType: SuggestionTypes.GetGoogleConsent };
        }
        $btn.click(function () { ProfileWizard.suggestionManager.select(gcConsent, 'wizard'); });
    });
}

ProfileWizard.showActivePanel = function ProfileWizard$showActivePanel() {
    this.$element.find('.info-pane').removeClass('active');
    this.$activePanel.addClass('active');
    var nextBtn = this.$element.find('.btn-success');
    if (this.$activePanel.attr('id') == this.lastPanel) { 
        this.initConnect();
        nextBtn.html('Done'); 
    } else { nextBtn.html('Next'); }
    var prevBtn = this.$element.find('.btn-primary');
    if (this.$activePanel.attr('id') == this.firstPanel) { prevBtn.hide(); }
    else { prevBtn.show(); }
}

ProfileWizard.showNextPanel = function ProfileWizard$showNextPanel() {
    this.$activePanel = this.$element.find('.info-pane.active').next('.info-pane');
    if (this.$activePanel.length > 0) {
        this.showActivePanel();
        this.dataModel.UserSettings.ActiveWizardPanel(this.$activePanel.attr('id'));
        this.dataModel.UserSettings.Save();
    } else {
        this.dataModel.Close();
        //this.installActivities();         // do not install activities for now
        Service.NavigateToDashboard();
    }
}

ProfileWizard.showPrevPanel = function ProfileWizard$showPrevPanel() {
    this.$activePanel = this.$element.find('.info-pane.active').prev('.info-pane');
    if (this.$activePanel.length > 0) {
        this.showActivePanel();
        this.dataModel.UserSettings.ActiveWizardPanel(this.$activePanel.attr('id'));
        this.dataModel.UserSettings.Save();
    }
}


ProfileWizard.bindFields = function ProfileWizard$bindFields() {
    var item = this.dataModel.UserSettings.GetUserProfileItem();
    for (var fn in UserProfileFields) {
        var field = UserProfileFields[fn];
        var fieldClass = '.fn-' + field.Name.toLowerCase();
        var $field = this.$element.find(fieldClass);
        if ($field.length > 0) {
            switch (field.DisplayType) {
                case DisplayTypes.Hidden:
                    break;
                case DisplayTypes.Gender:
                    this.renderGender($field, item, field);
                    break;
                case DisplayTypes.Checkbox:
                    Control.Checkbox.render($field, item, field);
                    break;
                case DisplayTypes.DatePicker:
                    Control.DateTime.renderDatePicker($field, item, field);
                    break;
                case DisplayTypes.Address:
                    Control.Text.renderInputAddress($field, item, field, ProfileWizard.updateAddress);
                    break;
                default:
                    Control.Text.renderInput($field, item, field);
                    break;
            }

            if (field.Name == UserProfileFields.Birthday.Name) {
                var bday = item.GetFieldValue(UserProfileFields.Birthday);
                if (bday == null || bday.length == 0) {
                    $field.val('mm/dd/yyyy');
                }
            }
        }
    }
}

ProfileWizard.renderGender = function ProfileWizard$renderGender($field, item, field) {
    var val = item.GetFieldValue(field);
    if (val != null) { $field.parent().find('input[value="' + val + '"]').attr('checked', true); }
    $field.data('item', item);
    $field.data('field', field);
    $field.change(function() { 
        var item = $(this).data('item');
        var field = $(this).data('field');
        var copy = item.Copy();
        copy.SetFieldValue(field, $(this).val());
        item.Update(copy);
    });
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

ProfileWizard.installActivities = function ProfileWizard$installActivities() {
    // TODO: persist and check flag if already installed
    var personal = ItemMap.itemByName(this.dataModel.GalleryCategories, UserEntities.Personal);
    if (personal != null) {
        var activities = personal.Activities;
        var activity = ItemMap.itemByName(activities, 'Haircut');
        if (activity != null) { activity.Install(); }
        activity = ItemMap.itemByName(activities, 'Workout');
        if (activity != null) { activity.Install(); }
        activity = ItemMap.itemByName(activities, 'Dental cleaning');
        if (activity != null) { activity.Install(); }
        activity = ItemMap.itemByName(activities, 'Annual health checkup');
        if (activity != null) { activity.Install(); }
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
    Birthday:   { Name: "Birthday", DisplayName: "Birthday", FieldType: FieldTypes.String, DisplayType: DisplayTypes.Text },
    Mobile:     { Name: "Mobile", DisplayName: "Mobile", FieldType: FieldTypes.Phone, DisplayType: DisplayTypes.Phone },
    Address:    { Name: "Address", DisplayName: "Address", FieldType: FieldTypes.Address, DisplayType: DisplayTypes.Address },
    GeoLocation:{ Name: "GeoLocation", DisplayName: "LatLong", FieldType: FieldTypes.String, DisplayType: DisplayTypes.Hidden },
};