//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// ActivityGallery.js

// ---------------------------------------------------------
// ActivityGallery control
function ActivityGallery(categories) {
    // fires notification when selected category changes
    this.onSelectionChangedHandlers = {};
    this.init(categories);
}

ActivityGallery.prototype.init = function (categories) {
    this.categories = categories;
    this.$element = null;
}

ActivityGallery.prototype.addSelectionChangedHandler = function (name, handler) {
    this.onSelectionChangedHandlers[name] = handler;
}

ActivityGallery.prototype.removeSelectionChangedHandler = function (name) {
    this.onSelectionChangedHandlers[name] = undefined;
}

ActivityGallery.prototype.fireSelectionChanged = function (categoryID, itemID) {
    for (var name in this.onSelectionChangedHandlers) {
        var handler = this.onSelectionChangedHandlers[name];
        if (typeof (handler) == "function") {
            handler(categoryID, itemID);
        }
    }
}

ActivityGallery.prototype.render = function ($element, categories) {
    if (categories != null) {
        this.init(categories);
    }
    $element.empty();
    this.$element = $('<ul class="nav nav-pills nav-stacked" />').appendTo($element);
    for (var id in this.categories) {
        var category = this.categories[id];
        $category = $('<li class="position-relative"><a class="selector"><strong>&nbsp;' + category.Name + '</strong></a></li>').appendTo(this.$element);
        $category.find('strong').prepend(Control.Icons.forFolder(category));
        $category.data('control', this);
        $category.data('item', category);
        $category.click(function (e) {
            if ($(e.target).hasClass('selector') || $(e.target).parents('a').first().hasClass('selector')) {
                Control.get(this).categoryClicked($(this));
            }
            return true;
        });
        $('<div class="btn-dropdown absolute-right"></div>').appendTo($category);

        if (category.IsSelected()) { this.select($category, category); }
        this.renderItems($category, category);
    }
}

ActivityGallery.prototype.renderItems = function ($category, category) {
    var items = category.GetActivities();
    $itemList = $('<ul class="itemlist nav nav-pills nav-stacked" />').appendTo($category.parent());
    for (var id in items) {
        var item = items[id];
        if (item.IsGalleryActivity()) {
            $item = $('<li class="position-relative"><a class="selector"><span>&nbsp;' + item.Name + '</span></a></li>').appendTo($itemList);
            $item.find('span').prepend(Control.Icons.forItemType(ItemTypes.Activity));
            $item.data('control', this);
            $item.data('item', item);
            $item.click(function (e) {
                if ($(e.target).hasClass('selector') || $(e.target).parents('a').first().hasClass('selector')) {
                    Control.get(this).itemClicked($(this));
                }
                return true;
            });
            $('<div class="btn-dropdown absolute-right"></div>').appendTo($item);

            if (item.IsSelected(true)) { this.select($item, item); }
        }
    }
    if (category.IsExpanded()) { this.expand($category); }
    else { this.collapse($category); }
}

ActivityGallery.prototype.categoryClicked = function ($category) {
    var category = $category.data('item');
    this.toggle($category);
    this.select($category, category);
    this.fireSelectionChanged(category.ID);
}

ActivityGallery.prototype.itemClicked = function ($item) {
    var item = $item.data('item');
    this.select($item, item);
    this.fireSelectionChanged(item.FolderID, item.ID);
}

ActivityGallery.prototype.select = function ($item, item) {
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

ActivityGallery.prototype.deselect = function () {
    $control = this;
    $.each(this.$element.find('li'), function () {
        $(this).removeClass('active');
        $control.hideCommands($(this));
    });
}

ActivityGallery.prototype.expand = function ($category) {
    this.collapseAll($category);
    var category = $category.data('item');
    $category.addClass('expanded');
    category.Expand(true);
    $itemlist = $category.next('.itemlist');
    Control.expand($itemlist, 400);
    // must remove .collapse class for dropdown menu to not get clipped
    $itemlist.removeClass('collapse');
}

ActivityGallery.prototype.collapse = function ($category, delay) {
    var category = $category.data('item');
    $category.removeClass('expanded');
    category.Expand(false);
    Control.collapse($category.next('.itemlist'), delay);
}

ActivityGallery.prototype.collapseAll = function ($category) {
    $this = this;
    $.each($category.siblings('li'), function () {
        $this.collapse($(this));
    });
}

ActivityGallery.prototype.toggle = function ($category) {
    var expanded = $category.hasClass('expanded');
    if ($category.hasClass('active') && expanded) {
        this.collapse($category);
    } else if (!expanded) {
        this.expand($category);
    }
}

ActivityGallery.prototype.showCommands = function ($item, item) {
    if (item.IsGalleryCategory() || item.IsGalleryActivity()) {
        var $btnDropdown = $item.find('.btn-dropdown');
        $('<i class="icon-caret-down dropdown-toggle" data-toggle="dropdown"></i>').appendTo($btnDropdown);
        var $menu = $('<ul class="dropdown-menu pull-right" role="menu"></ul>').appendTo($btnDropdown);
        var $installBtn = $('<li><a href="#"><i class="icon-download"></i>&nbsp;Install</a></li>').appendTo($menu);
        $installBtn.click(function () { $(this).parents('li').first().data('item').Install(); });

        /* TODO: add support for sub-categories
        */
    }
}

ActivityGallery.prototype.hideCommands = function ($item) {
    var $btnDropdown = $item.find('.btn-dropdown');
    $btnDropdown.empty();
}
