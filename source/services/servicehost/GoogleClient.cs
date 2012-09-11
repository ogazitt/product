using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Xml;

using BuiltSteady.Product.ServerEntities;

using DotNetOpenAuth.Messaging;
using DotNetOpenAuth.OAuth2;
using Google.Apis.Authentication.OAuth2;
using Google.Apis.Calendar.v3;
using Google.Apis.Calendar.v3.Data;
using BuiltSteady.Product.Shared.Entities;

namespace BuiltSteady.Product.ServiceHost
{
    public class GoogleClient
    {
        const string ExtensionItemID = "ZapItemID";
        //const string GadgetIconPath = "/content/images/zaplogo.png";

        User user;
        UserStorageContext storage;
        OAuth2Authenticator<WebServerClient> googleAuthenticator;
        CalendarService calService;
        Settings calSettings;
        string userCalendar;

        public GoogleClient()
        {   // for getting initial tokens
            this.googleAuthenticator = CreateGoogleAuthenticator(GetGoogleTokens);
        }

        public GoogleClient(User user, UserStorageContext storage)
        {   // for using existing access token with renewal
            this.user = user;
            this.storage = storage;
            if (user.UserCredentials == null || user.UserCredentials.Count == 0)
            {   // ensure UserCredentials are present
                this.user = storage.GetUser(user.ID, true);
            }
            UserCredential googleConsent = this.user.GetCredential(UserCredential.GoogleConsent);
            if (googleConsent != null)
            {
                this.googleAuthenticator = CreateGoogleAuthenticator(GetAccessToken);
            }
        }

        public OAuth2Authenticator<WebServerClient> Authenticator
        {
            get { return googleAuthenticator; }
        }

        public bool ConnectToCalendar
        {   // TODO: add setting that allows user to opt-in or out
            get { return (Authenticator != null); }
        }

        public CalendarService CalendarService
        {
            get 
            {
                if (calService == null)
                {
                    calService = new CalendarService(googleAuthenticator);
                }
                return calService;
            }
        }

        public IList<CalendarListEntry> UserCalendars
        {
            get
            {
                CalendarListResource.ListRequest calListReq = this.CalendarService.CalendarList.List();
                CalendarList calList = calListReq.Fetch();
                return calList.Items;
            }
        }

        // get the ID for the user calendar to manage
        // TODO: allow user to choose this in ClientSettings
        public string UserCalendar
        {
            get
            {
                if (userCalendar == null)
                {
                    CalendarSettings calendarSettings = storage.ClientFolder.GetCalendarSettings(user);
                    if (calendarSettings != null)
                    {
                        if (calendarSettings.CalendarID == null)
                        {   // find best candidate in list of user calendars
                            var userCalendars = UserCalendars;
                            foreach (var cal in userCalendars)
                            {
                                if (cal.AccessRole == "owner")
                                {   // must have owner access
                                    if (user.Email.Equals(cal.Id, StringComparison.OrdinalIgnoreCase))
                                    {   // user.email matches calendar id (this is best match)
                                        userCalendar = cal.Id;
                                        break;
                                    }
                                    if (user.Email.Equals(cal.Summary, StringComparison.OrdinalIgnoreCase))
                                    {   // user.email matches calendar summary (this is next best match)
                                        userCalendar = cal.Id;
                                    }
                                    if (userCalendar == null)
                                    {   // use first owner calendar if user.email cannot be matched
                                        userCalendar = cal.Id;
                                    }
                                }
                            }
                            // save CalendarID
                            calendarSettings.CalendarID = userCalendar;
                            storage.SaveChanges();
                        }
                        userCalendar = calendarSettings.CalendarID;
                    }
                }
                return userCalendar;
            }
        }

        public Settings CalendarSettings
        {
            get
            {
                if (calSettings == null)
                {
                    SettingsResource.ListRequest calSettingReq = this.CalendarService.Settings.List();
                    calSettings = calSettingReq.Fetch();
                }
                return calSettings;
            }
        }

