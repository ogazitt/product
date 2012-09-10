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

    public class NextStepsController : BaseController
    {
        // this controller and action is used to redirect the /nexsteps URL to the appropriate controller:
        //   web: /dashboard/nextsteps
        //   mobile: /mobile
        // we do this so that we can hand out a single URL to a user (/nextsteps), e.g. in a calendar appointment,
        // and the controller will redirect based on the user-agent to the appropriate page.
        public ActionResult Home()
        {
            if (BrowserAgent.IsMobile(Request.UserAgent))
                return RedirectToAction("Home", "Mobile");
            return RedirectToAction("NextSteps", "Dashboard");
        }
    }
}
