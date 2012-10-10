//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// FolderList.js

// ---------------------------------------------------------
// FolderList control
function FolderList(folders, folderTypes) {
    // fires notification when selected folder changes
    this.onSelectionChangedHandlers = {};
    this.folderTypes = (folderTypes == null) ? [ItemTypes.Category] : folderTypes;
    this.init(folders);
}

FolderList.prototype.init = function (folders) {
    // display folders of folderTypes
    this.folders = {};
    for (var id in folders) {
        if (this.folderTypes.indexOf(folders[id].ItemTypeID) != -1) {
            this.folders[id] = folders[id];
        }
    }
    this.$element = null;
}

FolderList.prototype.addSelectionChangedHandler = function (name, handler) {
    this.onSelectionChangedHandlers[name] = handler;
}

FolderList.prototype.removeSelectionChangedHandler = function (name) {
    this.onSelectionChangedHandlers[name] = undefined;
}

FolderList.prototype.fireSelectionChanged = function (folderID, itemID) {
    for (var name in this.onSelectionChangedHandlers) {
        var handler = this.onSelectionChangedHandlers[name];
        if (typeof (handler) == "function") {
            handler(folderID, itemID);
        }
    }
}

FolderList.prototype.render = function ($element, folders) {
    this.delay = 1;         // suppress animation during render (Chrome)
    if (folders != null) {
        this.init(folders);
    }
    $element.empty();
    var $header = $('<div class="nav-header"></div>').appendTo($element);
    this.renderTabs($header);
    this.$element = $('<ul class="nav nav-pills nav-stacked" />').appendTo($element);
    Control.List.sortable(this.$element);
    for (var id in this.folders) {
        var folder = this.folders[id];
        $folder = $('<li class="position-relative"></li>').appendTo(this.$element);
        this.renderItem($folder, folder);
        this.renderItems($folder, folder);
    }
    this.renderAddBtn(this.$element);
    this.delay = 400;        // enable animation after render
}

FolderList.prototype.refreshItem = function (item) {
    if (this.$element != null) {
        // check active item 
        var $item = this.$element.find('li.active');
        if ($item.length > 0 && $item.data('item') != null && (item.ID == $item.data('item').ID)) {
            this.renderItem($item, item);
        }

        // TODO: handle case where change item is not active
    }
}

FolderList.prototype.renderItems = function ($folder, folder) {
    var items = folder.GetItems();
    $itemList = $('<ul class="itemlist nav nav-pills nav-stacked" />').appendTo($folder.parent());
    Control.List.sortable($itemList);
    for (var id in items) {
        var item = items[id];
        if (item.IsList) {
            $item = $('<li class="position-relative"></li>').appendTo($itemList);
            this.renderItem($item, item);
        }
    }
    this.renderAddBtn($folder);
    if (folder.IsExpanded()) { this.expand($folder); }
    else { this.collapse($folder); }
}

FolderList.prototype.renderItem = function ($item, item) {
    $item.empty();
    if (item.IsFolder()) {
        $('<a class="selector"><strong>&nbsp;' + item.Name + '</strong></a>').appendTo($item);
        $item.find('strong').prepend(Control.Icons.forItemType(item));
    } else {
        $('<a class="selector"><span>&nbsp;' + item.Name + '</span></a>').appendTo($item);
        $item.find('span').prepend(Control.Icons.forItemType(item));
        $item.find('a').addClass(item.StatusClass());
    }
    $item.data('control', this);
    $item.data('item', item);
    $item.click(function (e) {
        if ($(e.target).hasClass('selector') || $(e.target).parents('a').first().hasClass('selector')) {
            Control.get(this).itemClicked($(this));
        }
        return true;
    });
    $('<div class="btn-dropdown absolute-right"></div>').appendTo($item);
    $('<div class="icon drag-handle">⁞&nbsp;</div>').appendTo($item);

    if (item.IsSelected(true)) { this.select($item, item); }
}