        public bool GetUserInfo(User user, UserStorageContext storage)
        {
            // store user information from Facebook in UserProfile
            UserProfile userProfile = storage.ClientFolder.GetUserProfile(user);
            if (userProfile == null)
            {
                TraceLog.TraceError("Could not access UserProfile to import Google information into.");
                return false;
            }

            try
            {   // import information about the current user
                var settings = this.CalendarSettings;
                if (userProfile.Timezone == null)
                {
                    var olsonTZ = settings.Items.FirstOrDefault(i => i.Id == "timezone").Value;
                    userProfile.Timezone = OlsonTimeZoneToTimeZoneInfo(olsonTZ).Id;
                }
                storage.SaveChanges();
                TraceLog.TraceInfo("Imported Google information into UserProfile");
            }
            catch (Exception ex)
            {
                TraceLog.TraceException("Google query for basic User information failed", ex);
                return false;
            }
            return true;
        }

        public List<Event> GetCalendarEvents(bool onlyZapEvents = true, DateTime? utcStartTime = null, DateTime? utcEndTime = null)
        {   // by default, filters events to past month and next 3 months
            if (utcStartTime == null) { utcStartTime = DateTime.UtcNow.AddDays(-30); }
            if (utcEndTime == null) { utcEndTime = DateTime.UtcNow.AddDays(90); }

            EventsResource.ListRequest eventListReq = this.CalendarService.Events.List(UserCalendar);
            eventListReq.TimeMin = XmlConvert.ToString(utcStartTime.Value, XmlDateTimeSerializationMode.Utc);
            eventListReq.TimeMax = XmlConvert.ToString(utcEndTime.Value, XmlDateTimeSerializationMode.Utc);
            Events events = eventListReq.Fetch();

            if (onlyZapEvents)
            {
                List<Event> zapEvents = events.Items.Where(e =>
                    e.ExtendedProperties != null && e.ExtendedProperties.Private != null &&
                    e.ExtendedProperties.Private.ContainsKey(ExtensionItemID)).ToList();
                return zapEvents;
            }

            return new List<Event>(events.Items);
        }

        public Event GetCalendarEvent(string id)
        {
            Event calEvent = null;
            try
            {
                EventsResource.GetRequest eventGetReq = this.CalendarService.Events.Get(UserCalendar, id);
                calEvent = eventGetReq.Fetch();
            }
            catch (Exception e)
            {
                TraceLog.TraceException(string.Format("Could not get Calendar event with id: '{0}'", id), e);
            }
            return calEvent;
        }

        public int SynchronizeCalendar()
        {
            int itemsUpdated = 0;
            if (ConnectToCalendar)
            {
                CalendarSettings calendarSettings = storage.ClientFolder.GetCalendarSettings(user);
                if (calendarSettings != null)
                {
                    DateTime lastSyncTime;
                    if (calendarSettings.LastSync == null)
                    {   // first-time, use consent token last modified date
                        UserCredential googleConsent = user.GetCredential(UserCredential.GoogleConsent);
                        lastSyncTime = googleConsent.LastModified;
                    }
                    else
                    {
                        lastSyncTime = (DateTime)calendarSettings.LastSync;
                    }
                    calendarSettings.LastSync = DateTime.UtcNow;
                    itemsUpdated = SynchronizeCalendar(lastSyncTime);
                }
            }
            return itemsUpdated;
        }

        int SynchronizeCalendar(DateTime utcModifiedAfter)
        {
            int itemsUpdated = 0;
            try
            {
                var modifiedEvents = GetModifiedCalendarEvents(utcModifiedAfter);
                foreach (Event e in modifiedEvents)
                {
                    Guid itemID = new Guid(e.ExtendedProperties.Private[ExtensionItemID]);
                    Item item = storage.GetItem(user, itemID);
                    if (item != null)
                    {   // Name, DueDate, EndDate, and Description (support Location?)
                        item.Name = e.Summary;
                        item.GetFieldValue(FieldNames.DueDate).Value = e.Start.DateTime;
                        item.GetFieldValue(FieldNames.EndDate).Value = e.End.DateTime;
                        FieldValue fvDescription = item.GetFieldValue(FieldNames.Description, (e.Description != null));
                        if (fvDescription != null) { fvDescription.Value = e.Description; }
                        itemsUpdated++;
                    }
                }
                if (itemsUpdated > 0) { storage.SaveChanges(); }
            }
            catch (Exception e)
            {
                TraceLog.TraceException("Could not get modified Calendar events", e);
            }
            return itemsUpdated;
        }

