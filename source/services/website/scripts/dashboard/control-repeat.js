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
Control.Repeat.render = function Control$Repeat$render($element, item, field) {
    var $wrapper = $('<label class="checkbox"></label>').appendTo($element);
    $checkbox = $('<input type="checkbox" class="checkbox" />').appendTo($wrapper);
    $checkbox.addClass(field.Class);
    $checkbox.data('item', item);

    this.rrule = Recurrence.Extend(item.GetFieldValue(field));
    if (this.rrule.IsEnabled()) { $checkbox.attr('checked', 'checked'); }
    if (item.IsPaused()) { 
        if (this.rrule.IsEnabled()) {
            $checkbox.attr('title', 'Disable').tooltip(Control.noDelay);
            $wrapper.attr('title', 'Edit').tooltip(Control.noDelay);
        } else {
            $wrapper.attr('title', 'Enable').tooltip(Control.noDelay);
        }
    } else {
        $checkbox.attr('disabled', 'disabled'); 
    };

    $checkbox.change(function () { Control.Repeat.update($(this)); });
    $('<span>' + this.rrule.Summary() + '</span>').appendTo($wrapper);
}
Control.Repeat.update = function Control$Repeat$update($element) {
    $element.tooltip('hide');
    $element.parent().tooltip('hide');
    if ($element.attr('checked') == 'checked') {    // enable
        this.dialog($element);
    } else {
        if (event.offsetX > 20) {                   // edit current setting
            this.dialog($element);
        } else {                                    // disable
            this.rrule.Disable();
            this.updateItem($element, this.rrule);
        }
    }
}
Control.Repeat.dialog = function Control$Repeat$dialog($element) {
    var $dialog = $('.repeat-dialog').children().clone();
    Control.popup($dialog, "Repeat", 
        function () {   // OK
            Control.Repeat.rrule.Enable();
            Control.Repeat.updateItem($element, Control.Repeat.rrule);
        },
        function () {   // Cancel
            $element.attr('checked', Control.Repeat.rrule.IsEnabled());
        });
    this.init($element, $dialog);
}
Control.Repeat.updateItem = function Control$Repeat$update($element, rrule) {
    $element.parent().find('span').html(rrule.Summary());
    var item = $element.data('item');
    if (item.ID != null) {
        var copy = item.Copy();
        copy.SetFieldValue(FieldNames.Repeat, rrule.ToJson());
        item.Update(copy);
    } else {        // for test page
        item.SetFieldValue(FieldNames.Repeat, rrule.ToJson());
    }
}
Control.Repeat.init = function Control$Repeat$init($element, $dialog) {
    var $frequency = $dialog.find('.repeat-frequency');
    var $interval = $dialog.find('.repeat-interval');
    var $frequencyAddon = $dialog.find('.frequency.add-on');
    var $weekdays = $dialog.find('.repeat-weekdays');
    var $startdate = $dialog.find('.repeat-start-date');

    // wire-up of events and behaviors
    $frequency.change(function (e) {
        Control.Repeat.rrule.Frequency = $(this).val();
        var label = FrequencyLabels[Control.Repeat.rrule.Frequency];
        $frequencyAddon.html(label);
        Control.Repeat.recalc($dialog);
    });
    $interval.change(function (e) {
        Control.Repeat.rrule.Interval = $(this).val();
        Control.Repeat.recalc($dialog);
    });
    $weekdays.find('label.checkbox').each(function () {
        $(this).click(function () {
            Control.Repeat.setWeekdays($weekdays);
            Control.Repeat.recalc($dialog);
        });
    });
    $startdate.datepicker({ numberOfMonths: 1 });

    // initialize frequency
    $frequency.val(this.rrule.Frequency);
    $frequencyAddon.html(FrequencyLabels[this.rrule.Frequency]);
    // initialize interval
    $interval.val(this.rrule.Interval);
    // initialize days of week
    this.initWeekdays($dialog, this.rrule);

    // initialize start date
    //var startdate = $element.data('item').GetFieldValue(FieldNames.DueDate);
    //startdate = (startdate == null) ? Date.now() : startdate;
    $startdate.val(Control.DateFormat(Date.now(), 'shortDate'));

    this.recalc($dialog);
}
Control.Repeat.recalc = function Control$Repeat$recalc($dialog) {
    var $frequency = $dialog.find('.repeat-frequency');
    var $interval = $dialog.find('.repeat-interval');
    var $weekdays = $dialog.find('.repeat-weekdays');
    var $startdate = $dialog.find('.repeat-start-date');

    $weekdays.hide();
    $startdate.parents('.control-group').first().hide();
    if (this.rrule.IsWeekly()) { $weekdays.show(); }
    if (this.rrule.IsMonthly() || this.rrule.IsYearly()) {
        //$startdate.parents('.control-group').first().show();
    }

    $dialog.find('.repeat-summary').html(this.rrule.Summary(true));
}
Control.Repeat.initWeekdays = function Control$Repeat$initWeekdays($dialog, rrule) {
    for (var id in Weekdays) {
        var day = Weekdays[id];
        var $day = $dialog.find('input[name="' + day + '"]').attr('checked', false);
        if (rrule != null && rrule.HasDay(day)) { $day.attr('checked', true); }
    }
}
Control.Repeat.setWeekdays = function Control$Repeat$setWeekdays($weekdays) {
    this.rrule.ByDay = '';
    $weekdays.find('input[type="checkbox"]').each(function () {
        if ($(this).attr('checked') == 'checked') {
            Control.Repeat.rrule.AddDay($(this).attr('name'));
        }
    });
}
