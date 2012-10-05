//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// FolderManager.js

// ---------------------------------------------------------
// FolderManager control
function FolderManager(parentControl, $parentElement) {
    this.parentControl = parentControl;
    this.$parentElement = $parentElement;
    this.addWell = false;

    this.$element = null;
    this.currentFolder = null;
    this.currentItem = null;
    this.views = {};
    this.onSelectionChangedHandlers = {};
    this.listEditor = new ListEditor(this);
    this.itemEditor = new ItemEditor(this);
}

FolderManager.ListView = "fm-list-view";
FolderManager.ItemView = "fm-item-view";
FolderManager.PropertyView = "fm-property-view";

FolderManager.prototype.addSelectionChangedHandler = function (name, handler) {
    this.onSelectionChangedHandlers[name] = handler;
}

FolderManager.prototype.removeSelectionChangedHandler = function (name) {
    this.onSelectionChangedHandlers[name] = undefined;
}

FolderManager.prototype.fireSelectionChanged = function (item) {
    for (var name in this.onSelectionChangedHandlers) {
        var handler = this.onSelectionChangedHandlers[name];
        if (typeof (handler) == "function") {
            handler(item.FolderID, item.ID);
            this.activeView(FolderManager.ItemView);                // switch to ItemView
        }
    }
}

FolderManager.prototype.hide = function () {
    if (this.$element != null) {
        this.$element.hide();
    }
}

FolderManager.prototype.show = function (forceRender) {
    if (this.$element == null) {
        this.$element = $('<div class="manager-folders" />').appendTo(this.$parentElement);

        // render tabs
        var $tabs = $('<ul class="nav nav-tabs" />').appendTo(this.$element);
        $tabs.data('control', this);
        var $tab = $('<li><a data-toggle="tab">List View</a></li>').appendTo($tabs);
        $tab.find('a').attr('href', '.' + FolderManager.ListView);
        $tab = $('<li><a data-toggle="tab">Item View</a></li>').appendTo($tabs);
        $tab.find('a').attr('href', '.' + FolderManager.ItemView);

        // upper-right status region 
        $('<div class="item-status"></div>').appendTo(this.$element);

        // render views
        var $tabContent = $('<div class="tab-content" />').appendTo(this.$element);
        var $view = $('<div class="tab-pane" />').appendTo($tabContent);
        $view.addClass(FolderManager.ListView);
        this.views[FolderManager.ListView] = $view;
        $view = $('<div class="tab-pane" />').appendTo($tabContent);
        $view.addClass(FolderManager.ItemView);
        this.views[FolderManager.ItemView] = $view;

        $('a[data-toggle="tab"]').on('shown', function (e) {
            var $tabs = $(e.target).parents('.nav-tabs');
            Control.get($tabs).viewChanged($(e.target)); ;
        });
    }
    if (forceRender == true) { this.render(); }
    this.$element.show();
}

// render is only called internally by show method
FolderManager.prototype.render = function () {
    var activeView = this.activeView();
    var activeItem = this.activeItem();
    var activeList = this.activeList();

    var $tabs = this.$element.find('.nav-tabs');
    var $tabContent = this.$element.find('.tab-content');
    var $listTab = $tabs.find('li a:first');
    $listTab.empty().append(this.activeListName(activeList));
    $listTab.append($('<span class="badge status-badge" />'));

    var activityIsRunning = activeList.IsActivity() && activeList.IsRunning();
    var $itemTab = $tabs.find('a[href=".' + FolderManager.ItemView + '"]');
    if (activeItem == null || activeList.IsActivity()) {
        $itemTab.empty().append('Edit Step Details');
        var $closeBtn = $('<a><i class="icon-remove"></i></a>').prependTo($itemTab);
        $closeBtn.data('control', this);
        $closeBtn.click(function () {
            Control.get(this).activeView(FolderManager.ListView); return false;
        });
    } else {
        $itemTab.empty().append(this.activeItemName(activeItem));
    }
    /*
    var activityIsRunning = activeList.IsActivity() && activeList.IsRunning();
    if (activeItem == null || activityIsRunning) {
    $tabs.find('a[href=".' + FolderManager.ItemView + '"]').hide();
    } else {
    $itemTab = $tabs.find('a[href=".' + FolderManager.ItemView + '"]');
    $itemTab.empty().append(this.activeItemName(activeItem));
    $itemTab.show();
    }
    */

    var $view = this.views[activeView];
    var maxContentHeight = this.$parentElement.outerHeight() - $tabs.outerHeight();
    if (activeView == FolderManager.ItemView) {
        if (activeItem == null || activityIsRunning) {
            // switch to ListView if no items in current List or Activity is running
            activeView = FolderManager.ListView;
            this.activeView(activeView);
        } else {
            this.itemEditor.render($view, activeItem, maxContentHeight);
            $itemTab.show();
            $listTab.hide();
        }
    }
    if (activeView == FolderManager.ListView) {
        this.listEditor.render($view, activeList, maxContentHeight);
        $listTab.show();
        $itemTab.hide();
    }
    $tabs.find('a[href=".' + activeView + '"]').tab('show');
    this.renderStatus(activeList);
}