        List<Event> GetModifiedCalendarEvents(DateTime utcModifiedAfter)
        {
            EventsResource.ListRequest eventListReq = this.CalendarService.Events.List(UserCalendar);
            eventListReq.UpdatedMin = XmlConvert.ToString(utcModifiedAfter, XmlDateTimeSerializationMode.Utc);
            Events events = eventListReq.Fetch();
            if (events.Items != null)
            {
                return events.Items.Where(e =>
                e.ExtendedProperties != null && e.ExtendedProperties.Private != null &&
                e.ExtendedProperties.Private.ContainsKey(ExtensionItemID)).ToList();
            }
            return new List<Event>();
        }

        public bool AddCalendarEvent(Item item)
        {
            DateTime utcStartTime, utcEndTime;
            FieldValue fvStartTime = item.GetFieldValue(FieldNames.DueDate);
            FieldValue fvEndTime = item.GetFieldValue(FieldNames.EndDate);
            if (fvStartTime != null && !string.IsNullOrEmpty(fvStartTime.Value) &&
                fvEndTime != null && !string.IsNullOrEmpty(fvEndTime.Value) &&
                DateTime.TryParse(fvStartTime.Value, out utcStartTime) &&
                DateTime.TryParse(fvEndTime.Value, out utcEndTime))
            {
                Event calEvent = new Event()
                {
                    Summary = item.Name,
                    Start = new EventDateTime() { DateTime = XmlConvert.ToString(utcStartTime, XmlDateTimeSerializationMode.Utc) },
                    End = new EventDateTime() { DateTime = XmlConvert.ToString(utcEndTime, XmlDateTimeSerializationMode.Utc) },
                    ExtendedProperties = new Event.ExtendedPropertiesData(),
                };
                // add item id as private extended property for event
                calEvent.ExtendedProperties.Private = new Event.ExtendedPropertiesData.PrivateData();
                calEvent.ExtendedProperties.Private.Add(ExtensionItemID, item.ID.ToString());

                FieldValue fvDescription = item.GetFieldValue(FieldNames.Description);
                if (fvDescription != null && !string.IsNullOrEmpty(fvDescription.Value))
                {
                    calEvent.Description = fvDescription.Value;
                }

                // TODO: investigate using Gadget to support link back to product

                try
                {
                    EventsResource.InsertRequest eventInsertReq = this.CalendarService.Events.Insert(calEvent, UserCalendar);
                    Event result = eventInsertReq.Fetch();

                    if (result.HtmlLink != null)
                    {   // add event HtmlLink as a WebLink in item
                        FieldValue fvWebLinks = item.GetFieldValue(FieldNames.WebLinks, true);
                        JsonWebLink webLink = new JsonWebLink() { Name = "Calendar Event", Url = result.HtmlLink };
                        List<JsonWebLink> webLinks = (string.IsNullOrEmpty(fvWebLinks.Value)) ?
                            new List<JsonWebLink>() : JsonSerializer.Deserialize<List<JsonWebLink>>(fvWebLinks.Value);
                        //var webLink = new { Name = "Calendar Event", Url = result.HtmlLink };
                        //var webLinks = (string.IsNullOrEmpty(fvWebLinks.Value)) ?
                        //    new List<object>() : JsonSerializer.Deserialize<List<object>>(fvWebLinks.Value);
                        webLinks.Add(webLink);
                        fvWebLinks.Value = JsonSerializer.Serialize(webLinks);
                    }

                    // add event id to UserFolder EntityRefs for item
                    Item metaItem = storage.UserFolder.GetEntityRef(user, item);
                    FieldValue fvCalEventID = metaItem.GetFieldValue(ExtendedFieldNames.CalEventID, true);
                    fvCalEventID.Value = result.Id;
                    storage.SaveChanges();
                    return true;
                }
                catch (Exception e)
                {
                    TraceLog.TraceException("Could not add appointment to Calendar", e);
                }
            }
            return false;
        }

