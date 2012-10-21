//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// control-core.js
//
// Core control functions 
//      Control
//      Control.DateFormat

// ---------------------------------------------------------
// Control static object
// shared helpers used by controls
var Control = function Control$() { };

// use to add title and tooltip to elements (handles device vs. browser)
Control.tooltip = function Control$tooltip($element, title, placement) {
    $element.attr('title', title);
    $element.attr('caption', title);
    if (!Browser.IsDevice()) {
        var options = { delay: { show: 0, hide: 0} };
        if (placement != null) { options.placement = placement; }
        $element.tooltip(options);
    } 
}

// helper function for preventing event bubbling
Control.preventDefault = function Control$preventDefault(e) { e.preventDefault(); }

// helpers for creating and invoking a delegate
Control.delegate = function Control$delegate(object, funcName) {
    var delegate = { object: object, handler: funcName };
    delegate.invoke = function () { return this.object[this.handler](); };
    return delegate;
}

// get the control object associated with the element
Control.get = function Control$get(element) {
    return $(element).data('control');
}

// get first parent control that contains member
Control.findParent = function Control$findParent(control, member) {
    while (control.parentControl != null) {
        control = control.parentControl;
        if (control[member] != null) {
            return control;
        }
    }
    return null;
}

// expand an element
Control.expand = function Control$expand($element, delay) {
    var animate = !(isNaN(delay));
    if (animate == true) {
        if (Browser.IsMSIE()) {
            $element.collapse('show');
            $element.show('blind', { direction: 'vertical' }, delay);
        } else {
            $element.show('blind', { direction: 'vertical' }, delay,
                function () { $element.collapse('show'); } );
        }
    } else {
        $element.collapse('show');
    }
}
// collapse an element
Control.collapse = function Control$collapse($element, delay) {
    var animate = !(isNaN(delay));
    if (animate == true) {
        // animation doesn't work for collapse with bootstrap
        //$element.hide('blind', { direction: 'vertical' }, delay);
        $element.collapse('hide');   
    } else {
        $element.collapse('hide');
    }
}
// modal message
Control.alert = function Control$alert(message, header, handlerClose) {
    var $modalMessage = $('#modalMessage');
    if ($modalMessage.length == 0) {
        message.replace('<br/>', '\r');
        alert(message);
        if (handlerClose != null) { handlerClose(); }
    } else {
        if (header == null) { header = "Warning!"; }
        $modalMessage.find('.modal-header h3').html(header);
        $modalMessage.find('.modal-body p').html(message);
        $modalMessage.modal('show');
        if (handlerClose != null) {
            $modalMessage.find('.modal-header .close').unbind('click').click(function () { handlerClose(); });
            $modalMessage.find('.modal-footer .btn-primary').unbind('click').click(function () { handlerClose(); });
        }
    }
}
// modal prompt
Control.confirm = function Control$confirm(message, header, handlerOK, handlerCancel) {
    var $modalPrompt = $('#modalPrompt');
    if ($modalPrompt.length == 0) {
        message.replace('<br\>', '\r');
        if (confirm(message) == true) {
            if (handlerOK != null) { handlerOK(); }
        } else {
            if (handlerCancel != null) { handlerCancel(); }
        }
    } else {
        if (header == null) { header = 'Confirm?'; }
        $modalPrompt.find('.modal-header h3').html(header);
        $modalPrompt.find('.modal-body p').html(message);
        $modalPrompt.modal({ backdrop: 'static', keyboard: false });
        $modalPrompt.find('.modal-footer .btn-primary').unbind('click').click(function () {
            $modalPrompt.modal('hide');
            if (handlerOK != null) { handlerOK(); }
        });
        $modalPrompt.find('.modal-footer .btn-cancel').unbind('click').click(function () {
            $modalPrompt.modal('hide');
            if (handlerCancel != null) { handlerCancel(); }
        });
    }
}
// modal dialog
Control.popup = function Control$popup($dialog, header, handlerOK, handlerCancel) {
    var $modalPrompt = $('#modalPrompt');

    if ($modalPrompt.length == 0) {
        alert("Page requires modalPrompt control to support popup!");
    } else {
        $modalPrompt = $modalPrompt.clone();
        $modalPrompt.attr('id', 'modalPromptOpen');
        $modalPrompt = $modalPrompt.appendTo($('body'));
        if (header == null) { header = 'Input required.'; }
        $modalPrompt.find('.modal-header h3').html(header);
        $modalPrompt.find('.modal-body p').empty().append($dialog);
        $modalPrompt.modal({ backdrop: 'static', keyboard: false });

        $modalPrompt.find('.modal-footer .btn-primary').click(function () {
            $modalPrompt.modal('hide');
            var inputs = [];
            $.each($modalPrompt.find('.modal-body input'), function () {
                inputs.push($(this).val());
            });
            $.each($modalPrompt.find('.modal-body textarea'), function () {
                inputs.push($(this).val());
            });
            if (handlerOK != null) { handlerOK(inputs); }
            $('#modalPromptOpen').remove();
        });
        $modalPrompt.find('.modal-footer .btn-cancel').unbind('click').click(function () {
            $modalPrompt.modal('hide');
            if (handlerCancel != null) { handlerCancel(); }
            $('#modalPromptOpen').remove();
        });
    }
}
// modal dialog with spinning animation
// use delay > 0 to display animation for fixed time
// use delay == 0 to stop animation explicitly using Control.workingClose
Control.working = function Control$working(message, delay) {
    var $modalMessage = $('#modalMessage');
    if ($modalMessage.length == 1) {
        Control.$modalWorking = $modalMessage.clone();
        var spinner = new Spinner().spin();
        Control.$modalWorking.find('.modal-header h3').html(message);
        var $message = $('<center />').appendTo(Control.$modalWorking.find('.modal-body p').empty());
        $message.append(spinner.el).css('height', '16').css('padding-top','16px');
        Control.$modalWorking.find('.modal-header .close').hide();
        Control.$modalWorking.find('.modal-footer .btn-primary').hide();

        if (delay > 0) {
            var timeoutHandler = function () {
                window.clearTimeout(timeoutID);
                Control.workingClose();
            };
            var timeoutID = window.setTimeout(timeoutHandler, delay);
        }
        Control.$modalWorking.modal('show');
    }
}
Control.workingClose = function Control$workingClose() {
    if (Control.$modalWorking != null) {
        Control.$modalWorking.modal('hide');
        Control.$modalWorking.remove();
        Control.$modalWorking = null;
    }
}
// popover callout
//  $showElement is target element to show popover next to based on placement
//  $hideElement is optional element which when clicked in will hide the popover
//  top is optional override to adjust vertical position with respect to $showElement
Control.popover = function ($showElement, $hideElement, title, content, placement, top) {
    var hideArrow = (placement == 'center');
    placement = hideArrow ? 'right' : placement;
    $showElement.popover({ trigger: 'manual', title: title, content: content, placement: placement });
    $showElement.popover('show');
    if ($hideElement != null) {
        $hideElement.bind('click.popover', function () {
            Control.popoverClose($showElement);
            $hideElement.unbind('click.popover');
            return true;
        });
    }
    if (top != null) { $('body .popover').css('top', top); };
    if (hideArrow) { $('body .popover .arrow').hide(); }
    // popover title conflicts with tooltip title, set explicitly
    $('body .popover .popover-title').html(title);
}
Control.popoverClose = function ($element) {
    $element.popover('hide');
    $('body .popover').remove();
}

