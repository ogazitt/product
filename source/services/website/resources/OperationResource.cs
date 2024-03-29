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
    public class OperationResource : BaseResource
    {

        [WebInvoke(UriTemplate = "{id}", Method = "DELETE")]
        [LogMessages]
        public HttpResponseMessageWrapper<Operation> DeleteOperation(HttpRequestMessage req, Guid id)
        {
            Operation operation = null;
            HttpStatusCode code = AuthenticateUser(req);
            if (code != HttpStatusCode.OK)
            {   // user not authenticated
                return ReturnResult<Operation>(req, operation, code);
            }

            // get the operation from the message body if one was passed
            Operation clientOperation;
            if (req.Content.Headers.ContentLength > 0)
            {
                code = ProcessRequestBody<Operation>(req, out clientOperation, out operation);
                if (code != HttpStatusCode.OK)  // error encountered processing body
                    return ReturnResult<Operation>(req, operation, code);

                if (clientOperation.ID != id)
                {   // IDs must match
                    TraceLog.TraceError("ID in URL does not match entity body");
                    return ReturnResult<Operation>(req, operation, HttpStatusCode.BadRequest);
                }
            }
            else
            {
                // otherwise get the client operation from the database
                try
                {
                    clientOperation = this.StorageContext.Operations.Single<Operation>(o => o.ID == id);
                }
                catch (Exception)
                {   // operation not found - it may have been deleted by someone else.  Return 200 OK.
                    TraceLog.TraceInfo("Entity not found, return OK");
                    return ReturnResult<Operation>(req, operation, HttpStatusCode.OK);
                }
            }

            if (clientOperation.UserID != CurrentUser.ID)
            {   // requested operation does not belong to the authenticated user, return 403 Forbidden
                TraceLog.TraceError("Entity does not belong to current user");
                return ReturnResult<Operation>(req, operation, HttpStatusCode.Forbidden);
            }

            try
            {
                Operation requestedOperation = this.StorageContext.Operations.Single<Operation>(t => t.ID == id);
                this.StorageContext.Operations.Remove(requestedOperation);
                if (this.StorageContext.SaveChanges() < 1)
                {
                    TraceLog.TraceError("Internal Server Error (database operation did not succeed)");
                    return ReturnResult<Operation>(req, operation, HttpStatusCode.InternalServerError);
                }
                else
                {
                    TraceLog.TraceInfo("Accepted");
                    return ReturnResult<Operation>(req, operation, requestedOperation, HttpStatusCode.Accepted);
                }
            }
            catch (Exception ex)
            {
                // operation not found - it may have been deleted by someone else.  Return 200 OK.
                TraceLog.TraceInfo(String.Format("Exception in database operation, return OK : Exception[{0}]", ex.Message));
                return ReturnResult<Operation>(req, operation, HttpStatusCode.OK);
            }
        }

        [WebGet(UriTemplate = "{id}")]
        [LogMessages]
        public HttpResponseMessageWrapper<Operation> GetOperation(HttpRequestMessage req, Guid id)
        {
            Operation operation = null;
            HttpStatusCode code = AuthenticateUser(req);
            if (code != HttpStatusCode.OK)
            {   // user not authenticated
                return ReturnResult<Operation>(req, operation, code);
            }

            // get the requested operation
            try
            {
                Operation requestedOperation = this.StorageContext.Operations.Single<Operation>(t => t.ID == id);

                // if the requested operation does not belong to the authenticated user, return 403 Forbidden, otherwise return the operation
                if (requestedOperation.UserID != CurrentUser.ID)
                {
                    TraceLog.TraceError("Entity does not belong to current user)");
                    return ReturnResult<Operation>(req, operation, HttpStatusCode.Forbidden);
                }
                
                return ReturnResult<Operation>(req, operation, requestedOperation, HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                // operation not found - return 404 Not Found
                TraceLog.TraceException("Resource not found", ex);
                return ReturnResult<Operation>(req, operation, HttpStatusCode.NotFound);
            }
        }

        /// <summary>
        /// Insert a new Operation
        /// </summary>
        /// <returns>New Operation</returns>
        [WebInvoke(UriTemplate = "", Method = "POST")]
        [LogMessages]
        public HttpResponseMessageWrapper<Operation> InsertOperation(HttpRequestMessage req)
        {
            Operation operation = null;
            HttpStatusCode code = AuthenticateUser(req);
            if (code != HttpStatusCode.OK)
            {   // user not authenticated
                return ReturnResult<Operation>(req, operation, code);
            }

            // get the new operation from the message body
            Operation clientOperation = null;
            code = ProcessRequestBody<Operation>(req, out clientOperation, out operation);
            if (code != HttpStatusCode.OK)  // error encountered processing body
                return ReturnResult<Operation>(req, operation, code);

            // if the requested operation does not belong to the authenticated user, return 403 Forbidden
            if (clientOperation.UserID == null || clientOperation.UserID == Guid.Empty)
                clientOperation.UserID = CurrentUser.ID;
            if (clientOperation.UserID != CurrentUser.ID)
            {
                TraceLog.TraceError("Entity does not belong to current user");
                return ReturnResult<Operation>(req, operation, HttpStatusCode.Forbidden);
            }

            // fill out the ID if it's not set (e.g. from a javascript client)
            if (clientOperation.ID == null || clientOperation.ID == Guid.Empty)
                clientOperation.ID = Guid.NewGuid();

            // fill out the timestamps if they aren't set (null, or MinValue.Date, allowing for DST and timezone issues)
            DateTime now = DateTime.UtcNow;
            if (clientOperation.Timestamp == null || clientOperation.Timestamp.Date == DateTime.MinValue.Date)
                clientOperation.Timestamp = now;

            // add the new operation to the database
            try
            {
                var currentOperation = this.StorageContext.Operations.Add(clientOperation);
                if (currentOperation == null || this.StorageContext.SaveChanges() < 1)
                {
                    TraceLog.TraceError("Internal Server Error (database operation did not succeed)");
                    return ReturnResult<Operation>(req, operation, HttpStatusCode.InternalServerError);
                }
                else
                {
                    TraceLog.TraceInfo("Created");
                    return ReturnResult<Operation>(req, operation, currentOperation, HttpStatusCode.Created);  // return 201 Created
                }
            }
            catch (Exception ex)
            {
                // check for the condition where the operation is already in the database
                // in that case, return 202 Accepted; otherwise, return 409 Conflict
                try
                {
                    var dbOperation = this.StorageContext.Operations.Single(t => t.ID == clientOperation.ID);
                    if (dbOperation.EntityName == clientOperation.EntityName)
                    {
                        TraceLog.TraceInfo("Accepted (entity already exists) : Exception[" + ex.Message + "]");
                        return ReturnResult<Operation>(req, operation, dbOperation, HttpStatusCode.Accepted);
                    }
                    else
                    {
                        TraceLog.TraceException("Entity in database did not match", ex);
                        return ReturnResult<Operation>(req, operation, HttpStatusCode.Conflict);
                    }
                }
                catch (Exception e)
                {
                    // operation not inserted - return 409 Conflict
                    TraceLog.TraceException(String.Format("Entity was not in database : Exception[{0}]", ex.Message), e);
                    return ReturnResult<Operation>(req, operation, HttpStatusCode.Conflict);
                }
            }
        }
    
        [WebInvoke(UriTemplate = "{id}", Method = "PUT")]
        [LogMessages]
        public HttpResponseMessageWrapper<Operation> UpdateOperation(HttpRequestMessage req, Guid id)
        {
            Operation operation = null;
            HttpStatusCode code = AuthenticateUser(req);
            if (code != HttpStatusCode.OK)
            {   // user not authenticated
                return ReturnResult<Operation>(req, operation, code);
            }

            // the body will be two Operations - the original and the new values.  Verify this
            List<Operation> clientOperations = null;
            code = ProcessRequestBody<List<Operation>>(req, out clientOperations, out operation);
            if (code != HttpStatusCode.OK)  // error encountered processing body
                return ReturnResult<Operation>(req, operation, code);

            // get the original and new operations out of the message body
            Operation originalOperation = clientOperations[0];
            Operation newOperation = clientOperations[1];

            // make sure the operation ID's match
            if (originalOperation.ID != newOperation.ID)
            {
                TraceLog.TraceError("Original and updated entity IDs do not match");
                return ReturnResult<Operation>(req, operation, HttpStatusCode.BadRequest);
            }
            if (originalOperation.ID != id)
            {
                TraceLog.TraceError("ID in URL does not match entity body");
                return ReturnResult<Operation>(req, operation, HttpStatusCode.BadRequest);
            }

            // if the operation does not belong to the authenticated user, return 403 Forbidden
            if (originalOperation.UserID != CurrentUser.ID || newOperation.UserID != CurrentUser.ID)
            {
                TraceLog.TraceError("Entity does not belong to current user");
                return ReturnResult<Operation>(req, operation, HttpStatusCode.Forbidden);
            }

            try
            {
                Operation requestedOperation = this.StorageContext.Operations.Single<Operation>(t => t.ID == id);

                // if the Operation does not belong to the authenticated user, return 403 Forbidden
                if (requestedOperation.UserID != CurrentUser.ID)
                {
                    TraceLog.TraceError("Entity does not belong to current user");
                    return ReturnResult<Operation>(req, operation, HttpStatusCode.Forbidden);
                }

                // call update and make sure the changed flag reflects the outcome correctly
                bool changed = Update(requestedOperation, originalOperation, newOperation);
                if (changed == true)
                {
                    if (this.StorageContext.SaveChanges() < 1)
                    {
                        TraceLog.TraceError("Internal Server Error (database operation did not succeed)");
                        return ReturnResult<Operation>(req, operation, HttpStatusCode.InternalServerError);
                    }
                    else
                    {
                        TraceLog.TraceInfo("Accepted");
                        return ReturnResult<Operation>(req, operation, requestedOperation, HttpStatusCode.Accepted);
                    }
                }
                else
                {
                    TraceLog.TraceInfo("Accepted (no changes)");
                    return ReturnResult<Operation>(req, operation, requestedOperation, HttpStatusCode.Accepted);
                }
            }
            catch (Exception ex)
            {
                // operation not found - return 404 Not Found
                TraceLog.TraceException("Resource not found", ex);
                return ReturnResult<Operation>(req, operation, HttpStatusCode.NotFound);
            }
        }

        private bool Update(Operation requestedOperation, Operation originalOperation, Operation newOperation)
        {
            bool updated = false;
            // timestamps!!
            Type t = requestedOperation.GetType();
            foreach (PropertyInfo pi in t.GetProperties())
            {
                object serverValue = pi.GetValue(requestedOperation, null);
                object origValue = pi.GetValue(originalOperation, null);
                object newValue = pi.GetValue(newOperation, null);

                // if the value has changed, process further 
                if (!Object.Equals(origValue, newValue))
                {
                    // if the server has the original value, make the update
                    if (Object.Equals(serverValue, origValue))
                    {
                        pi.SetValue(requestedOperation, newValue, null);
                        updated = true;
                    }
                }
            }

            return updated;
        }
    }
}