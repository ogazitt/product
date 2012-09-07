using System;
#if CLIENT
using BuiltSteady.Product.Devices.ClientEntities;
#else
using BuiltSteady.Product.ServerEntities;
#endif

namespace BuiltSteady.Product.Shared.Entities
{

    // ************************************************************************
    // Shared Json objects
    //
    // These are objects that are serialized and stored as Json within
    // the FieldValues of Items and can be accessed on server or client
    //
    // ************************************************************************

    public struct JsonWebLink
    {
        public string Name;
        public string Url;
    }

    public class JsonRecurrence
    {
        public string Frequency;    // "DAILY", "WEEKLY", "MONTHLY", "YEARLY"
        public int Interval;        // every nth frequency, valid for all frequencies

        public string ByDay;        // "SU, MO, TU, WE, TH, FR, SA"
                                    // weekly:  "TU, TH"    (Tues and Thurs of week)
                                    // monthly: "1SU, -1SU" (1st and last Sunday of month)

        public string ByMonthDay;   // monthly: "15, -1"    (15th and last day of month)

        public string ByYearDay;    // yearly:  "30, 180"   (30th and 180th days of year)
        public string ByWeekNo;     // yearly:  "5, -2"     (5th and 2nd to last week of year)
        public string ByMonth;      // yearly:  "4, 10"     (April and October)
    }

    // Examples for JsonRecurrence
    // { Frequency: "DAILY",                                Interval: 5 }
    // { Frequency: "WEEKLY",   ByDay: "TU, TH",            Interval: 2 }
    // { Frequency: "MONTHLY",  ByDay: "1SU, -1SU",         Interval: 1 }
    // { Frequency: "MONTHLY",  ByMonthDay: "1, 15, -1",    Interval: 1 }
    // { Frequency: "YEARLY",   ByYearDay: "50, 180, -50",  Interval: 1 }
    // { Frequency: "YEARLY",   ByWeekNo: "10, 30, -10",    Interval: 1 }
    // { Frequency: "YEARLY",   ByMonth: "4, 10",           Interval: 1 }


    public class Frequency
    {
        public const string Daily = "DAILY";
        public const string Weekly = "WEEKLY";
        public const string Monthly = "MONTHLY";
        public const string Yearly = "YEARLY";
    }

    public class Weekdays
    {
        public const string Sunday = "SU";
        public const string Monday = "MO";
        public const string Tuesday = "TU";
        public const string Wednesday = "WE";
        public const string Thursday = "TH";
        public const string Friday = "FR";
        public const string Saturday = "SA";
    }

}