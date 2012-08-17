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

    public class MobileController : BaseController
    {

        public ActionResult NextSteps()
        {
            NextStepsDataModel model = new NextStepsDataModel(this);
            try
            {   
                // force access to validate current user
                var userData = model.NextStepsData;
            }
            catch
            {
                return RedirectToAction("SignOut", "Account");
            }
            return View(model);
        }

    }
}