        public Item AddCalendarEvent(Appointment appt)
        {
            DateTime utcStartTime, utcEndTime;
            if (DateTime.TryParse(appt.StartTime, out utcStartTime) &&
                DateTime.TryParse(appt.EndTime, out utcEndTime))
            {
                var item = storage.GetItem(this.user, appt.ItemID);

                Event calEvent = new Event()
                {
                    Summary = appt.Name,
                    Start = new EventDateTime() { DateTime = XmlConvert.ToString(utcStartTime, XmlDateTimeSerializationMode.Utc) },
                    End = new EventDateTime() { DateTime = XmlConvert.ToString(utcEndTime, XmlDateTimeSerializationMode.Utc) },
                    Description = appt.Notes,
                    ExtendedProperties = new Event.ExtendedPropertiesData(),
                };
                // add item id as private extended property for event
                if (item != null)
                {
                    calEvent.ExtendedProperties.Private = new Event.ExtendedPropertiesData.PrivateData();
                    calEvent.ExtendedProperties.Private.Add(ExtensionItemID, item.ID.ToString());
                }

                // TODO: investigate using Gadget to support link back to product

                try
                {
                    EventsResource.InsertRequest eventInsertReq = this.CalendarService.Events.Insert(calEvent, UserCalendar);
                    Event result = eventInsertReq.Fetch();

                    if (result.HtmlLink != null && item != null)
                    {   // add event HtmlLink as a WebLink in item

                        FieldValue fvWebLinks = item.GetFieldValue(FieldNames.WebLinks, true);
                        JsonWebLink webLink = new JsonWebLink() { Name = "Calendar Event", Url = result.HtmlLink };
                        List<JsonWebLink> webLinks = (string.IsNullOrEmpty(fvWebLinks.Value)) ?
                            new List<JsonWebLink>() : JsonSerializer.Deserialize<List<JsonWebLink>>(fvWebLinks.Value);
                        //var webLink = new { Name = "Calendar Event", Url = result.HtmlLink };
                        //var webLinks = (string.IsNullOrEmpty(fvWebLinks.Value)) ?
                        //    new List<object>() : JsonSerializer.Deserialize<List<object>>(fvWebLinks.Value);
                        webLinks.Add(webLink);
                        fvWebLinks.Value = JsonSerializer.Serialize(webLinks);
                    }

                    // add event id to UserFolder EntityRefs for item
                    //Item metaItem = storage.UserFolder.GetEntityRef(user, item);
                    //FieldValue fvCalEventID = metaItem.GetFieldValue(ExtendedFieldNames.CalEventID, true);
                    //fvCalEventID.Value = result.Id;
                    storage.SaveChanges();
                    return item;
                }
                catch (Exception e)
                {
                    TraceLog.TraceException("Could not add appointment to Calendar", e);
                }
            }
            return null;
        }

        public bool UpdateCalendarEvent(Item item)
        {   // assumes check for changes was made before
            FieldValue fvStartTime = item.GetFieldValue(FieldNames.DueDate);
            FieldValue fvEndTime = item.GetFieldValue(FieldNames.EndDate);
            if (fvStartTime != null && !string.IsNullOrEmpty(fvStartTime.Value) &&
                fvEndTime != null && !string.IsNullOrEmpty(fvEndTime.Value))
            {
                DateTime utcStartTime, utcEndTime;
                if (DateTime.TryParse(fvStartTime.Value, out utcStartTime) && DateTime.TryParse(fvEndTime.Value, out utcEndTime))
                {
                    Item metaItem = storage.UserFolder.GetEntityRef(user, item);
                    FieldValue fvCalEventID = metaItem.GetFieldValue(ExtendedFieldNames.CalEventID, true);
                    if (string.IsNullOrEmpty(fvCalEventID.Value))
                    {   // add CalendarEvent for this Item
                        return AddCalendarEvent(item);
                    }
                    else
                    {
                        Event calEvent = GetCalendarEvent(fvCalEventID.Value);
                        if (calEvent == null)
                        {   // may have been deleted, add another CalendarEvent for modified Item
                            return AddCalendarEvent(item);
                        }
                        else
                        {   // update existing CalendarEvent
                            TimeSpan duration = utcEndTime - utcStartTime;
                            if (duration.TotalMinutes >= 0)
                            {   // ensure startTime is BEFORE endTime
                                calEvent.Summary = item.Name;
                                calEvent.Start.DateTime = XmlConvert.ToString(utcStartTime, XmlDateTimeSerializationMode.Utc);
                                calEvent.End.DateTime = XmlConvert.ToString(utcEndTime, XmlDateTimeSerializationMode.Utc);
                                FieldValue fvDescription = item.GetFieldValue(FieldNames.Description);
                                if (fvDescription != null) { calEvent.Description = fvDescription.Value; }
     
                                if (calEvent.Status == "cancelled") { calEvent.Status = "confirmed"; }
                                try
                                {
                                    EventsResource.PatchRequest eventPatchReq = this.CalendarService.Events.Patch(calEvent, UserCalendar, calEvent.Id);
                                    Event updatedCalEvent = eventPatchReq.Fetch();
                                    return true;
                                }
                                catch (Exception e)
                                {
                                    TraceLog.TraceException("Could not update appointment to Calendar", e);
                                }
                            }
                        }
                    }
                }
            }
            return false;
        }

