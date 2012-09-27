//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// entity-objects.js
//
// Objects for strongly-typed entities:
//      ActionType, Appointment, GalleryCategory, 
//      LinkArray, UserSettings, 


// ---------------------------------------------------------
// ActionType object - provides prototype functions for ActionType

function ActionType() { };
ActionType.Extend = function ActionType$Extend(actionType) { return $.extend(new ActionType(), actionType); }  // extend with ActionType prototypes

// ActionType public functions
ActionType.prototype.Copy = function () { var copy = $.extend(new ActionType(), this); return copy; };
ActionType.prototype.GetSteps = function (sort, status) {
    if (status === undefined) status = StatusTypes.Active;
    var steps = [];
    var index = 0;
    for (var i in DataModel.Folders) {
        var folder = DataModel.Folders[i];
        for (var j in folder.Items) {
            var item = folder.Items[j];
            if (item.IsStep()) {
                if (this.Name == ActionTypes.All || this.Name == item.GetActionType().Name) {
                    if (item.Status == status) steps[index++] = item;
                }
            }
        }
    }
    steps.sort(function (a, b) {
        // TODO: use resilient parse function for downlevel browsers (iPhone)
        // TODO: isolate date conversions in Item.GetFieldValue and Item.SetFieldValue
        var dueA = a.GetFieldValue(FieldNames.DueDate);
        var dueB = b.GetFieldValue(FieldNames.DueDate);
        if (dueA == dueB) return 0;
        if (dueA == null) return 1;
        if (dueB == null) return -1;
        var dueDateA = new Date(dueA);
        var dueDateB = new Date(dueB);
        if (dueDateA == dueDateB) return 0;
        if (dueDateA > dueDateB) return 1;
        return -1;
    });
    return steps;
}

// ---------------------------------------------------------
// Appointment object - provides prototype functions for Appointment

function Appointment() { };
Appointment.Extend = function Appointment$Extend(appt) { return $.extend(new Appointment(), appt); }  // extend with Appointment prototypes

// Appointment public functions
Appointment.prototype.Copy = function () { var copy = $.extend(new Appointment(), this); return copy; };


// ---------------------------------------------------------
// GalleryCategory object - provides prototype functions for GalleryCategory

function GalleryCategory() { };
GalleryCategory.Extend = function GalleryCategory$Extend(category) { return $.extend(new GalleryCategory(), category); }   // extend with GalleryCategory prototypes

// GalleryCategory public functions
// do not deep copy, remove Activities collection, copy is for updating GalleryCategory entity only
GalleryCategory.prototype.Copy = function () { var copy = $.extend(new GalleryCategory(), this); copy.Activities = {}; copy.ItemsMap = {}; return copy; };
GalleryCategory.prototype.IsSelected = function () { return DataModel.UserSettings.IsCategorySelected(this.ID); };
GalleryCategory.prototype.IsExpanded = function () { return DataModel.UserSettings.IsCategoryExpanded(this.ID); };
GalleryCategory.prototype.Expand = function (expand) { DataModel.UserSettings.ExpandCategory(this.ID, expand); };
GalleryCategory.prototype.GetActivities = function () { return this.Activities; };
GalleryCategory.prototype.GetActivity = function (itemID) { return this.Activities[itemID]; }
GalleryCategory.prototype.IsGalleryCategory = function () { return true; }
GalleryCategory.prototype.IsGalleryActivity = function () { return false; }
GalleryCategory.prototype.Install = function () {
    Service.InvokeController('Actions', 'InstallCategory',
        { 'category': this },
        function (responseState) {
            var result = responseState.result;
            if (result.StatusCode != '200') {
                Control.alert('Server was unable to install the category', 'Install Category');
            }
            else {
                // TODO: should not be referencing Dashboard from Entity, instead fire event that Dashboard handles
                if (typeof(Dashboard) !== "undefined" && Dashboard.dataModel != null) { Dashboard.dataModel.Refresh(); }
            }
        }
    );
}

// ---------------------------------------------------------
// GalleryActivity object - provides prototype functions for GalleryActivity

function GalleryActivity() { };
GalleryActivity.Extend = function GalleryActivity$Extend(activity) { return $.extend(new GalleryActivity(), activity); }   // extend with GalleryCategory prototypes

