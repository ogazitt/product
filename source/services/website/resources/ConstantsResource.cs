namespace BuiltSteady.Product.Website.Resources
{
    using System;
    using System.Data.Entity;
    using System.Linq;
    using System.Net.Http;
    using System.Net;
    using System.ServiceModel;
    using System.ServiceModel.Web;

    using BuiltSteady.Product.ServerEntities;
    using BuiltSteady.Product.ServiceHost;
    using BuiltSteady.Product.Website.Helpers;
    using BuiltSteady.Product.Website.Models;

    [ServiceContract]
    [LogMessages]
    public class ConstantsResource : BaseResource
    {
        public ConstantsResource()
        { }

        [WebGet(UriTemplate="")]
        [LogMessages]
        public HttpResponseMessageWrapper<Constants> Get(HttpRequestMessage req)
        {
            // constant values are not protected, no authentication required
            try
            {
                return new HttpResponseMessageWrapper<Constants>(req, ConstantsModel.Constants, HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                // constants not found - return 404 Not Found
                TraceLog.TraceException("Resource not found", ex);
                return new HttpResponseMessageWrapper<Constants>(req, HttpStatusCode.NotFound);
            }
        }
    }
}