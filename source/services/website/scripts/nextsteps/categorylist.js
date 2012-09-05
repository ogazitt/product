//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// CategoryList.js

// ---------------------------------------------------------
// CategoryList control
function CategoryList(folders) {
    // fires notification when selected actionType changes
    this.onSelectionChangedHandlers = {};
    this.init(folders);
}

CategoryList.prototype.init = function (folders) {
    // display Category folders first
    this.folders = {};
    for (var id in folders) {
        if (folders[id].IsCategory()) {
            this.folders[id] = folders[id];
        }
    }
    // then display People and Places folders
    for (var id in folders) {
        if (!folders[id].IsCategory()) {
            this.folders[id] = folders[id];
        }
    }

    this.$element = null;
}

CategoryList.prototype.addSelectionChangedHandler = function (name, handler) {
    this.onSelectionChangedHandlers[name] = handler;
}

CategoryList.prototype.removeSelectionChangedHandler = function (name) {
    this.onSelectionChangedHandlers[name] = undefined;
}

CategoryList.prototype.fireSelectionChanged = function (actionType, userAction) {
    for (var name in this.onSelectionChangedHandlers) {
        var handler = this.onSelectionChangedHandlers[name];
        if (typeof (handler) == "function") {
            handler(actionType, userAction);
        }
    }
}

CategoryList.prototype.render = function ($element, folders) {
    if (folders != null) {
        $element.empty();
        this.init(folders);
        this.renderCategoryList($element, folders);
    }
    else if (this.$element == null) {
        this.renderCategoryList($element, this.folders);
    }
    else if ($element.find('.categorylist') == null) {
        this.$element.appendTo($element);
    }
    this.show();
    // select current category
    this.select(this.$currentFolder, this.currentFolder);
    this.fireSelectionChanged(this.currentFolder);
}

CategoryList.prototype.renderCategoryList = function ($element, folders) {
    this.$element = $('<ul class="nav nav-pills nav-stacked categorylist" />').appendTo($element);
    //Control.List.sortable(this.$element);
    this.$currentFolder = null;
    
    for (var id in this.folders) {
        var folder = this.folders[id];
        var folderName = Browser.IsMobile() ? '' : '&nbsp;' + folder.Name;
        $folder = $('<li><a><strong>' + folderName + '</strong></a></li>').appendTo(this.$element);
        $folder.data('control', this);
        $folder.data('item', folder);
        $folder.click(function () { Control.get(this).folderClicked($(this)); });
        $folder.find('strong').prepend(Control.Icons.forFolder(folder));
        if (this.currentFolder == null) {
            this.currentFolder = folder;
            this.$currentFolder = $folder;
        }
        if (this.currentFolder == folder) this.$currentFolder = $folder;
    }
}

CategoryList.prototype.folderClicked = function ($folder) {
    var folder = $folder.data('item');
    this.select($folder, folder);
    this.currentFolder = folder;
    this.$currentFolder = $folder;
    this.fireSelectionChanged(folder, true);  // signal that this was a user click
}

CategoryList.prototype.select = function ($item, item) {
    this.deselect();
    $item.addClass('active');
}

CategoryList.prototype.deselect = function () {
    this.$element.find('li').removeClass('active');
}

CategoryList.prototype.show = function () {
    if (this.$element != null) {
        this.$element.show();
    }
}

CategoryList.prototype.hide = function () {
    if (this.$element != null) {
        this.$element.hide();
    }
}
