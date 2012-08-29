﻿//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// FolderList.js

// ---------------------------------------------------------
// FolderList control
function FolderList(folders) {
    // fires notification when selected folder changes
    this.onSelectionChangedHandlers = {};
    this.init(folders);
}

FolderList.prototype.init = function (folders) {
    // only display Category folders
    this.folders = {};
    for (var id in folders) {
        if (folders[id].IsCategory()) {
            this.folders[id] = folders[id];
        }
    }
    // TODO: temporarily display People & Places until moved
    for (var id in folders) {
        if (!folders[id].IsCategory()) {
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
    if (folders != null) {
        this.init(folders);
    }
    $element.empty();
    this.$element = $('<ul class="nav nav-pills nav-stacked" />').appendTo($element);
    Control.List.sortable(this.$element);
    for (var id in this.folders) {
        var folder = this.folders[id];
        $folder = $('<li class="position-relative"><a class="selector"><strong>&nbsp;' + folder.Name + '</strong></a></li>').appendTo(this.$element);
        $folder.find('strong').prepend(Control.Icons.forItemType(folder));
        $folder.data('control', this);
        $folder.data('item', folder);
        $folder.click(function (e) {
            if ($(e.target).hasClass('selector') || $(e.target).parents('a').first().hasClass('selector')) {
                Control.get(this).folderClicked($(this));
            }
            return true;
        });
        $('<div class="btn-dropdown absolute-right"></div>').appendTo($folder);
        $('<div class="icon drag-handle"><span>⁞&nbsp;</span></div>').appendTo($folder);

        if (folder.IsSelected()) { this.select($folder, folder); }
        this.renderItems($folder, folder);
    }
    this.renderAddBtn($element);
}

FolderList.prototype.renderItems = function ($folder, folder) {
    var items = folder.GetItems();
    $itemList = $('<ul class="itemlist nav nav-pills nav-stacked" />').appendTo($folder.parent());
    Control.List.sortable($itemList);
    for (var id in items) {
        var item = items[id];
        if (item.IsList) {
            $item = $('<li class="position-relative"><a class="selector"><span>&nbsp;' + item.Name + '</span></a></li>').appendTo($itemList);
            $item.find('span').prepend(Control.Icons.forItemType(item));
            if (item.IsActivity() && item.IsPaused()) {
                 $item.find('a').addClass(StatusTypes.Paused.toLowerCase());
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
    }
    this.renderAddBtn($folder);
    if (folder.IsExpanded()) { this.expand($folder); }
    else { this.collapse($folder); }
}

FolderList.prototype.folderClicked = function ($folder) {
    var folder = $folder.data('item');
    this.toggle($folder);
    this.select($folder, folder);
    this.fireSelectionChanged(folder.ID);
}

FolderList.prototype.itemClicked = function ($item) {
    var item = $item.data('item');
    this.select($item, item);
    this.fireSelectionChanged(item.FolderID, item.ID);
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
    Control.expand($itemlist, 400);
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
        var $item = $(this);
        var item = (category != null) ?
            Item.Extend({ Name: 'New Activity', ItemTypeID: ItemTypes.Activity, IsList: true, Status: StatusTypes.Paused }) :
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
            }
        });
        var add = function (name, item) {
            if (name != null && name.length > 0) {
                item.Name = name;
                if (category != null) {
                    category.Expand(true);
                    category.InsertItem(item);
                } else {
                    DataModel.InsertFolder(item);
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
        $deleteBtn.click(function () { $(this).parents('li').first().data('item').Delete(); });
        
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
