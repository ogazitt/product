using System;
#if CLIENT
using BuiltSteady.Product.Devices.ClientEntities;
#else
using BuiltSteady.Product.ServerEntities;
#endif

namespace BuiltSteady.Product.Shared.Entities
{
    // ************************************************************************
    // Shared ClientItems
    //
    // These are strongly typed classes that wrap an Item using an ItemAccessor
    // These items are stored in the $Client folder and are accessible on
    // both client and server
    //
    // NOTE: metadata properties should only be accessible on server
    // ************************************************************************
     
    public class UserProfile
    {
        public class FieldNames
        {
            public const string FirstName = "FirstName";
            public const string LastName = "LastName";
            public const string Gender = "Gender";
            public const string Picture = "Picture";
            public const string Birthday = "Birthday";
            public const string Mobile = "Mobile";
            public const string Address = "Address";
            public const string GeoLocation = "Location";
            public const string Timezone = "Timezone";
            public const string TimezoneHoursOffset = "TimezoneHoursOffset";
            public const string FacebookID = "FacebookID";
        }

        ItemAccessor accessor;
        public UserProfile(Item item)
        {
            this.accessor = new ItemAccessor(item);
        }

        public string FirstName
        {
            get { return accessor.Get(UserProfile.FieldNames.FirstName); }
            set { accessor.Set(UserProfile.FieldNames.FirstName, value); }
        }

        public string LastName
        {
            get { return accessor.Get(UserProfile.FieldNames.LastName); }
            set { accessor.Set(UserProfile.FieldNames.LastName, value); }
        }

        public string Gender
        {
            get { return accessor.Get(UserProfile.FieldNames.Gender); }
            set { accessor.Set(UserProfile.FieldNames.Gender, value); }
        }

        public string Picture
        {
            get { return accessor.Get(UserProfile.FieldNames.Picture); }
            set { accessor.Set(UserProfile.FieldNames.Picture, value); }
        }

        public string Birthday
        {   // TODO: should this be DateTime (string supports MM/dd which is not a valid date)
            get { return accessor.Get(UserProfile.FieldNames.Birthday); }
            set { accessor.Set(UserProfile.FieldNames.Birthday, value); }
        }

        public string Mobile
        {
            get { return accessor.Get(UserProfile.FieldNames.Mobile); }
            set { accessor.Set(UserProfile.FieldNames.Mobile, value); }
        }

        public string Address
        {
            get { return accessor.Get(UserProfile.FieldNames.Address); }
            set { accessor.Set(UserProfile.FieldNames.Address, value); }
        }

        public string GeoLocation
        {
            get { return accessor.Get(UserProfile.FieldNames.GeoLocation); }
            set { accessor.Set(UserProfile.FieldNames.GeoLocation, value); }
        }

        public string Timezone
        {
            get { return accessor.Get(UserProfile.FieldNames.Timezone); }
            set { accessor.Set(UserProfile.FieldNames.Timezone, value); }
        }

        public string TimezoneHoursOffset
        {
            get { return accessor.Get(UserProfile.FieldNames.TimezoneHoursOffset); }
            set { accessor.Set(UserProfile.FieldNames.TimezoneHoursOffset, value); }
        }

#if !CLIENT
        // ********************************************************************
        // server can create and access metadata for UserProfile
        // ********************************************************************

        ItemAccessor metadata;
        public UserProfile(Item item, Item metaItem) : this(item)
        {
            this.metadata = new ItemAccessor(metaItem);
        }

        public string FacebookID
        {
            get { return metadata.Get(UserProfile.FieldNames.FacebookID); }
            set { metadata.Set(UserProfile.FieldNames.FacebookID, value); }
        }

#endif

    }

    public class CalendarSettings
    {
        public class FieldNames
        {
            public const string CalendarProvider = "CalendarProvider";
            public const string CalendarID = "CalendarID";
            public const string LastSync = "LastSync";
            public const string NextStepsEventID = "NextStepsEventID";
        }

        public const string Google = "Google";
        public const string WindowsLive = "WindowsLive";

        ItemAccessor accessor;
        public CalendarSettings(Item item)
        {
            this.accessor = new ItemAccessor(item);
        }

        public string CalendarProvider
        {   // Google or WindowsLive
            get { return accessor.Get(CalendarSettings.FieldNames.CalendarProvider); }
            set { accessor.Set(CalendarSettings.FieldNames.CalendarProvider, value); }
        }

        public string CalendarID
        {
            get { return accessor.Get(CalendarSettings.FieldNames.CalendarID); }
            set { accessor.Set(CalendarSettings.FieldNames.CalendarID, value); }
        }

#if !CLIENT
        // ********************************************************************
        // server can create and access metadata for UserProfile
        // ********************************************************************

        ItemAccessor metadata;
        public CalendarSettings(Item item, Item metaItem) : this(item)
        {
            this.metadata = new ItemAccessor(metaItem);
        }

        public DateTime? LastSync
        {
            get { return metadata.GetNullableDate(CalendarSettings.FieldNames.LastSync); }
            set { metadata.SetDate(CalendarSettings.FieldNames.LastSync, (DateTime)value); }
        }

        public string NextStepsEventID
        {
            get { return metadata.Get(CalendarSettings.FieldNames.NextStepsEventID); }
            set { metadata.Set(CalendarSettings.FieldNames.NextStepsEventID, value); }
        }
#endif

    }

}