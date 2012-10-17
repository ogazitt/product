//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// events.js
// Google Analytic Events 
var _gaq = _gaq || [];       // global Google Analytics Queue (required for async Events to work)
Events = {};

Events.googleAnalyticsScriptUri = '.google-analytics.com/ga.js';
Events.googleAnalyticsAppID = 'UA-35252688-1';

Events.Enable = function Events$Enable() {
    // enable Google Analytics
    var $plugin = $('<script type="text/javascript" async="true"> </script>');
    var src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + Events.googleAnalyticsScriptUri;
    $plugin.attr('src', src);
    $('script').first().parent().prepend($plugin);

    Events.enabled = true;
    Events.Push(['_setAccount', Events.googleAnalyticsAppID]);
    Events.Push(['_trackPageview']);
}
Events.Push = function (event) {
    if (Events.enabled == true) { _gaq.push(event); } 
}
Events.Track = function (category, action, optional) {
    if (Events.enabled == true) {
        if (optional != null) { _gaq.push(['_trackEvent', category, action, optional]); }
        else { _gaq.push(['_trackEvent', category, action]); }
    }
}

Events.Categories = {};

// Category names
Events.Categories.LandingPage = 'LandingPage';
Events.Categories.Wizard = 'Wizard';
Events.Categories.Organizer = 'Organizer';
Events.Categories.Gallery = 'Gallery';
Events.Categories.NextSteps = 'NextSteps';

// Landing page actions
Events.LandingPage = {};
Events.LandingPage.SignUpButton = 'SignUpButton';
Events.LandingPage.SignUpFormPost = 'SignUpFormPost';
Events.LandingPage.SignInButton = 'SignInButton';
Events.LandingPage.SignInFormPost = 'SignInFormPost';
Events.LandingPage.LearnMoreButton = 'LearnMoreButton';
Events.LandingPage.RequestAccessButton = 'RequestAccessButton';
Events.LandingPage.ProductInfoSignUpButton = 'ProductInfoSignUpButton';
Events.LandingPage.LaunchRockGoButton = 'LaunchRockGoButton';

// Mobile page actions
Events.MobilePage = {};
Events.MobilePage.SignInFormPost = 'SignInFormPost';

// Wizard actions
Events.Wizard = {};
Events.Wizard.ProfileNextButton = 'ProfileNextButton';
Events.Wizard.ConnectPrevButton = 'ConnectPrevButton';
Events.Wizard.ConnectFacebookButton = 'ConnectFacebookButton';
Events.Wizard.ConnectGoogleButton = 'ConnectGoogleButton';
Events.Wizard.ConnectDoneButton = 'ConnectDoneButton';

// Organizer actions
Events.Organizer = {};
Events.Organizer.Loaded = 'OrganizerLoaded';
Events.Organizer.NextSteps = 'NextSteps';
Events.Organizer.AddCategory = 'AddCategory';
Events.Organizer.AddActivity = 'AddActivity';
Events.Organizer.DeleteCategory = 'DeleteCategory';
Events.Organizer.DeleteActivity = 'DeleteActivity';
Events.Organizer.AddStep = 'AddStep';
Events.Organizer.DeleteStep = 'DeleteStep';
Events.Organizer.EditStep = 'EditStep';
Events.Organizer.CompleteButton = 'CompleteButton';
Events.Organizer.RepeatButton = 'RepeatButton';
Events.Organizer.FindButton = 'FindButton';
Events.Organizer.CallButton = 'CallButton';
Events.Organizer.TextButton = 'TextButton';
Events.Organizer.EmailButton = 'EmailButton';
Events.Organizer.AskFriendsButton = 'AskFriendsButton';
Events.Organizer.ScheduleButton = 'ScheduleButton';
Events.Organizer.MapButton = 'MapButton';
Events.Organizer.SignOutButton = 'SignOutButton';
Events.Organizer.RefreshButton = 'RefreshButton';
Events.Organizer.HelpButton = 'HelpButton';
Events.Organizer.UserSettingsButton = 'UserSettingsButton';

// Gallery Actions
Events.Gallery = {};
Events.Gallery.AddGalleryActivity = 'AddGalleryActivity';

// Next Steps actions
// note that many action name strings are intentionally identical to the organizer's.
// this allows queries in GA across both Organizer and NextSteps Categories for a kind of action (e.g. Complete);
// the category can still be used to differentiate between the two events.
Events.NextSteps = {};
Events.NextSteps.Loaded = 'NextStepsLoaded';
Events.NextSteps.CompleteButton = 'CompleteButton';
Events.NextSteps.FindButton = 'FindButton';
Events.NextSteps.CallButton = 'CallButton';
Events.NextSteps.TextButton = 'TextButton';
Events.NextSteps.EmailButton = 'EmailButton';
Events.NextSteps.AskFriendsButton = 'AskFriendsButton';
Events.NextSteps.ScheduleButton = 'ScheduleButton';
Events.NextSteps.MapButton = 'MapButton';
Events.NextSteps.SignOutButton = 'SignOutButton';
Events.NextSteps.RefreshButton = 'RefreshButton';