        public bool RemoveCalendarEvent(Item item)
        {   // remove CalendarEvent
            Item metaItem = storage.UserFolder.GetEntityRef(user, item);
            FieldValue fvCalEventID = metaItem.GetFieldValue(ExtendedFieldNames.CalEventID, true);
            if (!string.IsNullOrEmpty(fvCalEventID.Value))
            {   // CalendarEvent has been added for this Item
                try
                {                
                    Event calEvent = GetCalendarEvent(fvCalEventID.Value);
                    if (calEvent != null)
                    {   // remove existing CalendarEvent
                        EventsResource.DeleteRequest eventDeleteReq = this.CalendarService.Events.Delete(UserCalendar, calEvent.Id);
                        string result = eventDeleteReq.Fetch();
                        // EntityRef holding association will get cleaned up when Item is deleted
                        return (result == string.Empty);
                    }
                }
                catch (Exception e)
                {
                    TraceLog.TraceException("Could not remove appointment from Calendar", e);
                }
            }
            return false;
        }

        public class StepInfo
        {
            public string Name { get; set; }
            public DateTime Date { get; set; }
        }
        
        public bool AddNextStepsEvent(DateTime? utcStartTime, string desc = null)
        {
            // store user information from Facebook in UserProfile
            UserProfile userProfile = storage.ClientFolder.GetUserProfile(user);
            if (userProfile == null)
            {
                TraceLog.TraceError("Could not access UserProfile to import Google information into.");
                return false;
            }

            // get offset of user's timezone from UTC
            var tzinfo = TimeZoneInfo.FindSystemTimeZoneById(userProfile.Timezone);
            var utcOffset = tzinfo.GetUtcOffset(DateTime.UtcNow);

            // get the start date and adjust for the user's local timezone
            utcStartTime = utcStartTime.HasValue ? utcStartTime.Value.Date : (DateTime.UtcNow + utcOffset).Date;

            DateTime utcEndTime = utcStartTime.Value + TimeSpan.FromDays(1d);
            const string nextStepsAppointmentName = @"Next Steps";
            const string nextStepsLinkText = @"View Next Steps: ";
            string url = HostEnvironment.PublicUrl + "/nextsteps\n";

            Event calEvent = new Event()
            {
                Summary = nextStepsAppointmentName,
                Start = new EventDateTime() { Date = utcStartTime.Value.ToString("yyyy-MM-dd") },
                End = new EventDateTime() { Date = utcEndTime.ToString("yyyy-MM-dd") },
                Reminders = new Event.RemindersData() 
                { 
                    UseDefault = false,
                    Overrides = new List<EventReminder>() 
                    { 
                        new EventReminder() { Method = "popup", Minutes = 0 /* can't have negative values to move to 6am */ }, 
                        new EventReminder() { Method = "sms", Minutes = 0 }, 
                    } 
                }
            };
            calEvent.Description = nextStepsLinkText + url;
            if (desc != null)
                calEvent.Description += desc;

            try
            {
                // execute request
                EventsResource.InsertRequest eventInsertReq = this.CalendarService.Events.Insert(calEvent, UserCalendar);
                Event result = eventInsertReq.Fetch();

                // store the event ID in the calendar settings
                CalendarSettings calendarSettings = storage.ClientFolder.GetCalendarSettings(user);
                if (calendarSettings != null)
                    calendarSettings.NextStepsEventID = result.Id;
                storage.SaveChanges();
            }
            catch (Exception ex)
            {
                TraceLog.TraceException("Could not add Next Steps appointment to Calendar", ex);
                return false;
            }
            return true;
        }