FolderList.prototype.renderTabs = function ($header) {
    var $tabs = $('<ul class="nav nav-tabs" />').appendTo($header);
    var $tab = $('<li class="active"><a data-toggle="tab"><i class="icon-dashboard"></i> Organizer</a></li>').appendTo($tabs);
    $tab.css('width', '70%');
    $tab = $('<li><a data-toggle="tab"><i class="icon-play"></i></a></li>').appendTo($tabs);
    $tab.css('width', '30%');
    Control.tooltip($tab, 'Next Steps', 'bottom');
    $tab.click(function () { window.location = '/dashboard/nextsteps'; });    // TEMPORARY
}

FolderList.prototype.itemClicked = function ($item) {
    var item = $item.data('item');
    if (item.IsFolder()) {
        this.toggle($item);
        this.select($item, item);
        this.fireSelectionChanged(item.ID);
    } else {
        this.select($item, item);
        this.fireSelectionChanged(item.FolderID, item.ID);
    }
}

FolderList.prototype.select = function ($item, item) {
    this.deselect();
    $item.addClass('active');
    this.showCommands($item, item);
    // scroll selected item into view
    var $container = $item.parents('.dashboard-list').first();
    var height = $container.height();
    var scrollTop = $container.scrollTop();
    var scroll = $item.offset().top - height + scrollTop;
    if (scroll > 0) {
        $container.animate({ scrollTop: scroll }, 500);
    }
}

FolderList.prototype.deselect = function () {
    $control = this;
    $.each(this.$element.find('li'), function () {
        $(this).removeClass('active');
        $control.hideCommands($(this));
    });
}

FolderList.prototype.expand = function ($folder) {
    this.collapseAll($folder);
    var folder = $folder.data('item');
    $folder.addClass('expanded');
    folder.Expand(true);
    $itemlist = $folder.next('.itemlist');
    Control.expand($itemlist, this.delay);
    // must remove .collapse class for dropdown menu to not get clipped
    $itemlist.removeClass('collapse');
}

FolderList.prototype.collapse = function ($folder, delay) {
    var folder = $folder.data('item');
    $folder.removeClass('expanded');
    folder.Expand(false);
    Control.collapse($folder.next('.itemlist'), delay);
}

FolderList.prototype.collapseAll = function ($folder) {
    $this = this;
    $.each($folder.siblings('li'), function () {
        $this.collapse($(this));
    });
}

FolderList.prototype.toggle = function ($folder) {
    var expanded = $folder.hasClass('expanded');
    if ($folder.hasClass('active') && expanded) {
        this.collapse($folder);
    } else if (!expanded) {
        this.expand($folder);
    }
}

