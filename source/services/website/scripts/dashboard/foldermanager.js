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
    $tabs.find('li a:first').empty().append(this.activeListName(activeList));


    var activityIsRunning = activeList.IsActivity() && !activeList.IsPaused();
    if (activeItem == null || activityIsRunning) {
        $tabs.find('a[href=".' + FolderManager.ItemView + '"]').hide();
    } else {
        $itemTab = $tabs.find('a[href=".' + FolderManager.ItemView + '"]');
        $itemTab.empty().append(this.activeItemName(activeItem));
        $itemTab.show();
    }

    var $view = this.views[activeView];
    var maxContentHeight = this.$parentElement.outerHeight() - $tabs.outerHeight();
    if (activeView == FolderManager.ItemView) {
        if (activeItem == null || activityIsRunning) {
            // switch to ListView if no items in current List or Activity is running
            activeView = FolderManager.ListView;
            this.activeView(activeView);
        } else {
            this.itemEditor.render($view, activeItem, maxContentHeight);
        }
    }
    if (activeView == FolderManager.ListView) {
        this.listEditor.render($view, activeList, maxContentHeight);
    }
    $tabs.find('a[href=".' + activeView + '"]').tab('show');
    this.renderStatus();
}

FolderManager.prototype.renderStatus = function () {
    var $status = this.$element.children('div.item-status').empty();
    var activity = this.activeList();
    if (activity != null && !activity.IsFolder() && activity.IsActivity()) {
        if (!activity.IsPaused()) {
            var $btnPause = $('<a><i class="icon-pause"></i></a>').appendTo($status);
            $btnPause.attr('title', 'Pause Activity').tooltip(Control.noDelayBottom);

            $btnPause.click(function () {
                $(this).tooltip('hide');
                activity.Pause();
            });
        } else {
            var $btnRun = $('<a><i class="icon-play"></i></a>').appendTo($status);
            $btnRun.attr('title', 'Start Activity').tooltip(Control.noDelayBottom);

            $btnRun.click(function () {
                $(this).tooltip('hide');
                var itemNeedsDueDate = activity.Active();
                if (itemNeedsDueDate != null) {
                    // item needs a due date
                    var header = 'Select due date';
                    header += (itemNeedsDueDate.IsActivity()) ? ' for activity' : ' for first step';
                    var $dialog = $('<div><label>Due date: </label><input type="text"></div>');
                    Control.popup($dialog, header, function (inputs) {
                        if (inputs.length == 1 && inputs[0].length > 0) {
                            var item = activity.Active(inputs[0]);
                            if (item != null) {
                                // unable to set valid due date on activity or next step
                                Control.alert('Activity is not running.','Could not set valid due date on activity or next step. Try setting due date first.');
                            }
                        }
                    });
                }
            });
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
                //break;
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
    }
    this.render();
    this.$element.show();
}

// render is only called internally by show method
HelpManager.prototype.render = function () {
    this.$element.empty();
    var $help = $('<div class="hero-unit" />').appendTo(this.$element);
    $help.append('<img src="/content/images/twostep-large.png" alt="TwoStep" />');
    $help.append(HelpManager.tagline);
    $connect = $('<p style="margin: 64px 0 -32px 0"></p>').appendTo($help);

    var $this = this;
    var dashboard = this.parentControl;
    dashboard.dataModel.GetSuggestions(function (suggestions) {
        $this.renderConnect($connect, suggestions);
    });
}

HelpManager.prototype.renderConnect = function ($element, suggestions) {
    $element.empty();
    var dashboard = this.parentControl;
    var suggestionManager = dashboard.suggestionManager;

    // connect to facebook
    var fbConsent = SuggestionManager.findSuggestion(suggestions, SuggestionTypes.GetFBConsent);
    if (fbConsent != null) {
        var $btn = $('<a><img src="/content/images/connect-to-facebook.png" alt="Facebook" /></a>').appendTo($element);
        $btn.css('margin-right', '32px');
        $btn.click(function () { suggestionManager.select(fbConsent); });
    }
    // connect to google calendar
    var gcConsent = SuggestionManager.findSuggestion(suggestions, SuggestionTypes.GetGoogleConsent);
    if (gcConsent != null) {
        $btn = $('<a class="btn"><img src="/content/images/google-calendar.png" alt="Google" /></a>').appendTo($element);
        $btn.css('margin-right', '32px');
        $btn.click(function () { suggestionManager.select(gcConsent); });
    }
}

HelpManager.tagline =
'<p>The ideal tool for managing your life activities. ' +
'Organize the activities in your life into actionable steps and get a categorized list of next steps for getting things done. ' +
'Get connected and have relevant information just one click away. ' +
'Stay two steps ahead of life with TwoStep!</p>';

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
}
