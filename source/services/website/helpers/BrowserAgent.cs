using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BuiltSteady.Product.Website.Helpers
{
    public enum DeviceType
    {
        // mobile devices
        iPhone = 1,
        iPad = 3,
        WinPhone = 5,
        // mask for mobile devices
        Mobile = 1, 
        // non-mobile devices
        PC = 2,
        Mac = 4,
        Unknown = 6
    }

    public class BrowserAgent
    {
        public const string iPhone = "iPhone";
        public const string iPad = "iPad";
        public const string WinPhone = "Windows Phone";
        public const string Mac = "Mac OS X";
        public const string PC = "Windows";
        public const string Unknown = "Unknown";

        public static bool IsMobile(string userAgent)
        {
            var deviceType = GetDeviceType(userAgent);
            return ((int) deviceType & (int) DeviceType.Mobile) > 0;
        }

        public static DeviceType GetDeviceType(string userAgent)
        {
            if (userAgent.Contains(iPhone))
                return DeviceType.iPhone;
            if (userAgent.Contains(iPad))
                return DeviceType.iPad;
            if (userAgent.Contains(WinPhone))
                return DeviceType.WinPhone;
            if (userAgent.Contains(Mac))
                return DeviceType.Mac;
            if (userAgent.Contains(PC))
                return DeviceType.PC;
            return DeviceType.Unknown;
        }
    }
}