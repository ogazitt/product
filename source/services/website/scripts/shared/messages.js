//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// messages.js

// Messages for the producct
Messages = {};

// Complete handler messages
Messages.CompleteHandler = {};
Messages.CompleteHandler.FindText = 'What business or service name did you find?';

// Map button dialog messages
Messages.MapDialog = {};
Messages.MapDialog.LocationText = 'What is this location\'s name or address?';
Messages.MapDialog.ContactText = 'What is this contact\'s name or address?';
Messages.MapDialog.ActivityOrStepText = 'What is the name of the business or location?';

// Phone button messages
Messages.CallButton = {};
Messages.CallButton.ActionNotSupported = 'This action only works on a mobile device';

// Phone button messages
Messages.TextButton = {};
Messages.TextButton.ActionNotSupported = 'This action only works on a mobile device';

// Schedule button dialog messages
Messages.ScheduleDialog = {};
Messages.ScheduleDialog.HeaderText = 'When should appointment be scheduled for?';
Messages.ScheduleDialog.AlertHeaderText = 'Schedule appointment';
Messages.ScheduleDialog.NoDateError = 'Please provide a date for the appointment';
Messages.ScheduleDialog.InvalidDateError = 'The date you provided is in the past';
Messages.ScheduleDialog.ServerError = 'Server was unable to add appointment';
Messages.ScheduleDialog.AddingText = 'Adding appointment to calendar';

// Ask Facebook Friends button messages
Messages.AskFriendsDialog = {};
Messages.AskFriendsDialog.HeaderText = 'Ask Facebook friends';
Messages.AskFriendsDialog.QuestionText = 'Please provide a question to ask on Facebook';
Messages.AskFriendsDialog.ServerError = 'Server was unable to post on Facebook';
Messages.AskFriendsDialog.PostingText = 'Posting question to Facebook';

// Information Dialog for Contact or Location messages
Messages.InfoDialogForContactOrLocation = {};
Messages.InfoDialogForContactOrLocation.HeaderText = function (entityName) { return 'Please enter ' + entityName + ' information'; }
Messages.InfoDialogForContactOrLocation.AlertHeaderText = 'Need more information'; 
Messages.InfoDialogForContactOrLocation.NoDataError = function (labelName, entityName) { return 'Please provide a ' + labelName + ' for the ' + entityName; }

// Information Dialog messages
Messages.InfoDialog = {};
Messages.InfoDialog.HeaderText = 'Please choose a business or a contact';
Messages.InfoDialog.LocationText = 'Choose a business or location name';
Messages.InfoDialog.ContactText = 'Or, choose a contact';
Messages.InfoDialog.AlertHeaderText = 'Need more information';
Messages.InfoDialog.NoDataError = function (labelName, entityName) { return 'Please provide a ' + labelName + ' for the ' + entityName; }
Messages.InfoDialog.NoContactOrLocationError = 'Please provide a business / location name or a contact';