FolderList.prototype.renderAddBtn = function ($element) {
    var category = $element.data('item');
    if (category != null && category.ItemTypeID != ItemTypes.Category) { return; }

    var label = (category != null) ? 'Add Activity' : 'Add Category';
    var $addElement = (category != null) ? $element.next('.itemlist') :
        $('<ul class="nav nav-pills nav-stacked" />').appendTo($element);
    var $addBtn = $('<li class="position-relative"><a class="btn-command"><em>&nbsp;</em></a></li>').appendTo($addElement);
    $addBtn.data('control', this);
    $addBtn.find('em').prepend('<i class="icon-plus-sign"></i>');
    $addBtn.find('em').append(label);
    $addBtn.click(function () {
        var thisControl = Control.get(this);
        var $item = $(this);
        var item = (category != null) ?
            Item.Extend({ Name: 'New Activity', ItemTypeID: ItemTypes.Activity, IsList: true, Status: StatusTypes.Stopped }) :
            Folder.Extend({ Name: 'New Category', ItemTypeID: ItemTypes.Category });
        var $input = $('<input type="text" class="popup-text" />').appendTo($item);
        $input.val(item.Name).focus().select();
        $input.blur(function () { $item.find('input').remove(); });
        $input.change(function () {
            add($(this).val(), item);
            $item.find('input').remove();
        });
        $input.keypress(function (e) {
            if (e.which == 13) {
                add($(this).val(), item);
                $item.find('input').remove();
                return false;
            }
        });
        var add = function (name, item) {
            if (name != null && name.length > 0 && item.ID === undefined) {
                item.Name = name;
                if (category != null) {
                    category.Expand(true);
                    // 2012-09-20 OG: instead of just inserting the activity into the category, insert the activity and also
                    // create a reminder step inside of it.
                    //category.InsertItem(item);
                    DataModel.InsertItem(item, category, null, null, null, function (insertedActivity) {
                        // success handler: insert a reminder step into the new activity
                        insertedActivity = Item.Extend(insertedActivity);
                        var reminder = Item.Extend({ Name: name, ItemTypeID: ItemTypes.Step });
                        insertedActivity.InsertItem(reminder);
                    });
                    _gaq.push(['_trackEvent', Events.Categories.Organizer, Events.Organizer.AddActivity]);
                } else {
                    DataModel.InsertFolder(item);
                    var $folder = thisControl.$element.find('li.active');
                    thisControl.expand($folder);
                    _gaq.push(['_trackEvent', Events.Categories.Organizer, Events.Organizer.AddCategory]);
                }
            }
        }
    });
}

FolderList.prototype.showCommands = function ($item, item) {
    if (item.IsCategory() || item.IsActivity()) {
        var $btnDropdown = $item.find('.btn-dropdown');
        $('<i class="icon-caret-down dropdown-toggle" data-toggle="dropdown"></i>').appendTo($btnDropdown);
        var $menu = $('<ul class="dropdown-menu pull-right" role="menu"></ul>').appendTo($btnDropdown);

        var $renameBtn = $('<li><a href="#"><i class="icon-pencil"></i>&nbsp;Rename</a></li>').appendTo($menu);
        $renameBtn.click(function () {
            var $item = $(this).parents('li').first();
            var item = $item.data('item');
            var $input = $('<input type="text" class="popup-text" />').appendTo($item);
            $input.val(item.Name).focus().select();
            $input.blur(function () { $item.find('input').remove(); });
            $input.change(function () {
                rename($(this).val(), item, item.Copy());
                $item.find('input').remove();
            });
            $input.keypress(function (e) {
                if (e.which == 13) {
                    rename($(this).val(), item, item.Copy());
                    $item.find('input').remove();
                }
            });
            var rename = function (name, item, copy) {
                if (name != null && name.length > 0) {
                    copy.Name = name;
                    item.Update(copy);
                }
            }
        });
        var $deleteBtn = $('<li><a href="#"><i class="icon-remove-sign"></i>&nbsp;Delete</a></li>').appendTo($menu);
        $deleteBtn.click(function () {
            var item = $(this).parents('li').first().data('item');
            item.Delete();
            if (item.IsFolder()) {
                _gaq.push(['_trackEvent', Events.Categories.Organizer, Events.Organizer.DeleteCategory]);
            }
            else {
                _gaq.push(['_trackEvent', Events.Categories.Organizer, Events.Organizer.DeleteActivity]);
            }
        });

        /* TODO: add support for sub-categories
        if (item.IsFolder()) {
        $('<li class="divider"></li>').appendTo($menu);

        var $addBtn = $('<li><a href="#"><i class="icon-plus-sign"></i>&nbsp;Add SubCategory</a></li>').appendTo($menu);
        $addBtn.click(function () {
        var item = Item.Extend({ Name: 'New SubCategory', ItemTypeID: ItemTypes.Category, IsList: true });
        var folder = $(this).parents('li').first().data('item');
        folder.Expand(true);
        folder.InsertItem(item);
        });
        }
        */
    }
}

FolderList.prototype.hideCommands = function ($item) {
    var $btnDropdown = $item.find('.btn-dropdown');
    $btnDropdown.empty();
}
