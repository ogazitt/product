using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BuiltSteady.Product.ServerEntities
{
    public static class TimeSpanExtensions
    {
        // rounding extensions
        // http://stackoverflow.com/questions/766626/is-there-a-better-way-in-c-sharp-to-round-a-datetime-to-the-nearest-5-seconds
        public static TimeSpan Round(this TimeSpan time, TimeSpan roundingInterval, MidpointRounding roundingType)
        {
            return new TimeSpan(
                Convert.ToInt64(Math.Round(
                    time.Ticks / (decimal)roundingInterval.Ticks,
                    roundingType
                )) * roundingInterval.Ticks
            );
        }

        public static TimeSpan Round(this TimeSpan time, TimeSpan roundingInterval)
        {
            return Round(time, roundingInterval, MidpointRounding.ToEven);
        }

        public static DateTime Round(this DateTime datetime, TimeSpan roundingInterval)
        {
            return new DateTime((datetime - DateTime.MinValue).Round(roundingInterval).Ticks);
        }

        // Omri's truncating extensions based on above
        public static TimeSpan Truncate(this TimeSpan time, TimeSpan truncatingInterval)
        {
            return new TimeSpan(time.Ticks / truncatingInterval.Ticks * truncatingInterval.Ticks);
        }

        public static DateTime Truncate(this DateTime datetime, TimeSpan truncatingInterval)
        {
            return new DateTime((datetime - DateTime.MinValue).Truncate(truncatingInterval).Ticks);
        }
    }
}