// GalleryActivity public functions
GalleryActivity.prototype.Copy = function () { var copy = $.extend(new GalleryActivity(), this); copy.ItemsMap = {}; return copy; };
GalleryActivity.prototype.IsGalleryCategory = function () { return false; }
GalleryActivity.prototype.IsGalleryActivity = function () { return true; }
GalleryActivity.prototype.IsSelected = function () { return DataModel.UserSettings.IsActivitySelected(this.ID); };
GalleryActivity.prototype.Install = function () {
    Service.InvokeController('Actions', 'InstallActivity',
        { 'activity': this, 'category': null },
        function (responseState) {
            var result = responseState.result;
            if (result.StatusCode != '200') {
                Control.alert('Server was unable to install the category', 'Install Activity');
            }
            else {
                // TODO: should not be referencing Dashboard from Entity, instead fire event that Dashboard handles
                if (typeof (Dashboard) !== "undefined" && Dashboard.dataModel != null) { Dashboard.dataModel.Refresh(); }
            }
        }
    );
}


// ---------------------------------------------------------
// LinkArray object - array of Link objects 
// [{Name:"name", Url:"link"}]
function LinkArray(json) {
    this.links = [];
    if (json != null && json.length > 0) {
        this.links = $.parseJSON(json);
    }
}

LinkArray.prototype.Links = function () { return this.links; }
LinkArray.prototype.ToJson = function () { return JSON.stringify(this.links); }
LinkArray.prototype.Remove = function (index) { this.links.splice(index, 1); }
LinkArray.prototype.Add = function (link, name) {
    if (name != null) {
        // both name and link provided explicitly 
        this.links.push({ Name: name, Url: link });
        return this.links;
    }
    // check for name,link syntax
    var split = link.split(',');
    if (split.length > 1) {
        name = $.trim(split[0]);
        link = $.trim(split[1]);
        this.links.push({ Name: name, Url: link });
    } else {
        this.links.push({ Url: link });
    }
    return this.links;
}
LinkArray.prototype.ToText = function () {
    var text = '';
    for (var i in this.links) {
        var link = this.links[i];
        if (link.hasOwnProperty('Name')) {
            if (link.Name != null && link.Name.length > 0 && link.Name != link.Url) {
                text += link.Name + ', ';
            }
        }
        text += link.Url + '\r\n';
    }
    return text;
}
LinkArray.prototype.Parse = function (text) {
    var lines = text.split(/\r\n|\r|\n/g);
    for (var i in lines) {
        var parts = lines[i].split(',');
        if (parts.length == 1 && parts[0].length > 0) { this.links.push({ Url: parts[0] }); }
        if (parts.length == 2) { this.links.push({ Name: parts[0], Url: parts[1] }); }
    }
}

// ---------------------------------------------------------
// Recurrence object  
// { Frequency: "Daily", Interval: 1, ByDay: [], ByMonthDay: [], ByYearDay: [], ByMonth: [] }
//
function Recurrence() { 
    this.Frequency = Recurrence.Frequencys.Daily;
    this.Interval = 1;
    this.ByDay = [];            // integers for days of week, 0-6
    this.ByMonthDay = [];       // integers for days of month, 1-31
    this.ByYearDay = [];        // integers for day of year, 1-31
    this.ByMonth = [];          // integers for month, 1-12
};
Recurrence.Extend = function Recurrence$Extend(rrule) {
    // input as either json string or json object
    if (typeof (rrule) == 'string') {
        rrule = $.parseJSON(rrule);
    }
    if (rrule != null) {
        // TEMPORARY: convert previously stored strings to proper types
        if (typeof (rrule.Interval) == 'string') { rrule.Interval = parseInt(rrule.Interval); }
        rrule.ByDay = (typeof(rrule.ByDay) == 'string') ? [] : rrule.ByDay;
        rrule.ByMonthDay = (rrule.ByMonthDay == "") ? [] : rrule.ByMonthDay;
        rrule.ByYearDay = (rrule.ByYearDay == "") ? [] : rrule.ByYearDay;
        rrule.ByMonth = (rrule.ByMonth == "") ? [] : rrule.ByMonth;
    }
    return $.extend(new Recurrence(), rrule);
}
Recurrence.Frequencys = { Daily: "Daily", Weekly: "Weekly", Monthly: "Monthly", Yearly: "Yearly" };
Recurrence.FrequencyLabels = { Daily: "days", Weekly: "weeks", Monthly: "months", Yearly: "years" };
Recurrence.WeekdayLabels = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
Recurrence.MonthLabels = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

