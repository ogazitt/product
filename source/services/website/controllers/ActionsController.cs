namespace BuiltSteady.Product.Website.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Web.Mvc;

    using BuiltSteady.Product.ServerEntities;
    using BuiltSteady.Product.ServiceHost;
    using BuiltSteady.Product.Shared.Entities;
    using BuiltSteady.Product.ServiceHost.Helpers;

    public class ActionsController : BaseController
    {
        class JsAppointmentResult
        {
            public HttpStatusCode StatusCode = HttpStatusCode.OK;
            public Item Result;
        }

        class JsFacebookResult
        {
            public HttpStatusCode StatusCode = HttpStatusCode.OK;
        }

        [HttpPost]
        public ActionResult CreateAppointment(Appointment appointment)
        {
            GoogleClient client = new GoogleClient(CurrentUser, StorageContext);
            var item = client.AddCalendarEvent(appointment);
            var appointmentResult = new JsAppointmentResult();
            if (item != null)
                appointmentResult.Result = item;
            else
                appointmentResult.StatusCode = HttpStatusCode.InternalServerError;

            JsonResult result = new JsonResult();
            result.Data = appointmentResult;
            return result;
        }

        [HttpPost]
        public ActionResult PostOnFacebook(string question)
        {
            var facebookResult = new JsFacebookResult();
            var user = this.StorageContext.GetUser(this.CurrentUser.ID, true);
            if (!FacebookHelper.PostQuestion(user, this.StorageContext, question))
                facebookResult.StatusCode = HttpStatusCode.NotFound;
            JsonResult result = new JsonResult();
            result.Data = facebookResult;
            return result;
        }
    }
}
