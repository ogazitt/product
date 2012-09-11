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
    this.$element = $element;
    var $repeat = $('<label />').appendTo($element);
    $repeat.addClass(field.Class);
    var $btn = $('<a class="btn icon"><i class="icon-repeat"></i></a>').appendTo($repeat);
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
    if (!item.IsRunning()) {
        $element.attr('title', title).tooltip(Control.noDelay);
        $element.unbind('click').click(function () {
            $(this).tooltip('hide');
            Control.Repeat.dialog($(this));
        });
    } else {
        $element.addClass('disabled');
    };
    $element.parent().find('span').html(this.rrule.Summary());
}
Control.Repeat.dialog = function Control$Repeat$dialog($element) {
    var $dialog = $('.repeat-dialog').children().clone();
    Control.popup($dialog, "Repeat", 
        function () {   // OK
            Control.Repeat.updateItem($element, Control.Repeat.rrule);
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
        if ($(this).val() == 0) {
            Control.Repeat.rrule.Disable();
        } else {
            Control.Repeat.rrule.Enable();
            Control.Repeat.rrule.Interval = $(this).val();
        }
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
    $interval.val(this.rrule.IsEnabled() ? this.rrule.Interval : 0);
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
        $startdate.parents('.control-group').first().show();
    }

    var $summary = $dialog.find('.repeat-summary');
    $summary.html(this.rrule.Summary());
    this.rrule.IsEnabled() ? $summary.addClass('alert-success') : $summary.removeClass('alert-success');
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