Recurrence.prototype.ToJson = function () { return JSON.stringify(this); }
Recurrence.prototype.IsEnabled = function () { return (this.On != null); }
Recurrence.prototype.Enable = function () { this.On = 1; }
Recurrence.prototype.Disable = function () { delete this['On']; }
Recurrence.prototype.IsDaily = function () { return this.Frequency == Recurrence.Frequencys.Daily; };
Recurrence.prototype.IsWeekly = function () { return this.Frequency == Recurrence.Frequencys.Weekly; };
Recurrence.prototype.IsMonthly = function () { return this.Frequency == Recurrence.Frequencys.Monthly; };
Recurrence.prototype.IsYearly = function () { return this.Frequency == Recurrence.Frequencys.Yearly; };

Recurrence.prototype.HasWeekdays = function () { return this.ByDay.length > 0; };
Recurrence.prototype.HasWeekday = function (day) { return this.ByDay.indexOf(day) != -1; };
Recurrence.prototype.AddWeekday = function (day) { this.ByDay.push(day); };
Recurrence.prototype.RemoveWeekday = function (day) { var i = this.ByDay.indexOf(d); if (i >= 0) { this.ByDay.splice(i, 1) } };

Recurrence.prototype.NoMonthDays = function () { this.ByMonthDay.length = 0; };
Recurrence.prototype.FirstMonthDay = function () { return (this.ByMonthDay.length == 0) ? 0 : this.ByMonthDay[0]; };
Recurrence.prototype.HasMonthDay = function (d) { return (this.ByMonthDay.indexOf(d) >= 0); };
Recurrence.prototype.AddMonthDay = function (d) { this.ByMonthDay.push(d); };
Recurrence.prototype.RemoveMonthDay = function (d) { var i = this.ByMonthDay.indexOf(d); if (i >= 0) { this.ByMonthDay.splice(i, 1) } };

Recurrence.prototype.NoYearDays = function () { this.ByYearDay.length = 0; };
Recurrence.prototype.FirstYearDay = function () { return (this.ByYearDay.length == 0) ? 0 : this.ByYearDay[0]; };
Recurrence.prototype.HasYearDay = function (d) { return (this.ByYearDay.indexOf(d) >= 0); };
Recurrence.prototype.AddYearDay = function (d) { this.ByYearDay.push(d); };
Recurrence.prototype.RemoveYearDay = function (d) { var i = this.ByYearDay.indexOf(d); if (i >= 0) { this.ByYearDay.splice(i, 1) } };

Recurrence.prototype.NoMonths = function () { this.ByMonth.length = 0; };
Recurrence.prototype.FirstMonth = function () { return (this.ByMonth.length == 0) ? 0 : this.ByMonth[0]; };
Recurrence.prototype.HasMonth = function (d) { return (this.ByMonth.indexOf(d) >= 0); };
Recurrence.prototype.AddMonth = function (d) { this.ByMonth.push(d); };
Recurrence.prototype.RemoveMonth = function (d) { var i = this.ByMonth.indexOf(d); if (i >= 0) { this.ByMonth.splice(i, 1) } };

