//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// events.js

// Events for the producct
Events = {};
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