FolderManager.prototype.renderStatus = function (activity) {
    /* this renders status as tab on right of center tab-pane
    var $status = this.$element.find('.item-status').empty();
    if (activity.IsActivity()) {
    var status, cssClass;
    if (activity.IsStopped()) { status = 'Activity is stopped'; cssClass = 'alert-error'; }
    else if (activity.IsPaused()) { status = 'Activity is paused'; cssClass = 'alert-warning'; }
    else if (activity.IsComplete()) { status = 'Activity is complete'; cssClass = 'alert-info'; }
    else if (activity.IsActive()) { status = 'Activity is running'; cssClass = 'alert-success'; }
    var $alert = $('<div class="alert"></div>').appendTo($status);
    $alert.addClass(cssClass);
    $alert.html(status);
    }
    */
    var $status = this.$element.find('.status-badge').empty();
    if (activity.IsActivity()) {
        var status, cssClass;
        if (activity.IsStopped()) { status = 'Stopped'; cssClass = 'badge-important'; }
        else if (activity.IsPaused()) { status = 'Paused'; cssClass = 'badge-warning'; }
        else if (activity.IsComplete()) { status = 'Completed'; cssClass = 'badge-info'; }
        else if (activity.IsActive()) { status = 'Running'; cssClass = 'badge-success'; }
        $status.addClass(cssClass);
        $status.html(status);

        if (activity.IsActive() && HelpManager.gettingStarted == 3) {
            HelpManager.getStartedStep4();
        }
    }

}

FolderManager.prototype.selectFolder = function (folder) {
    this.currentFolder = folder;
    this.currentItem = null;
    if (this.currentFolder != null) {
        this.render();
    }
}

FolderManager.prototype.selectItem = function (item) {
    this.currentItem = item;
    if (this.currentItem != null) {
        this.currentFolder = this.currentItem.GetFolder();
        this.render();
    } else {
        this.selectFolder(this.currentFolder);
    }
}

FolderManager.prototype.activeItem = function () {
    var parent = null;
    if (this.currentItem != null) {
        if (this.currentItem.IsList) {
            parent = this.currentItem;
        } else {
            return this.currentItem;
        }
    } else if (this.currentFolder != null) {
        parent = this.currentFolder;
    }

    if (parent != null) {
        // select first item in list
        var items = parent.GetItems();
        for (var id in items) {
            if (!items[id].IsList) {
                this.currentItem = items[id];
                this.currentItem.Select();
                return this.currentItem;
            }
        };
    }
    return null;
}

FolderManager.prototype.activeItemName = function (item) {
    if (item != null) {
        var $icon = Control.Icons.forItemType(item);
        return $('<span>&nbsp;' + item.GetItemType().Name + '</span>').prepend($icon);
    }
    return $('<span />');
}

FolderManager.prototype.activeList = function () {
    if (this.currentItem != null) {
        return (this.currentItem.IsList) ? this.currentItem : this.currentItem.GetParentContainer();
    } else if (this.currentFolder != null) {
        return this.currentFolder;
    }
    return null;
}

FolderManager.prototype.activeListName = function (list) {
    var activeList = (list == null) ? this.activeList() : list;
    if (activeList != null) {
        var $icon = Control.Icons.forItemType(activeList);
        return $('<span>&nbsp;' + activeList.Name + '</span>').prepend($icon);
    }
    return $('<span>List View</span>');
}

FolderManager.prototype.activeView = function (viewName) {
    var dataModel = Control.findParent(this, 'dataModel').dataModel;
    if (viewName === undefined) {       // get
        return (dataModel.UserSettings.ViewState.ActiveView != null) ? dataModel.UserSettings.ViewState.ActiveView : FolderManager.ListView;
    } else {                            // set
        if (dataModel.UserSettings.ViewState.ActiveView != viewName) {
            dataModel.UserSettings.ViewState.ActiveView = viewName;
            this.render();
        }
    }
}

FolderManager.prototype.viewChanged = function ($tab) {
    this.activeView($tab.attr('href').substr(1));
}

// ---------------------------------------------------------
// HelpManager control
function HelpManager(parentControl, $parentElement) {
    this.parentControl = parentControl;
    this.$parentControl = $parentElement;
    this.$element = null;
}