Recurrence.prototype.Summary = function (text) {
    var summary = (text == null) ? "Do not repeat" : text;
    if (this.IsEnabled()) {
        // generate summary statement
        var txtFreq = Recurrence.FrequencyLabels[this.Frequency];
        if (this.Interval == 1) { txtFreq = txtFreq.substr(0, txtFreq.length - 1); }
        var txtIntv = this.Interval.toString();
        var txtEnd = '</strong> after completing current activity ';

        if (this.IsWeekly()) {
            var days = this.ByDay;
            if (days.length > 0) {
                txtIntv = (this.Interval == 1) ? 'every' : 'every ' + txtIntv;
                if (days.length == 7) {
                    txtEnd = 'each day';
                } else {
                    txtEnd = '';
                    $.each(days, function (i, day) {
                        txtEnd += (i == 0) ? ' on ' : ((i == days.length - 1) ? ' and ' : ', ');
                        txtEnd += Recurrence.WeekdayLabels[day];
                    });
                }
                txtEnd += '</strong>';
            }
        }
        if (this.IsMonthly()) {
            if (this.FirstMonthDay() > 0) {
                txtIntv = (this.Interval == 1) ? 'every' : 'every ' + txtIntv;
                txtEnd = 'on the ' + this.AddSuffix(this.FirstMonthDay()) + '</strong> of the month';
            }
        }
        if (this.IsYearly()) {
            if (this.FirstMonth() > 0) {
                txtIntv = (this.Interval == 1) ? 'every' : 'every ' + txtIntv;
                if (this.FirstYearDay() == 0) {
                    txtEnd = 'in ' + Recurrence.MonthLabels[this.FirstMonth() - 1];
                } else {
                    txtEnd = 'on ' + Recurrence.MonthLabels[this.FirstMonth() - 1];
                    txtEnd += ' ' + this.AddSuffix(this.FirstYearDay());
                }
            }
            txtEnd += '</strong>';
        }
        var summary = "Repeat <strong>" + txtIntv + ' ' + txtFreq + ' ' + txtEnd;
    }
    return summary;
};
Recurrence.prototype.AddSuffix = function (n) {
    var m = n % 10;
    var suffix;
    switch (m) {
        case 1: suffix = 'st'; break;
        case 2: suffix = 'nd'; break;
        case 3: suffix = 'rd'; break;
        default: suffix = 'th'; break;
    }
    suffix = (n > 10 && n < 14) ? 'th' : suffix;
    return n + suffix;
}
Recurrence.prototype.NextDueDate = function (lastDate) {
    if (typeof (lastDate) == 'string') {
        // TODO: use resilient parse function for downlevel browsers (iPhone)
        lastDate = new Date(lastDate);
    }
    if (this.IsDaily()) {
        lastDate.add(this.Interval).days();
    }
    if (this.IsWeekly()) {
        lastDate.add(this.Interval).weeks();
        if (this.ByDay.length > 0) {
            // TODO: support multiple weekdays
            if (this.ByDay[0] != lastDate.getDay()) {
                lastDate.moveToDayOfWeek(this.ByDay[0]);
            }
        }
    }
    if (this.IsMonthly()) {
        lastDate.add(this.Interval).months();
        if (this.ByMonthDay.length > 0) {
            // TODO: support multiple month dates
            var daysInMonth = Date.getDaysInMonth(lastDate.getFullYear(), lastDate.getMonth());
            var date = (this.ByMonthDay[0] > daysInMonth) ? daysInMonth : this.ByMonthDay[0];
            lastDate.setDate(date);
        }
    }
    if (this.IsYearly()) {
        lastDate.add(this.Interval).years();
        if (this.ByMonth.length > 0) {
            // TODO: support multiple months and year dates
            lastDate.setMonth(this.ByMonth[0] - 1);
            if (this.ByYearDay.length > 0) {
                var daysInMonth = Date.getDaysInMonth(lastDate.getFullYear(), lastDate.getMonth());
                var date = (this.ByYearDay[0] > daysInMonth) ? daysInMonth : this.ByYearDay[0];
                lastDate.setDate(date);
            } else {
                lastDate.setDate(1);
            }
        }
    }

    return lastDate.format('shortDate');
}

// ---------------------------------------------------------
// UserSettings object - provides prototype functions

function UserSettings(clientFolder, webClientFolder) {
    this.clientFolder = clientFolder;
    this.webClientFolder = webClientFolder;

    this.init(UserSettings.viewStateName, UserSettings.viewStateKey);
    this.init(UserSettings.preferencesName, UserSettings.preferencesKey);
}

UserSettings.defaultListsKey = 'DefaultLists';
UserSettings.userProfileKey = 'UserProfile';
UserSettings.viewStateName = 'ViewState';
UserSettings.viewStateKey = 'WebViewState';
UserSettings.preferencesName = 'Preferences';
UserSettings.preferencesKey = 'WebPreferences';

UserSettings.prototype.GetFolder = function (folderID) {
    if (this.clientFolder.ID == folderID) { return this.clientFolder; }
    if (this.webClientFolder.ID == folderID) { return this.webClientFolder; }
    return null;
}

UserSettings.prototype.GetUserProfileItem = function () {
    var item = this.clientFolder.GetItemByName(UserSettings.userProfileKey);
    if (item == null) {
        this.clientFolder.InsertItem(Item.Extend({ Name: UserSettings.userProfileKey, ItemTypeID: ItemTypes.NameValue }), null, null, null);
    }
    return this.clientFolder.GetItemByName(UserSettings.userProfileKey);
}

