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
        //$closeBtn.attr('title', 'Close').tooltip(Control.ttDelay);
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

HelpManager.prototype.hide = function () {
    if (this.$element != null) {
        this.$element.hide();
    }
}

HelpManager.prototype.show = function () {
    if (this.$element == null) {
        this.$element = $('<div class="manager-help" />').appendTo(this.$parentControl);
        Service.InvokeControllerView('Dashboard', 'Help', null,
                function (responseState) {
                    var helpHtml = responseState.result;
                    $help = $('.manager-help');
                    $help.html(helpHtml);
                    $('#help_carousel').show().carousel('pause');
                    $help.show();
                });
    } else {
        this.$element.show();
    }
}

HelpManager.prototype.renderConnect = function ($element, suggestions) {
    $element.empty();
    this.connectSuggestions = suggestions;
    var thisControl = this;
    var suggestionManager = this.parentControl.suggestionManager;

    // connect to facebook
    var fbConsent = SuggestionManager.findSuggestion(suggestions, SuggestionTypes.GetFBConsent);
    if (fbConsent != null) {
        var $btn = $('<a><img src="/content/images/connect-to-facebook.png" alt="Facebook" /></a>').appendTo($element);
        $btn.css('margin-right', '32px');
        $btn.click(function () { suggestionManager.select(fbConsent); thisControl.connectSuggestions = null; });
    }
    // connect to google calendar
    var gcConsent = SuggestionManager.findSuggestion(suggestions, SuggestionTypes.GetGoogleConsent);
    if (gcConsent != null) {
        $btn = $('<a class="btn"><img src="/content/images/google-calendar.png" alt="Google" /></a>').appendTo($element);
        $btn.css('margin-right', '32px');
        $btn.click(function () { suggestionManager.select(gcConsent); thisControl.connectSuggestions = null; });
    }
}

HelpManager.tagline = "<p>Here's a short introduction to the product.</p>"

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

