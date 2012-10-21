namespace BuiltSteady.Product.Website.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Web;
    using System.Web.Mvc;
    using System.Web.Routing;
    using System.Web.Security;

    using BuiltSteady.Product.ServerEntities;
    using BuiltSteady.Product.ServiceHost;
    using BuiltSteady.Product.Website.Models;
    using BuiltSteady.Product.Website.Models.AccessControl;
    using BuiltSteady.Product.Website.Helpers;

    public class AccountController : Controller
    {
        const string ExistingUserCookie = "ExistingUserCookie";

        // register is default url for the site
        public ActionResult Home()
        {
            return Register();
        }

        public ActionResult SignIn()
        {
            string status;
            if (!HostEnvironment.DataVersionCheck(out status))
            {
                return Content(status);
            }

            // redirect mobile client to mobile sign-in
            if (BrowserAgent.IsMobile(Request.UserAgent))
                return RedirectToAction("MobileSignIn", "Account");

            return View();
        }

        [HttpPost]
        public ActionResult SignIn(SignInModel model, string returnUrl)
        {
            if (ModelState.IsValid)
            {
                if (Membership.ValidateUser(model.UserName, model.Password))
                {
                    SetAuthCookie(model.UserName, model.RememberMe);
                    if (model.RememberMe)
                    {   // add a cookie to remember existing users (to redirect existing users to signin page)
                        Response.Cookies.Add(new HttpCookie(ExistingUserCookie));
                    }
                    if (Url.IsLocalUrl(returnUrl) && returnUrl.Length > 1 && returnUrl.StartsWith("/")
                        && !returnUrl.StartsWith("//") && !returnUrl.StartsWith("/\\"))
                    {
                        return Redirect(returnUrl);
                    }
                    else
                    {
                        if (this.renewFBToken)
                            return RedirectToAction("Home", "Dashboard", new { renewFBToken = true });
                        else
                            return RedirectToAction("Home", "Dashboard");
                    }
                }
                else
                {
                    ModelState.AddModelError("", "The user name or password provided is incorrect.");
                }
            }

            // If we got this far, something failed, redisplay form
            return View(model);
        }

        public ActionResult MobileSignIn()
        {
            string status;
            if (!HostEnvironment.DataVersionCheck(out status))
            {
                return Content(status);
            }

            // redirect non-mobile client to normal sign-in page
            if (!BrowserAgent.IsMobile(Request.UserAgent))
                return RedirectToAction("SignIn", "Account");

            return View();
        }

        [HttpPost]
        public ActionResult MobileSignIn(SignInModel model, string returnUrl)
        {
            if (ModelState.IsValid)
            {
                if (Membership.ValidateUser(model.UserName, model.Password))
                {
                    SetAuthCookie(model.UserName, model.RememberMe);

                    if (Url.IsLocalUrl(returnUrl) && returnUrl.Length > 1 && returnUrl.StartsWith("/")
                        && !returnUrl.StartsWith("//") && !returnUrl.StartsWith("/\\"))
                    {
                        return Redirect(returnUrl);
                    }
                    else
                    {
                        return RedirectToAction("Home", "Mobile");
                    }
                }
                else
                {
                    ModelState.AddModelError("", "The user name or password provided is incorrect.");
                }
            }

            // If we got this far, something failed, redisplay form
            return View(model);
        }

        public ActionResult SignOut()
        {
            FormsAuthentication.SignOut();

            if (BrowserAgent.IsMobile(Request.UserAgent))
                return RedirectToAction("MobileSignIn", "Account");
            else
                return RedirectToAction("SignIn", "Account");
        }

        public ActionResult Register()
        {
            if (Request.IsAuthenticated)
            {   // redirect authenticated users to dashboard
                if (BrowserAgent.IsMobile(Request.UserAgent))
                    return RedirectToAction("Home", "Mobile");
                else
                    return RedirectToAction("Home", "Dashboard");
            }

            // redirect mobile, to mobile SignIn
            if (BrowserAgent.IsMobile(Request.UserAgent))
                return RedirectToAction("MobileSignIn", "Account");

            // redirect "existing users" to the SignIn page unless explicit register url
            if (Request.Url.LocalPath.IndexOf("/account/register",StringComparison.OrdinalIgnoreCase) < 0 && 
                Request.Cookies[ExistingUserCookie] != null)
                return RedirectToAction("SignIn", "Account");

            return View("Register");
        }

        [HttpPost]
        public ActionResult Register(RegisterModel model)
        {
            if (ModelState.IsValid)
            {
                if (!ValidateAccessCode(model))
                {   // validate access code (restrict access for now)
                    ModelState.AddModelError("", "The given access code is not valid.");
                    return View(model);
                }

                // attempt to register the user
                MembershipCreateStatus createStatus;
                Membership.CreateUser(model.UserName, model.Password, model.Email, null, null, true, null, out createStatus);

                if (createStatus == MembershipCreateStatus.Success)
                {
                    SetAuthCookie(model.UserName, false);
                    // add a cookie indicating the user is recognized (this will redirect existing users to signin page)
                    Response.Cookies.Add(new HttpCookie(ExistingUserCookie));
                    return RedirectToAction("Initialize", "Dashboard");
                }
                else
                {
                    ModelState.AddModelError("", ErrorCodeToString(createStatus));
                }
            }

            // error, redisplay form
            return View(model);
        }

        [Authorize]
        public ActionResult ChangePassword()
        {
            return View();
        }

        [Authorize]
        [HttpPost]
        public ActionResult ChangePassword(ChangePasswordModel model)
        {
            if (ModelState.IsValid)
            {

                // ChangePassword will throw an exception rather
                // than return false in certain failure scenarios.
                bool changePasswordSucceeded;
                try
                {
                    MembershipUser currentUser = Membership.GetUser(User.Identity.Name, true /* userIsOnline */);
                    changePasswordSucceeded = currentUser.ChangePassword(model.OldPassword, model.NewPassword);
                }
                catch (Exception)
                {
                    changePasswordSucceeded = false;
                }

                if (changePasswordSucceeded)
                {
                    return RedirectToAction("ChangePasswordSuccess");
                }
                else
                {
                    ModelState.AddModelError("", "The current password is incorrect or the new password is invalid.");
                }
            }

            // If we got this far, something failed, redisplay form
            return View(model);
        }

        public ActionResult ChangePasswordSuccess()
        {
            return View();
        }


#region // Private Methods
        private bool renewFBToken = false;
        private void SetAuthCookie(string username, bool persistent, bool isMobile = false)
        {
            if (Membership.Provider is UserMembershipProvider)
            {
                User user = new User { Name = username };
                HttpCookie authCookie = UserMembershipProvider.CreateAuthCookie(user, out this.renewFBToken, isMobile);
                this.Response.Cookies.Add(authCookie);
            }
            else
            {
                FormsAuthentication.SetAuthCookie(username, persistent);
            }
        }

        private bool ValidateAccessCode(RegisterModel model)
        {
            return model.AccessCode.StartsWith("ZAP", StringComparison.OrdinalIgnoreCase);
        }

        private static string ErrorCodeToString(MembershipCreateStatus createStatus)
        {
            // see http://go.microsoft.com/fwlink/?LinkID=177550 for a full list of status codes.
            switch (createStatus)
            {
                case MembershipCreateStatus.DuplicateUserName:
                    return "User name already exists. Please enter a different user name.";

                case MembershipCreateStatus.DuplicateEmail:
                    return "A user name for that e-mail address already exists. Please enter a different e-mail address.";

                case MembershipCreateStatus.InvalidPassword:
                    return "The password provided is invalid. Please enter a valid password value.";

                case MembershipCreateStatus.InvalidEmail:
                    return "The e-mail address provided is invalid. Please check the value and try again.";

                case MembershipCreateStatus.InvalidAnswer:
                    return "The password retrieval answer provided is invalid. Please check the value and try again.";

                case MembershipCreateStatus.InvalidQuestion:
                    return "The password retrieval question provided is invalid. Please check the value and try again.";

                case MembershipCreateStatus.InvalidUserName:
                    return "The user name provided is invalid. Please check the value and try again.";

                case MembershipCreateStatus.ProviderError:
                    return "The authentication provider returned an error. Please verify your entry and try again. If the problem persists, please contact your system administrator.";

                case MembershipCreateStatus.UserRejected:
                    return "The user creation request has been canceled. Please verify your entry and try again. If the problem persists, please contact your system administrator.";

                default:
                    return "An unknown error occurred. Please verify your entry and try again. If the problem persists, please contact your system administrator.";
            }
        }
#endregion

    }
}
