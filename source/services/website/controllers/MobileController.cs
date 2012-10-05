namespace BuiltSteady.Product.Website.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.Net;
    using System.Web.Mvc;

    using BuiltSteady.Product.ServerEntities;
    using BuiltSteady.Product.ServiceHost;
    using BuiltSteady.Product.Shared.Entities;
    using BuiltSteady.Product.Website.Models;
    using BuiltSteady.Product.Website.Helpers;
    using System.Web.Security;

    public class MobileController : BaseController
    {
        public ActionResult Home()
        {
            UserDataModel model = new UserDataModel(this);
            try
            {
                // force access to validate current user
                var userData = model.UserData;
            }
            catch
            {
                return RedirectToAction("SignOut", "Account");
            }
            return View(model);
        }

        public ActionResult NextSteps()
        {
            UserDataModel model = new UserDataModel(this);
            try
            {   
                // force access to validate current user
                var userData = model.UserData;
            }
            catch
            {
                return RedirectToAction("SignOut", "Account");
            }
            return View(model);
        }

    }
}