HelpManager.Views = { Intro: 'Intro', Help: 'Help' }

HelpManager.prototype.hide = function () {
    if (this.$element != null) {
        this.$element.hide();
    }
}

HelpManager.prototype.show = function (forceRender, view) {
    view = (view == null) ? HelpManager.Views.Intro : view;
    if (this.$element == null) {
        this.$element = $('<div class="manager-help" />').appendTo(this.$parentControl);

    }
    if (forceRender || view != this.currentView) {
        if (view == HelpManager.Views.Intro) { this.renderIntro(this.$element); }
        else if (view == HelpManager.Views.Help) { this.renderHelp(this.$element); }
        this.currentView = view;
    }
    this.$element.show();
}

HelpManager.prototype.renderIntro = function ($element) {
    $element.empty();
    var thisControl = this;
    var $intro = $('<div class="intro well"></div>').appendTo($element);
    $('<img src="/content/images/twostep-watermark.png" alt="TwoStep" />').appendTo($intro);

    var settings = this.parentControl.dataModel.UserSettings;
    if (settings.ViewState.HideWelcome != true) {
        $('<div class="welcome background"></div>').appendTo($intro);
        var $welcome = $('<div class="welcome"><h1>Welcome to TwoStep!</h1></div>').appendTo($intro);
        $('<h3>Are you new to TwoStep?</h3>').appendTo($welcome);
        $('<p>Click the <strong>Get Started!</strong> button to step through the product and create your first Activity.</p>').appendTo($welcome);
        $('<p>Click the <strong>Get Help!</strong> button to learn more about the basic product features.</p>').appendTo($welcome);
        //$('<p><small>' + navigator.appName + '</small></p>').appendTo($welcome);
        //$('<p><small>' + navigator.userAgent + '</small></p>').appendTo($welcome);
        var $checkbox = $('<div class="controls inline"></div>').appendTo($welcome);
        $checkbox = $('<input type="checkbox" /><label class="inline">Do not show welcome screen</label>').appendTo($checkbox);
        $checkbox.click(function () {
            settings.ViewState.HideWelcome = true;
            thisControl.show(true);
        });

        var $btn = $('<button class="btn btn-large btn-success">Get Started!</button>').appendTo($welcome);
        $btn.click(function () { HelpManager.getStarted(); return false; });
        $btn = $('<button class="btn btn-large btn-primary">Get Help!</button>').appendTo($welcome);
        $btn.click(function () { thisControl.show(false, HelpManager.Views.Help); return false; });
    }
}

HelpManager.prototype.renderHelp = function ($element) {
    Service.InvokeControllerView('Dashboard', 'Help', null,
        function (responseState) {
            var helpHtml = responseState.result;
            $element.html(helpHtml);
            $('#help_carousel').show().carousel('pause');
        });
}

// static functions for handling getting started popovers
// step 1: install from gallery
HelpManager.getStarted = function () {
    HelpManager.gettingStarted = 1;
    var title = 'Step 1: Install an Activity';
    var content = 'Select a <strong>Category</strong> in the <strong>Gallery</strong> and install a pre-configured <em>Activity</em>.';
    Control.popover($('.dashboard-right'), $('.dashboard-region'), title, content, 'left', '126px');
}
// step 2: configure repeat
HelpManager.getStartedStep2 = function () {
    HelpManager.gettingStarted = 2;
    var title = 'Step 2: Configure Repeat';
    var content = 'The <em>Activity</em> has been added to your <strong>Organizer</strong>. Configure how often you repeat this activity using the <strong>Repeat</strong> settings.';
    Control.popover($('.dashboard-center .btn-repeat'), $('.dashboard-region'), title, content, 'right');
    Control.Repeat.closeHandler = HelpManager.getStartedStep3;
}
// step 3: start activity
HelpManager.getStartedStep3 = function () {
    HelpManager.gettingStarted = 3;
    var title = 'Step 3: Start the Activity';
    var content = 'The <em>Activity</em> has been configured. Run the activity by clicking on the <strong>Start</strong> button.';
    Control.popover($('.dashboard-center .vcr-controls .btn-success'), $('.dashboard-region'), title, content, 'right');
}
// step 4: view next steps
HelpManager.getStartedStep4 = function () {
    HelpManager.gettingStarted = null;
    var title = 'Step 4: View Next Steps';
    var content = 'View your <em>Next Steps</em> by clicking on the <strong>Next Steps</strong> tab.';
    Control.popover($('.dashboard-left .nav-tabs a:last'), $('.dashboard-region'), title, content, 'bottom');
    // TODO: review removing reference to static Dashboard
    Dashboard.dataModel.UserSettings.ViewState.IntroComplete = true;
    Dashboard.dataModel.UserSettings.Save();
}