        public bool UpdateNextStepsEvent(DateTime? utcStartTime)
        {
            CalendarSettings calendarSettings = storage.ClientFolder.GetCalendarSettings(user);
            if (calendarSettings == null)
                return false;

            try
            {
                // remove the existing next steps event
                if (!String.IsNullOrEmpty(calendarSettings.NextStepsEventID))
                {
                    var request = this.CalendarService.Events.Delete(calendarSettings.CalendarID, calendarSettings.NextStepsEventID);
                    var result = request.Fetch();
                }

                // create the new next steps event
                return AddNextStepsEvent(utcStartTime);
            }
            catch (Exception ex)
            {
                TraceLog.TraceException("Updating Next Steps event failed", ex);
                return false;
            }
        }

        public void ForceAuthentication()
        {   // attempt to access Calendar settings to force authentication
            SettingsResource.ListRequest calSettingReq = this.CalendarService.Settings.List();
            calSettingReq.Fetch();
        }

        IAuthorizationState GetAccessToken(WebServerClient client)
        {
            IAuthorizationState state = new AuthorizationState(GoogleClient.Scopes);
            UserCredential googleConsent = user.GetCredential(UserCredential.GoogleConsent);
            if (googleConsent != null)
            {
                TimeSpan difference = googleConsent.AccessTokenExpiration.Value - DateTime.UtcNow;
                if (difference.TotalMinutes < 5)
                {   // token is expired or will expire within 5 minutes, refresh token
                    googleConsent = RenewAccessToken(googleConsent);
                }
                state.AccessToken = googleConsent.AccessToken;
            }
            else
            {
                TraceLog.TraceError("Google access token is not available");
            }
            return state;
        }

        struct JsonGoogleToken
        {
            public string token_type;
            public string access_token;
            public int expires_in;
        }

        UserCredential RenewAccessToken(UserCredential googleConsent)
        {
            string format = "client_id={0}&client_secret={1}&refresh_token={2}&grant_type=refresh_token";
            string formParams = string.Format(format,
                    System.Web.HttpContext.Current.Server.UrlEncode(GoogleClient.ID),
                    System.Web.HttpContext.Current.Server.UrlEncode(GoogleClient.Secret),
                    System.Web.HttpContext.Current.Server.UrlEncode(googleConsent.RenewalToken));

            byte[] byteArray = Encoding.ASCII.GetBytes(formParams);
            const string googleOAuth2TokenServiceUrl = "https://accounts.google.com/o/oauth2/token";
            WebRequest request = WebRequest.Create(googleOAuth2TokenServiceUrl);
            request.Method = "POST";
            request.ContentType = "application/x-www-form-urlencoded";
            request.ContentLength = byteArray.Length;

            Stream outStream = request.GetRequestStream();
            outStream.Write(byteArray, 0, byteArray.Length);
            outStream.Close();
            try
            {
                WebResponse response = request.GetResponse();
                HttpStatusCode responseStatus = ((HttpWebResponse)response).StatusCode;
                Stream inStream = response.GetResponseStream();
                StreamReader reader = new StreamReader(inStream);
                string jsonToken = reader.ReadToEnd();
                JsonGoogleToken token = JsonSerializer.Deserialize<JsonGoogleToken>(jsonToken);

                googleConsent.AccessToken = token.access_token;
                googleConsent.AccessTokenExpiration = DateTime.UtcNow.AddSeconds(token.expires_in);
                storage.SaveChanges();

                reader.Close();
                inStream.Close();
                response.Close();
            }
            catch (Exception e)
            {
                TraceLog.TraceException("Could not refresh Google access token", e);
            }
            return googleConsent;
        }

        // for getting initial access and renewal tokens via OAuth handshake
        IAuthorizationState GetGoogleTokens(WebServerClient client)
        {
            // check if authorization request already is in progress
            IAuthorizationState state = client.ProcessUserAuthorization(new HttpRequestInfo(System.Web.HttpContext.Current.Request));
            if (state != null && (!string.IsNullOrEmpty(state.AccessToken) || !string.IsNullOrEmpty(state.RefreshToken)))
            {   // store refresh token  
                string username = System.Web.HttpContext.Current.User.Identity.Name;
                UserStorageContext storage = Storage.NewUserContext;
                User user = storage.Users.Include("UserCredentials").Single<User>(u => u.Name == username);
                user.AddCredential(UserCredential.GoogleConsent, state.AccessToken, state.AccessTokenExpirationUtc, state.RefreshToken);
                storage.SaveChanges();
                return state;
            }

            // otherwise make a new authorization request
            OutgoingWebResponse response = client.PrepareRequestUserAuthorization(GoogleClient.Scopes);
            response.Headers["Location"] += "&access_type=offline&approval_prompt=force";
            response.Send();    // will throw a ThreadAbortException to prevent sending another response
            return null;
        }


