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
    using BuiltSteady.Product.ServiceHost.Gallery;

    public class ActionsController : BaseController
    {
        class JsAppointmentResult
        {
            public HttpStatusCode StatusCode = HttpStatusCode.OK;
            public Item Result;
        }

        class JsResult
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
            var jsResult = new JsResult();
            var user = this.StorageContext.GetUser(this.CurrentUser.ID, true);
            if (!FacebookHelper.PostQuestion(user, this.StorageContext, question))
                jsResult.StatusCode = HttpStatusCode.NotFound;
            JsonResult result = new JsonResult();
            result.Data = jsResult;
            return result;
        }

        [HttpPost]
        public ActionResult InstallCategory(GalleryCategory category)
        {
            var jsResult = new JsResult();
            if (!GalleryProcessor.InstallCategory(this.StorageContext, Storage.NewSuggestionsContext, this.CurrentUser, null, null, category))
                jsResult.StatusCode = HttpStatusCode.NotFound;
            JsonResult result = new JsonResult();
            result.Data = jsResult;
            return result;
        }

        [HttpPost]
        public ActionResult InstallActivity(GalleryActivity activity, Folder category)
        {
            var jsResult = new JsResult();
            if (!GalleryProcessor.InstallActivity(this.StorageContext, Storage.NewSuggestionsContext, category, null, activity))
                jsResult.StatusCode = HttpStatusCode.NotFound;
            JsonResult result = new JsonResult();
            result.Data = jsResult;
            return result;
        }
    }
}