// ---------------------------------------------------------
// Control.DateFormat function for formatting dates and times
//
Control.DateFormat = function Control$DateFormat() {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
		    val = String(val);
		    len = len || 2;
		    while (val.length < len) val = "0" + val;
		    return val;
		};

    // regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
        var dF = Control.DateFormat;

        // cannot provide utc if skipping other args (use "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // allow setting utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
			    d: d,
			    dd: pad(d),
			    ddd: dF.i18n.dayNames[D],
			    dddd: dF.i18n.dayNames[D + 7],
			    m: m + 1,
			    mm: pad(m + 1),
			    mmm: dF.i18n.monthNames[m],
			    mmmm: dF.i18n.monthNames[m + 12],
			    yy: String(y).slice(2),
			    yyyy: y,
			    h: H % 12 || 12,
			    hh: pad(H % 12 || 12),
			    H: H,
			    HH: pad(H),
			    M: M,
			    MM: pad(M),
			    s: s,
			    ss: pad(s),
			    l: pad(L, 3),
			    L: pad(L > 99 ? Math.round(L / 10) : L),
			    t: H < 12 ? "a" : "p",
			    tt: H < 12 ? "am" : "pm",
			    T: H < 12 ? "A" : "P",
			    TT: H < 12 ? "AM" : "PM",
			    Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
			    o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
			    S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
} ();

