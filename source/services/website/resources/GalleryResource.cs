namespace BuiltSteady.Product.Website.Resources
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Net.Http;
    using System.Net.Http.Headers;
    using System.ServiceModel;
    using System.ServiceModel.Web;

    using BuiltSteady.Product.ServerEntities;
    using BuiltSteady.Product.ServiceHost;
    using BuiltSteady.Product.Shared.Entities;
    using BuiltSteady.Product.Website.Helpers;

    [ServiceContract]
    [LogMessages]
    public class GalleryResource : BaseResource
    {
        SuggestionsStorageContext suggestionsContext;
        public SuggestionsStorageContext SuggestionsStorageContext
        {
            get
            {
                if (suggestionsContext == null)
                {
                    suggestionsContext = Storage.NewSuggestionsContext;
                }
                return suggestionsContext;
            }
        }

        [WebGet(UriTemplate = "{type}")]
        [LogMessages]
        public HttpResponseMessageWrapper<List<GalleryCategory>> Get(HttpRequestMessage req, string type)
        {
            Operation operation = null;
            if (false)  // TODO: turn authentication back on by removing this if statement
            {
                HttpStatusCode code = AuthenticateUser(req);
                if (code != HttpStatusCode.OK)
                {   // user not authenticated
                    return ReturnResult<List<GalleryCategory>>(req, operation, code);
                }
            }
            try
            {
                var categories = SuggestionsStorageContext.
                    GalleryCategories.
                    Include("Subcategories.Activities").
                    Include("Activities").
                    Where(c => c.ParentID == null).ToList();
                var response = ReturnResult<List<GalleryCategory>>(req, operation, categories, HttpStatusCode.OK);
                response.Headers.CacheControl = new CacheControlHeaderValue() { NoCache = true };
                return response;
            }
            catch (Exception ex)
            {   // categories not found - return 404 Not Found
                TraceLog.TraceException("Resource not found", ex);
                return ReturnResult<List<GalleryCategory>>(req, operation, HttpStatusCode.NotFound);
            }
        }
    }
}