UserSettings.prototype.GetDefaultList = function (itemType) {
    var defaultLists = this.clientFolder.GetItemByName(UserSettings.defaultListsKey);
    if (defaultLists != null) {
        var defaultList = this.clientFolder.GetItemByValue(itemType, defaultLists.ID);
        if (defaultList != null) {
            var list = defaultList.GetFieldValue(FieldNames.EntityRef);
            if (typeof (list) == 'object') { return list; }
        }
    }
    // find first folder for itemType
    var folder;
    for (id in DataModel.Folders) {
        folder = DataModel.Folders[id];
        if (folder.ItemTypeID == itemType) {
            return folder;
        }
    }
    // default to last folder
    return folder;
}

UserSettings.prototype.Selection = function (folderID, itemID) {
    this.ViewState.SelectedFolder = folderID;
    this.ViewState.SelectedItem = itemID;
}

UserSettings.prototype.IsFolderSelected = function (folderID) {
    return (this.ViewState.SelectedFolder == folderID);
}

UserSettings.prototype.IsCategorySelected = function (categoryID) {
    return (this.ViewState.SelectedCategory == categoryID);
}

UserSettings.prototype.IsActivitySelected = function (activityID) {
    return (this.ViewState.SelectedActivity == activityID);
}

UserSettings.prototype.IsItemSelected = function (itemID, includingChildren) {
    if (includingChildren == true) {
        var item = DataModel.FindItem(this.ViewState.SelectedItem);
        if (item != null && item.ParentID == itemID) { return true; }
    }
    return (this.ViewState.SelectedItem == itemID);
}

UserSettings.prototype.ExpandFolder = function (folderID, expand) {
    if (this.ViewState.ExpandedFolders == null) { this.ViewState.ExpandedFolders = {}; }
    if (expand == true) { this.ViewState.ExpandedFolders[folderID] = true; }
    else { delete this.ViewState.ExpandedFolders[folderID]; }
}

UserSettings.prototype.ExpandCategory = function (categoryID, expand) {
    if (this.ViewState.ExpandedCategories == null) { this.ViewState.ExpandedCategories = {}; }
    if (expand == true) { this.ViewState.ExpandedCategories[categoryID] = true; }
    else { delete this.ViewState.ExpandedCategories[categoryID]; }
}

UserSettings.prototype.IsFolderExpanded = function (folderID) {
    return (this.ViewState.ExpandedFolders != null && this.ViewState.ExpandedFolders[folderID] == true);
}

UserSettings.prototype.IsCategoryExpanded = function (categoryID) {
    return (this.ViewState.ExpandedCategories != null && this.ViewState.ExpandedCategories[categoryID] == true);
}

UserSettings.prototype.ActiveWizardPanel = function (panel) {
    // set or get active panel for profile wizard
    if (panel != null) { this.ViewState.ActiveWizardPanel = panel; }
    return this.ViewState.ActiveWizardPanel;
}

UserSettings.prototype.Save = function () {
    // remove deleted folders from expanded folders list
    var expanded = {};
    for (var id in DataModel.Folders) {
        if (DataModel.Folders[id].IsExpanded()) { expanded[id] = true; }
    }
    this.ViewState.ExpandedFolders = expanded;
    this.update(UserSettings.viewStateName, UserSettings.viewStateKey);
}

UserSettings.prototype.UpdateTheme = function (theme) {
    if (this.Preferences.Theme != theme) {
        this.Preferences.Theme = theme;
        this.update(UserSettings.preferencesName, UserSettings.preferencesKey);
        Service.ChangeTheme(theme);
    }
}

UserSettings.prototype.init = function (name, itemKey) {
    var itemName = 'item' + name;
    if (this.webClientFolder != null) {
        this[itemName] = this.webClientFolder.GetItemByName(itemKey, null);
    }
    if (this[itemName] == null) {
        this[name] = {};
        if (this.webClientFolder != null) {
            this.webClientFolder.InsertItem(Item.Extend({ Name: itemKey, ItemTypeID: ItemTypes.NameValue }), null, null, null);
        }
    } else {
        var value = this[itemName].GetFieldValue(FieldNames.Value);
        this[name] = (value == null) ? {} : $.parseJSON(value);
    }
}

UserSettings.prototype.update = function (name, itemKey) {
    if (this.webClientFolder != null) {
        var itemName = 'item' + name;
        if (this[itemName] == null) {
            this[itemName] = this.webClientFolder.GetItemByName(itemKey, null);
        }
        var updatedItem = this[itemName].Copy();
        updatedItem.SetFieldValue(FieldNames.Value, JSON.stringify(this[name]));
        this[itemName].Update(updatedItem);
    }
}