// ---------------------------------------------------------
// SettingsManager control
function SettingsManager(parentControl, $parentElement) {
    this.parentControl = parentControl;
    this.$parentElement = $parentElement;
    this.$element = null;
    this.addWell = false;
    this.views = {};
}

SettingsManager.Display = "sm-display-settings";

SettingsManager.prototype.hide = function () {
    if (this.$element != null) {
        this.$element.hide();
    }
}

SettingsManager.prototype.show = function () {
    if (this.$element == null) {
        this.$element = $('<div class="manager-settings" />').appendTo(this.$parentElement);
        // render tabs
        var $tabs = $('<ul class="nav nav-tabs" />').appendTo(this.$element);
        $tabs.data('control', this);
        var $tab = $('<li><a data-toggle="tab"><i class="icon-cogs"></i> User Settings</a></li>').appendTo($tabs);
        $tab.find('a').attr('href', '.' + SettingsManager.Display);
        // render views
        var $tabContent = $('<div class="tab-content" />').appendTo(this.$element);
        var $view = $('<div class="tab-pane" />').appendTo($tabContent);
        $view.addClass(SettingsManager.Display);
        this.views[SettingsManager.Display] = $view;

        
        /* only one tab at moment
        $('a[data-toggle="tab"]').on('shown', function (e) {
        var $tabs = $(e.target).parents('.nav-tabs');
        Control.get($tabs).viewChanged($(e.target)); ;
        });
        */
    }

    this.render();
    this.$element.show();
}

// render is only called internally by show method
SettingsManager.prototype.render = function () {
    var $tabs = this.$element.find('.nav-tabs');
    $tabs.find('a[href=".' + SettingsManager.Display + '"]').tab('show');
    var $view = this.views[SettingsManager.Display];
    $view.empty();

    var $form = $('<form class="row-fluid form-vertical" />').appendTo($view);
    //Control.ThemePicker.render($form);

    var $connect = $('<p style="margin: 64px 0 -32px 0"></p>').appendTo($form);

    if (this.connectSuggestions == null) {
        var thisControl = this;
        var dashboard = this.parentControl;
        dashboard.dataModel.GetSuggestions(function (suggestions) {
            thisControl.renderConnect($connect, suggestions);
        });
    } else {
        this.renderConnect($connect, this.connectSuggestions);
    }
}

SettingsManager.prototype.renderConnect = function ($element, suggestions) {
    $element.empty();
    this.connectSuggestions = suggestions;
    var thisControl = this;
    var suggestionManager = this.parentControl.suggestionManager;

    // connect to facebook
    var fbConsent = SuggestionManager.findSuggestion(suggestions, SuggestionTypes.GetFBConsent);
    if (fbConsent != null) {
        $element.append('<p><strong>Not connected to Facebook.</strong></p>');
        var $btn = $('<a><img src="/content/images/connect-to-facebook.png" alt="Facebook" /></a>').appendTo($element);
        $btn.css('margin-right', '32px');
        $btn.click(function () { suggestionManager.select(fbConsent); thisControl.connectSuggestions = null; });
        $element.append('<p>Click to connect.</p>');
    }
    else {
        $element.append('<p><strong>Connected to Facebook.</strong></p>');
        var $btn = $('<a><img src="/content/images/connect-to-facebook.png" alt="Facebook" /></a>').appendTo($element);
        $btn.css('margin-right', '32px');
        $btn.click(function () { suggestionManager.select({ SuggestionType: SuggestionTypes.GetFBConsent }); thisControl.connectSuggestions = null; });
        $element.append('<p>Click to reconnect.</p>');
    }
    $element.append('<br /><br />');

    // connect to google calendar
    var gcConsent = SuggestionManager.findSuggestion(suggestions, SuggestionTypes.GetGoogleConsent);
    if (gcConsent != null) {
        $element.append('<p><strong>Not connected to Google Calendar.</strong></p>');
        var $btn = $('<a class="btn"><img src="/content/images/google-calendar.png" alt="Google" /></a>').appendTo($element);
        $btn.css('margin-right', '32px');
        $btn.click(function () { suggestionManager.select(gcConsent); thisControl.connectSuggestions = null; });
        $element.append('<p>Click to connect.</p>');
    }
    else {
        $element.append('<p><strong>Connected to Google Calendar.</strong></p>');
        var $btn = $('<a class="btn"><img src="/content/images/google-calendar.png" alt="Google" /></a>').appendTo($element);
        $btn.css('margin-right', '32px');
        $btn.click(function () { suggestionManager.select({ SuggestionType: SuggestionTypes.GetGoogleConsent }); thisControl.connectSuggestions = null; });
        $element.append('<p>Click to reconnect.</p>');
    }
}

