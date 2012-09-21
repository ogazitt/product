namespace BuiltSteady.Product.Website.Controllers
{
    using System;
    using System.IO;
    using System.Net;
    using System.Threading;
    using System.Web;
    using System.Web.Mvc;
    using Microsoft.IdentityModel.Protocols.OAuth.Client;

    using BuiltSteady.Product.ServerEntities;
    using BuiltSteady.Product.ServiceHost;
    using BuiltSteady.Product.Website.Models;
    using BuiltSteady.Product.Website.Models.AccessControl;

    public class OAuthConsentController : BaseController
    {

        public ActionResult Facebook(string code, string id)
        {
            string fbRedirectPath = "oauthconsent/facebook";
            if (id != null) fbRedirectPath += "/" + id;
            string uriTemplate = "https://graph.facebook.com/oauth/access_token?client_id={0}&redirect_uri={1}&client_secret={2}&code={3}";

            var requestUrl = this.HttpContext.Request.Url;
            var redirectUrl = string.Format("{0}://{1}/{2}", requestUrl.Scheme, requestUrl.Authority, fbRedirectPath);
            string encodedRedirect = HttpUtility.UrlEncode(redirectUrl);
            string uri = string.Format(uriTemplate, FBAppID, encodedRedirect, FBAppSecret, code);

            WebRequest req = WebRequest.Create(uri);
            WebResponse resp = req.GetResponse();

            string token = null;
            DateTime? expires = null;

            using (Stream stream = resp.GetResponseStream())
            using (StreamReader reader = new StreamReader(stream))
            {
                string data = reader.ReadToEnd();

                string[] parts = data.Split('&');
                foreach (var s in parts)
                {
                    string[] kv = s.Split('=');
                    if (kv[0].Equals("access_token", StringComparison.Ordinal))
                        token = kv[1];
                    else if (kv[0].Equals("expires"))
                        expires = DateTime.UtcNow.AddSeconds(int.Parse(kv[1]));
                }
            }

            var renewed = false;
            var consentStatus = UserDataModel.FBConsentSuccess;
            try
            {   // store token
                renewed = UserMembershipProvider.SaveCredential(this.CurrentUser.Name, UserCredential.FacebookConsent, token, expires);
            }
            catch (Exception ex)
            {
                TraceLog.TraceException("Failed to store Facebook consent token for User", ex);
                consentStatus = UserDataModel.FBConsentFail;
            }

            if (id == null)
                return RedirectToAction("Home", "Dashboard", new { consentStatus = consentStatus });
            else
                return RedirectToAction("Wizard", "UserInfo", new { consentStatus = consentStatus });
        }

        static GoogleClient googleClient;
        public ActionResult Google(string id)
        {
            if (googleClient == null)
            {   // access Google Calendar API to force initial authentication
                googleClient = new GoogleClient();
            }
            
            if (HttpContext.Request["code"] != null)
            {   // load access tokens 
                googleClient.Authenticator.LoadAccessToken();
            }

            try
            {   // force authentication by accessing calendar settings
                googleClient.ForceAuthentication();
                if (id == null)
                    return RedirectToAction("Home", "Dashboard", new { consentStatus = UserDataModel.GoogleConsentSuccess });
                else
                    return RedirectToAction("Wizard", "UserInfo", new { consentStatus = UserDataModel.GoogleConsentSuccess });
            }
            catch (ThreadAbortException)
            {
                throw;
            }
            catch (Exception)
            {
                if (id == null)
                    return RedirectToAction("Home", "Dashboard", new { consentStatus = UserDataModel.GoogleConsentFail });
                else 
                    return RedirectToAction("Wizard", "UserInfo", new { consentStatus = UserDataModel.GoogleConsentFail });
            }
        }

        // entry point to verify Google consent is working
        public ActionResult AccessGoogle()
        {
            GoogleClient client = new GoogleClient(this.CurrentUser, this.StorageContext);
            client.ForceAuthentication();

            return RedirectToAction("Home", "Dashboard");
        }

        public ActionResult CloudAD()
        {
            OAuthClient.RedirectToEndUserEndpoint(
                AzureOAuthConfiguration.ProtectedResourceUrl,
                AuthorizationResponseType.Code,
                new Uri(AzureOAuthConfiguration.GetRedirectUrlAfterEndUserConsent(this.HttpContext.Request.Url)),
                CurrentUser.ID.ToString(),
                null);

            return new EmptyResult();
        }

    }
}