        static OAuth2Authenticator<WebServerClient> CreateGoogleAuthenticator(Func<WebServerClient, IAuthorizationState> authProvider)
        {   // create the authenticator
            var provider = new WebServerClient(GoogleAuthenticationServer.Description);
            provider.ClientIdentifier = GoogleClient.ID;
            provider.ClientSecret = GoogleClient.Secret;
            var authenticator = new OAuth2Authenticator<WebServerClient>(provider, authProvider) { NoCaching = true };
            return authenticator;
        }

        static string[] Scopes
        {
            get
            {
                string calendarScope = "https://www.googleapis.com/auth/calendar";
                return new[] { calendarScope };
            }
        }

        static string googleClientID;
        static string ID
        {
            get
            {
                if (googleClientID == null) { googleClientID = ConfigurationSettings.Get("GoogleClientID"); }
                return googleClientID;
            }
        }

        static string googleClientSecret;
        public static string Secret
        {
            get
            {
                if (googleClientSecret == null) { googleClientSecret = ConfigurationSettings.Get("GoogleClientSecret"); }
                return googleClientSecret;
            }
        }

        // http://stackoverflow.com/questions/5996320/net-timezoneinfo-from-olson-time-zone
        private static TimeZoneInfo OlsonTimeZoneToTimeZoneInfo(string olsonTimeZoneId)
        {
            var olsonWindowsTimes = new Dictionary<string, string>()
            {
                { "Africa/Cairo", "Egypt Standard Time" },
                { "Africa/Casablanca", "Morocco Standard Time" },
                { "Africa/Johannesburg", "South Africa Standard Time" },
                { "Africa/Lagos", "W. Central Africa Standard Time" },
                { "Africa/Nairobi", "E. Africa Standard Time" },
                { "Africa/Windhoek", "Namibia Standard Time" },
                { "America/Anchorage", "Alaskan Standard Time" },
                { "America/Asuncion", "Paraguay Standard Time" },
                { "America/Bogota", "SA Pacific Standard Time" },
                { "America/Buenos_Aires", "Argentina Standard Time" },
                { "America/Caracas", "Venezuela Standard Time" },
                { "America/Cayenne", "SA Eastern Standard Time" },
                { "America/Chicago", "Central Standard Time" },
                { "America/Chihuahua", "Mountain Standard Time (Mexico)" },
                { "America/Cuiaba", "Central Brazilian Standard Time" },
                { "America/Denver", "Mountain Standard Time" },
                { "America/Godthab", "Greenland Standard Time" },
                { "America/Guatemala", "Central America Standard Time" },
                { "America/Halifax", "Atlantic Standard Time" },
                { "America/Indianapolis", "US Eastern Standard Time" },
                { "America/La_Paz", "SA Western Standard Time" },
                { "America/Los_Angeles", "Pacific Standard Time" },
                { "America/Mexico_City", "Mexico Standard Time" },
                { "America/Montevideo", "Montevideo Standard Time" },
                { "America/New_York", "Eastern Standard Time" },
                { "America/Phoenix", "US Mountain Standard Time" },
                { "America/Regina", "Canada Central Standard Time" },
                { "America/Santa_Isabel", "Pacific Standard Time (Mexico)" },
                { "America/Santiago", "Pacific SA Standard Time" },
                { "America/Sao_Paulo", "E. South America Standard Time" },
                { "America/St_Johns", "Newfoundland Standard Time" },
                { "Asia/Almaty", "Central Asia Standard Time" },
                { "Asia/Amman", "Jordan Standard Time" },
                { "Asia/Baghdad", "Arabic Standard Time" },
                { "Asia/Baku", "Azerbaijan Standard Time" },
                { "Asia/Bangkok", "SE Asia Standard Time" },
                { "Asia/Beirut", "Middle East Standard Time" },
                { "Asia/Calcutta", "India Standard Time" },
                { "Asia/Colombo", "Sri Lanka Standard Time" },
                { "Asia/Damascus", "Syria Standard Time" },
                { "Asia/Dhaka", "Bangladesh Standard Time" },
                { "Asia/Dubai", "Arabian Standard Time" },
                { "Asia/Irkutsk", "North Asia East Standard Time" },
                { "Asia/Jerusalem", "Israel Standard Time" },
                { "Asia/Kabul", "Afghanistan Standard Time" },
                { "Asia/Kamchatka", "Kamchatka Standard Time" },
                { "Asia/Karachi", "Pakistan Standard Time" },
                { "Asia/Katmandu", "Nepal Standard Time" },
                { "Asia/Krasnoyarsk", "North Asia Standard Time" },
                { "Asia/Magadan", "Magadan Standard Time" },
                { "Asia/Novosibirsk", "N. Central Asia Standard Time" },
                { "Asia/Rangoon", "Myanmar Standard Time" },
                { "Asia/Riyadh", "Arab Standard Time" },
                { "Asia/Seoul", "Korea Standard Time" },
                { "Asia/Shanghai", "China Standard Time" },
                { "Asia/Singapore", "Singapore Standard Time" },
                { "Asia/Taipei", "Taipei Standard Time" },
                { "Asia/Tashkent", "West Asia Standard Time" },
                { "Asia/Tbilisi", "Georgian Standard Time" },
                { "Asia/Tehran", "Iran Standard Time" },
                { "Asia/Tokyo", "Tokyo Standard Time" },
                { "Asia/Ulaanbaatar", "Ulaanbaatar Standard Time" },
                { "Asia/Vladivostok", "Vladivostok Standard Time" },
                { "Asia/Yakutsk", "Yakutsk Standard Time" },
                { "Asia/Yekaterinburg", "Ekaterinburg Standard Time" },
                { "Asia/Yerevan", "Armenian Standard Time" },
                { "Atlantic/Azores", "Azores Standard Time" },
                { "Atlantic/Cape_Verde", "Cape Verde Standard Time" },
                { "Atlantic/Reykjavik", "Greenwich Standard Time" },
                { "Australia/Adelaide", "Cen. Australia Standard Time" },
                { "Australia/Brisbane", "E. Australia Standard Time" },
                { "Australia/Darwin", "AUS Central Standard Time" },
                { "Australia/Hobart", "Tasmania Standard Time" },
                { "Australia/Perth", "W. Australia Standard Time" },
                { "Australia/Sydney", "AUS Eastern Standard Time" },
                { "Etc/GMT", "UTC" },
                { "Etc/GMT+11", "UTC-11" },
                { "Etc/GMT+12", "Dateline Standard Time" },
                { "Etc/GMT+2", "UTC-02" },
                { "Etc/GMT-12", "UTC+12" },
                { "Europe/Berlin", "W. Europe Standard Time" },
                { "Europe/Budapest", "Central Europe Standard Time" },
                { "Europe/Istanbul", "GTB Standard Time" },
                { "Europe/Kiev", "FLE Standard Time" },
                { "Europe/London", "GMT Standard Time" },
                { "Europe/Minsk", "E. Europe Standard Time" },
                { "Europe/Moscow", "Russian Standard Time" },
                { "Europe/Paris", "Romance Standard Time" },
                { "Europe/Warsaw", "Central European Standard Time" },
                { "Indian/Mauritius", "Mauritius Standard Time" },
                { "Pacific/Apia", "Samoa Standard Time" },
                { "Pacific/Auckland", "New Zealand Standard Time" },
                { "Pacific/Fiji", "Fiji Standard Time" },
                { "Pacific/Guadalcanal", "Central Pacific Standard Time" },
                { "Pacific/Honolulu", "Hawaiian Standard Time" },
                { "Pacific/Port_Moresby", "West Pacific Standard Time" },
                { "Pacific/Tongatapu", "Tonga Standard Time" }
            };

            var windowsTimeZoneId = default(string);
            var windowsTimeZone = default(TimeZoneInfo);
            if (olsonWindowsTimes.TryGetValue(olsonTimeZoneId, out windowsTimeZoneId))
            {
                try { windowsTimeZone = TimeZoneInfo.FindSystemTimeZoneById(windowsTimeZoneId); }
                catch (TimeZoneNotFoundException) { }
                catch (InvalidTimeZoneException) { }
            }
            return windowsTimeZone;
        }
    }
}