// common format strings
Control.DateFormat.masks = {
    "default": "ddd, mmm dd, yyyy h:MM TT",
    shortDate: "mm/dd/yyyy",
    mediumDate: "ddd, mmm dd, yyyy",
    longDate: "mmmm d, yyyy",
    fullDate: "dddd, mmmm d, yyyy",
    shortTime: "h:MM TT",
    mediumTime: "h:MM:ss TT",
    longTime: "h:MM:ss TT Z",
    isoDate: "yyyy-mm-dd",
    isoTime: "HH:MM:ss",
    shortDateTime: "mm/dd/yyyy h:MM TT",
    isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// internationalization strings
Control.DateFormat.i18n = {
    dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
    monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

// extend Date object with format prototype
Date.prototype.format = function (mask, utc) {
    return Control.DateFormat(this, mask, utc);
};

// safely parse RFC3339 datetime format for downlevel browsers
Date.prototype.parseSafe = function (text) {
    var regexp = /(\d\d\d\d)(-)?(\d\d)(-)?(\d\d)(T)?(\d\d)(:)?(\d\d)(:)?(\d\d)(\.\d+)?(Z|([+-])(\d\d)(:)?(\d\d))/;

    if (text.toString().match(new RegExp(regexp))) {
        var d = text.match(new RegExp(regexp));
        var offset = 0;

        this.setUTCDate(1);
        this.setUTCFullYear(parseInt(d[1], 10));
        this.setUTCMonth(parseInt(d[3], 10) - 1);
        this.setUTCDate(parseInt(d[5], 10));
        this.setUTCHours(parseInt(d[7], 10));
        this.setUTCMinutes(parseInt(d[9], 10));
        this.setUTCSeconds(parseInt(d[11], 10));
        if (d[12])
            this.setUTCMilliseconds(parseFloat(d[12]) * 1000);
        else
            this.setUTCMilliseconds(0);
        if (d[13] != 'Z') {
            offset = (d[15] * 60) + parseInt(d[17], 10);
            offset *= ((d[14] == '-') ? -1 : 1);
            this.setTime(this.getTime() - offset * 60 * 1000);
        }
    }
    else {
        var dateObj = new Date(text);
        this.setTime(dateObj);
        //this.setTime(Date.parse(text));
    }
    return this;
};

Date.prototype.parseTime = function (timeString) {
    if (timeString == '') return null;

    var time = timeString.match(/^(\d+)(:(\d\d))?\s*((a|(p))m?)?$/i);
    if (time == null) return null;

    var hours = parseInt(time[1], 10);
    var pm = time[6];
    if (hours == 12 && !pm) {
        hours = 0;
    }
    else {
        hours += (hours < 12 && pm) ? 12 : 0;
    }

    var d = new Date();
    d.setHours(hours);
    d.setMinutes(parseInt(time[3], 10) || 0);
    d.setSeconds(0, 0);
    return d;
};

// static extensions to Date object for formatting date object and date strings
// format for DateTime given either string or date object
Date.formatSafe = function Date$formatSafe(date, mask) {
    if (date != null && typeof (date) == 'object') {
        return date.format(mask);
    }
    if (date != null && typeof (date) == 'string') {
        try {
            if (date.length == 0) { return null; }
            var dateObject = new Date().parseSafe(date);
            return dateObject.format(mask);
        } catch (e) {
            // if not a valid date, just return original string
        }
    }
    return date;
}
// format as UTC for storage given either string or date object
Date.formatUTC = function Date$formatUTC(date) {
    return Date.formatSafe(date, "isoUtcDateTime");
}