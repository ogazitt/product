﻿namespace BuiltSteady.Product.Website.Resources
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Net.Http;
    using System.Reflection;
    using System.ServiceModel;
    using System.ServiceModel.Web;

    using BuiltSteady.Product.ServerEntities;
    using BuiltSteady.Product.ServiceHost;
    using BuiltSteady.Product.Website.Helpers;

    [ServiceContract]
    [LogMessages]
    public class TagResource : BaseResource
    {

        [WebInvoke(UriTemplate = "{id}", Method = "DELETE")]
        [LogMessages]
        public HttpResponseMessageWrapper<Tag> DeleteTag(HttpRequestMessage req, Guid id)
        {
            Operation operation = null;
            HttpStatusCode code = AuthenticateUser(req);
            if (code != HttpStatusCode.OK)
            {   // user not authenticated
                return ReturnResult<Tag>(req, operation, code);  
            }

            // get the tag from the message body if one was passed
            Tag clientTag;
            if (req.Content.Headers.ContentLength > 0)
            {
                code = ProcessRequestBody<Tag>(req, out clientTag, out operation);
                if (code != HttpStatusCode.OK)  // error encountered processing body
                    return ReturnResult<Tag>(req, operation, code);

                if (clientTag.ID != id)
                {   // IDs must match
                    TraceLog.TraceError("ID in URL does not match entity body");
                    return ReturnResult<Tag>(req, operation, HttpStatusCode.BadRequest);
                }
            }
            else
            {
                // otherwise get the client tag from the database
                try
                {
                    clientTag = this.StorageContext.Tags.Single<Tag>(t => t.ID == id);
                    var session = GetSessionFromMessageHeaders(req);
                    operation = this.StorageContext.CreateOperation(CurrentUser, req.Method.Method, null, clientTag, null, session);
                }
                catch (Exception)
                {   // tag not found - it may have been deleted by someone else.  Return 200 OK.
                    TraceLog.TraceInfo("Entity not found return OK");
                    return ReturnResult<Tag>(req, operation, HttpStatusCode.OK);
                }
            }

            // get the tag to be deleted
            try
            {
                Tag requestedTag = this.StorageContext.Tags.Include("ItemTags").Single<Tag>(t => t.ID == id);
                if (requestedTag.UserID != CurrentUser.ID)
                {   // requested tag does not belong to the authenticated user, return 403 Forbidden
                    TraceLog.TraceError("Entity does not belong to current user");
                    return ReturnResult<Tag>(req, operation, HttpStatusCode.Forbidden);
                }

                // delete all the itemtags associated with this item
                if (requestedTag.ItemTags != null && requestedTag.ItemTags.Count > 0)
                {
                    foreach (var tt in requestedTag.ItemTags.ToList())
                        this.StorageContext.ItemTags.Remove(tt);
                }

                this.StorageContext.Tags.Remove(requestedTag);
                if (this.StorageContext.SaveChanges() < 1)
                {
                    TraceLog.TraceError("Internal Server Error (database operation did not succeed)");
                    return ReturnResult<Tag>(req, operation, HttpStatusCode.InternalServerError);
                }
                else
                {
                    TraceLog.TraceInfo("Accepted");
                    return ReturnResult<Tag>(req, operation, requestedTag, HttpStatusCode.Accepted);
                }
            }
            catch (Exception ex)
            {
                // tag not found - it may have been deleted by someone else.  Return 200 OK.
                TraceLog.TraceInfo(String.Format("Exception in database operation, return OK : Exception[{0}]", ex.Message));
                return ReturnResult<Tag>(req, operation, HttpStatusCode.OK);
            }
        }

        [WebGet(UriTemplate="")]
        [LogMessages]
        public HttpResponseMessageWrapper<List<Tag>> GetTags(HttpRequestMessage req)
        {
            Operation operation = null;
            HttpStatusCode code = AuthenticateUser(req);
            if (code != HttpStatusCode.OK)
            {   // user not authenticated
                return ReturnResult<List<Tag>>(req, operation, code);
            }

            // get all Tags
            try
            {
                var tags = this.StorageContext.Tags.
                    Include("Fields").
                    Where(lt => lt.UserID == null || lt.UserID == CurrentUser.ID).
                    OrderBy(lt => lt.Name).
                    ToList<Tag>();
                return ReturnResult<List<Tag>>(req, operation, tags, HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                // tag not found - return 404 Not Found
                TraceLog.TraceException("Resource not found", ex);
                return ReturnResult<List<Tag>>(req, operation, HttpStatusCode.NotFound);
            }
        }

        [WebGet(UriTemplate = "{id}")]
        [LogMessages]
        public HttpResponseMessageWrapper<Tag> GetTag(HttpRequestMessage req, Guid id)
        {
            Operation operation = null;
            HttpStatusCode code = AuthenticateUser(req);
            if (code != HttpStatusCode.OK)
            {   // user not authenticated
                return ReturnResult<Tag>(req, operation, code);
            }

            // get the requested tag
            try
            {
                Tag requestedTag = this.StorageContext.Tags.Include("Fields").Single<Tag>(t => t.ID == id);

                // if the requested tag is not generic (i.e. UserID == 0), 
                // and does not belong to the authenticated user, return 403 Forbidden, otherwise return the tag
                if (requestedTag.UserID != null && requestedTag.UserID != CurrentUser.ID)
                {
                    TraceLog.TraceError("Entity does not belong to current user");
                    return ReturnResult<Tag>(req, operation, HttpStatusCode.Forbidden);
                }

                return ReturnResult<Tag>(req, operation, requestedTag, HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                // tag not found - return 404 Not Found
                TraceLog.TraceException("Resource not found", ex);
                return ReturnResult<Tag>(req, operation, HttpStatusCode.NotFound);
            }
        }

        [WebInvoke(UriTemplate = "", Method = "POST")]
        [LogMessages]
        public HttpResponseMessageWrapper<Tag> InsertTag(HttpRequestMessage req)
        {
            Operation operation = null;
            HttpStatusCode code = AuthenticateUser(req);
            if (code != HttpStatusCode.OK)
            {   // user not authenticated
                return ReturnResult<Tag>(req, operation, code);
            }

            // get the new tag from the message body
            Tag clientTag = null;
            code = ProcessRequestBody(req, out clientTag, out operation);
            if (code != HttpStatusCode.OK)  // error encountered processing body
                return ReturnResult<Tag>(req, operation, code);

            // add the new tag to the database
            try
            {
                var tag = this.StorageContext.Tags.Add(clientTag);
                if (tag == null || this.StorageContext.SaveChanges() < 1)
                {
                    TraceLog.TraceError("Internal Server Error (database operation did not succeed)");
                    return ReturnResult<Tag>(req, operation, HttpStatusCode.InternalServerError);
                }
                else
                {
                    TraceLog.TraceInfo("Created");
                    return ReturnResult<Tag>(req, operation, tag, HttpStatusCode.Created);
                }
            }
            catch (Exception ex)
            {
                // check for the condition where the tag is already in the database
                // in that case, return 202 Accepted; otherwise, return 409 Conflict
                try
                {
                    var dbTag = this.StorageContext.Tags.Single(t => t.ID == clientTag.ID);
                    if (dbTag.Name == clientTag.Name)
                    {
                        TraceLog.TraceInfo("Accepted (entity exists) : Exception[" + ex.Message + "]");
                        return ReturnResult<Tag>(req, operation, dbTag, HttpStatusCode.Accepted);
                    }
                    else
                    {
                        TraceLog.TraceException("Entity in database did not match", ex);
                        return ReturnResult<Tag>(req, operation, HttpStatusCode.Conflict);
                    }
                }
                catch (Exception e)
                {
                    // tag not inserted - return 409 Conflict
                    TraceLog.TraceException(String.Format("Entity was not in database : Exception[{0}]", ex.Message), e);
                    return ReturnResult<Tag>(req, operation, HttpStatusCode.Conflict);
                }
            }
        }
    
        [WebInvoke(UriTemplate = "{id}", Method = "PUT")]
        [LogMessages]
        public HttpResponseMessageWrapper<Tag> UpdateTag(HttpRequestMessage req, Guid id)
        {
            Operation operation = null;
            HttpStatusCode code = AuthenticateUser(req);
            if (code != HttpStatusCode.OK)
            {   // user not authenticated
                return ReturnResult<Tag>(req, operation, code);
            }

            // the body will be two Tags - the original and the new values.  Verify this
            List<Tag> clientTags = null;
            code = ProcessRequestBody<List<Tag>>(req, out clientTags, out operation);
            if (code != HttpStatusCode.OK)  // error encountered processing body
                return ReturnResult<Tag>(req, operation, code);

            // get the original and new Tags out of the message body
            Tag originalTag = clientTags[0];
            Tag newTag = clientTags[1];

            // make sure the tag ID's match
            if (originalTag.ID != id || newTag.ID != id)
            {
                TraceLog.TraceError("ID in URL does not match entity body");
                return ReturnResult<Tag>(req, operation, HttpStatusCode.BadRequest);
            }

            // update the tag
            try
            {
                Tag requestedTag = this.StorageContext.Tags.Single<Tag>(t => t.ID == id);

                // if the Tag does not belong to the authenticated user, return 403 Forbidden
                if (requestedTag.UserID != CurrentUser.ID)
                {
                    TraceLog.TraceError("Entity does not belong to current user");
                    return ReturnResult<Tag>(req, operation, HttpStatusCode.Forbidden);
                }
                // reset the UserID fields to the appropriate user, to ensure update is done in the context of the current user
                originalTag.UserID = requestedTag.UserID;
                newTag.UserID = requestedTag.UserID;
                
                bool changed = Update(requestedTag, originalTag, newTag);
                if (changed == true)
                {
                    if (this.StorageContext.SaveChanges() < 1)
                    {
                        TraceLog.TraceError("Internal Server Error (database operation did not succeed)");
                        return ReturnResult<Tag>(req, operation, HttpStatusCode.InternalServerError);
                    }
                    else
                    {
                        TraceLog.TraceInfo("Accepted");
                        return ReturnResult<Tag>(req, operation, requestedTag, HttpStatusCode.Accepted);
                    }
                }
                else
                {
                    TraceLog.TraceInfo("Accepted (no changes)");
                    return ReturnResult<Tag>(req, operation, requestedTag, HttpStatusCode.Accepted);
                }
            }
            catch (Exception ex)
            {
                // tag not found - return 404 Not Found
                TraceLog.TraceException("Resource not found", ex);
                return ReturnResult<Tag>(req, operation, HttpStatusCode.NotFound);
            }
        }

        private bool Update(Tag requestedTag, Tag originalTag, Tag newTag)
        {
            bool updated = false;
            // timestamps!!
            Type t = requestedTag.GetType();
            foreach (PropertyInfo pi in t.GetProperties())
            {
                object serverValue = pi.GetValue(requestedTag, null);
                object origValue = pi.GetValue(originalTag, null);
                object newValue = pi.GetValue(newTag, null);

                // if the value has changed, process further 
                if (!Object.Equals(origValue, newValue))
                {
                    // if the server has the original value, make the update
                    if (Object.Equals(serverValue, origValue))
                    {
                        pi.SetValue(requestedTag, newValue, null);
                        updated = true;
                    }
                }
            }

            return updated;
        }
    }
}