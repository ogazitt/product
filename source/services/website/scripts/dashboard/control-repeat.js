//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// control-repeat.js

// ---------------------------------------------------------
// Control.Repeat static object
// This control is a stateful singleton, only one instance allowed at time
// Requires the RepeatControl.ascx to provide popup dialog template
//
Control.Repeat = {};
Control.Repeat.closeHandler = null; // set closeHandler to get called when repeat dialog is closed
Control.Repeat.disabled = false;           // set true to disable button

Control.Repeat.render = function Control$Repeat$render($element, item, field) {
    this.$element = $element;
    var $repeat = $('<label />').appendTo($element);
    $repeat.addClass(field.Class);
    var $btn = $('<a class="btn btn-repeat icon"><i class="icon-repeat"></i></a>').appendTo($repeat);
    $btn.data('item', item);
    $('<span></span>').appendTo($repeat);

    this.rrule = Recurrence.Extend(item.GetFieldValue(field));
    this.refresh($btn, item);
}
Control.Repeat.refresh = function Control$Repeat$refresh($element, item) {
    var title = 'Enable';
    if (this.rrule.IsEnabled()) {
        title = 'Edit';
        $element.addClass('btn-success');
    } else {
        $element.removeClass('btn-success');
    }
    if (Control.Repeat.disabled != true) {
        Control.tooltip($element, title);
        $element.unbind('click').click(function () {
            $(this).tooltip('hide');
            Control.Repeat.dialog($(this));
        });
    } else {
        $element.addClass('disabled');
    };
    $element.parent().find('span').html(this.rrule.Summary('Repeat?'));
}
Control.Repeat.dialog = function Control$Repeat$dialog($element) {
    var $dialog = $('#repeatDialog').children().clone();
    Control.popup($dialog, "Repeat",
        function () {   // OK
            Control.Repeat.updateItem($element, Control.Repeat.rrule);
            if (Control.Repeat.closeHandler != null) { Control.Repeat.closeHandler(true); }
        },
        function () {  // Cancel
            if (Control.Repeat.closeHandler != null) { Control.Repeat.closeHandler(false); }
        });
    this.init($element, $dialog);
}
Control.Repeat.updateItem = function Control$Repeat$update($element, rrule) {
    $element.parent().find('span').html(rrule.Summary());
    var item = $element.data('item');
    var field = $element.data('field');
    if (item.ID != null) {
        var copy = item.Copy();
        copy.SetFieldValue(FieldNames.Repeat, rrule.ToJson());
        item.Update(copy);
    } else {        // for test page (repeat.aspx)
        item.SetFieldValue(FieldNames.Repeat, rrule.ToJson());
    }
    this.refresh($element, item);
}
Control.Repeat.init = function Control$Repeat$init($element, $dialog) {
    var $disableBtn = $dialog.find('.btn-warning');
    var $frequency = $dialog.find('.repeat-frequency');
    var $interval = $dialog.find('.repeat-interval');
    var $weekdays = $dialog.find('.repeat-weekdays');
    var $bymonth = $dialog.find('.repeat-bymonth');
    var $daySelector = $bymonth.find('select');
    var $byyear = $dialog.find('.repeat-byyear');
    var $monthSelector = $byyear.find('select').first();
    var $dayMonthSelector = $byyear.find('select').last();

    // wire-up of events and behaviors
    $disableBtn.click(function () {
        Control.Repeat.rrule.Disable();
        Control.Repeat.recalc($dialog);
    });
    $frequency.change(function (e) {
        Control.Repeat.rrule.Frequency = $(this).val();
        Control.Repeat.recalc($dialog);
    });
    $interval.change(function (e) {
        if ($(this).val() == 0) {
            Control.Repeat.rrule.Disable();
        } else {
            Control.Repeat.rrule.Enable();
            Control.Repeat.rrule.Interval = parseInt($(this).val());
        }
        Control.Repeat.recalc($dialog);
    });
    $weekdays.find('label.checkbox').each(function () {
        $(this).click(function () {
            Control.Repeat.setWeekdays($weekdays);
            Control.Repeat.recalc($dialog);
        });
    });
    $daySelector.change(function (e) {
        Control.Repeat.rrule.NoMonthDays();
        var day = parseInt($(this).val());
        if (day > 0) { Control.Repeat.rrule.AddMonthDay(day); }
        Control.Repeat.recalc($dialog);
    });
    $monthSelector.change(function (e) {
        Control.Repeat.rrule.NoMonths();
        var month = parseInt($(this).val());
        if (month > 0) { Control.Repeat.rrule.AddMonth(month); }
        Control.Repeat.recalc($dialog);
    });
    $dayMonthSelector.change(function (e) {
        Control.Repeat.rrule.NoYearDays();
        var day = parseInt($(this).val());
        if (day > 0) { Control.Repeat.rrule.AddYearDay(day); }
        Control.Repeat.recalc($dialog);
    });

    // initialize frequency
    $frequency.val(this.rrule.Frequency);
    // initialize interval
    this.renderOptions($interval, 0, 30);
    $interval.val(this.rrule.IsEnabled() ? this.rrule.Interval : 0);
    // initialize days of week
    this.initWeekdays($dialog, this.rrule);

    // initialize bymonth
    this.renderOptions($daySelector, 0, 31);
    $daySelector.val(this.rrule.FirstMonthDay());
    // initialize byyear
    this.renderOptions($monthSelector, 0, 12, Recurrence.MonthLabels);
    $monthSelector.val(this.rrule.FirstMonth());
    this.renderOptions($dayMonthSelector, 0, 31);
    $dayMonthSelector.val(this.rrule.FirstYearDay());

    this.recalc($dialog);
}
Control.Repeat.recalc = function Control$Repeat$recalc($dialog) {
    var $disableBtn = $dialog.find('.btn-warning');
    var $frequency = $dialog.find('.repeat-frequency');
    var $interval = $dialog.find('.repeat-interval');
    var $weekdays = $dialog.find('.repeat-weekdays');
    var $bymonth = $dialog.find('.repeat-bymonth');
    var $byyear = $dialog.find('.repeat-byyear');

    $weekdays.hide();
    if (this.rrule.IsWeekly()) { $weekdays.show(); }
    $bymonth.hide();
    if (this.rrule.IsMonthly()) { $bymonth.show(); }
    $byyear.hide();
    if (this.rrule.IsYearly()) { $byyear.show(); }

    var $summary = $dialog.find('.repeat-summary');
    $summary.html(this.rrule.Summary());
    if (this.rrule.IsEnabled()) {
        $disableBtn.show();
        $summary.addClass('alert-success');
    } else {
        $disableBtn.hide();
        $interval.val(0);
        $summary.removeClass('alert-success');
    }
}
Control.Repeat.initWeekdays = function Control$Repeat$initWeekdays($dialog, rrule) {
    for (var day in Recurrence.WeekdayLabels) {
        var $day = $dialog.find('input[name="' + day + '"]').attr('checked', false);
        if (rrule != null && rrule.HasWeekday(parseInt(day))) { $day.attr('checked', true); }
    }
}
Control.Repeat.setWeekdays = function Control$Repeat$setWeekdays($weekdays) {
    this.rrule.ByDay = [];
    $weekdays.find('input[type="checkbox"]').each(function () {
        if ($(this).attr('checked') == 'checked') {
            Control.Repeat.rrule.AddWeekday(parseInt($(this).attr('name')));
        }
    });
}
Control.Repeat.renderOptions = function Control$Repeat$renderOptions($select, start, end, lookup) {
    $select.empty();
    for (var i = start; i <= end; i++) {
        var label = (i == 0) ? '---' : ((lookup == null) ? i : lookup[i-1]);
        $('<option value="' + i + '">' + label + '</option>').appendTo($select);
    }
}
