//----------------------------------------------------------
// Copyright (C) BuiltSteady Inc. All rights reserved.
//----------------------------------------------------------
// Utilities.js

var Utilities = function Utilities$() { };

// parse a time from a string
// http://stackoverflow.com/a/2188651/1022922

Utilities.parseTime = function Utilities$parseTime(timeString) {
    if (timeString == '') return null;

    //var time = timeString.match(/(\d+)(:(\d\d))?\s*(p?)/i);
    var time = timeString.match(/^(\d+)(:(\d\d))?\s*((a|(p))m?)?$/i);
    if (time == null) return null;

    var hours = parseInt(time[1], 10);
    /*
    if (hours == 12 && !time[4]) {
    hours = 0;
    }
    else {
    hours += (hours < 12 && time[4]) ? 12 : 0;
    }
    */
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
