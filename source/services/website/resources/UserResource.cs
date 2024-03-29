﻿namespace BuiltSteady.Product.Website.Resources
{
    using System;
    using System.Collections.Generic;
    using System.Configuration;
    using System.Linq;
    using System.Net;
    using System.Net.Http;
    using System.Net.Http.Headers;
    using System.ServiceModel;
    using System.ServiceModel.Web;
    using System.Text.RegularExpressions;
    using System.Web;
    using System.Web.Configuration;
    using System.Web.Security;
    using Microsoft.ApplicationServer.Http;

    using BuiltSteady.Product.ServerEntities;
    using BuiltSteady.Product.ServiceHost;
    using BuiltSteady.Product.Website.Helpers;
    using BuiltSteady.Product.Website.Models;

    [ServiceContract]
    [LogMessages]
    public class UserResource : BaseResource
    {

        [WebInvoke(Method = "POST", UriTemplate = "")]
        [LogMessages]
        public HttpResponseMessageWrapper<User> CreateUser(HttpRequestMessage req)
        {
            Operation operation = null;
            HttpStatusCode code = HttpStatusCode.BadRequest;
            // get the new user from the message body (password is not deserialized)
            BasicAuthCredentials newUser = null;
            code = ProcessRequestBody<BasicAuthCredentials>(req, out newUser, out operation);
            if (code != HttpStatusCode.OK)  // error encountered processing body
                return ReturnResult<User>(req, operation, code);

            // get password from message headers
            BasicAuthCredentials userCreds = GetUserFromMessageHeaders(req);

            if (userCreds.Name.Equals(newUser.Name, StringComparison.OrdinalIgnoreCase))
            {   // verify same name in both body and auth header
                newUser.Password = userCreds.Password;
                code = CreateUser(newUser);
            }
            else
            {   // invalid message
                TraceLog.TraceError("Name in message body and authorization header do not match");
                code = HttpStatusCode.NotAcceptable;
            }

            if (code == HttpStatusCode.Created)
            {
                // kick off the New User workflow
                WorkflowHost.WorkflowHost.InvokeWorkflowForOperation(this.StorageContext, null, operation);
                return ReturnResult<User>(req, operation, newUser.AsUser(), HttpStatusCode.Created);
            }
            else
                return ReturnResult<User>(req, operation, code);
        }

        private HttpStatusCode CreateUser(BasicAuthCredentials user)
        {
            MembershipCreateStatus createStatus;
            TraceLog.TraceFunction();  // log function entrance

            try
            {   // create new user account using the membership provider
                MembershipUser mu = Membership.CreateUser(user.Name, user.Password, user.Email, null, null, true, user.ID, out createStatus);
                if (createStatus == MembershipCreateStatus.Success)
                {
                    return HttpStatusCode.Created;
                }
                if (createStatus == MembershipCreateStatus.DuplicateUserName)
                {
                    return HttpStatusCode.Conflict;
                }                
                if (createStatus == MembershipCreateStatus.InvalidUserName ||
                    createStatus == MembershipCreateStatus.InvalidEmail || 
                    createStatus == MembershipCreateStatus.InvalidPassword)
                {
                    return HttpStatusCode.NotAcceptable;
                } 
            }
            catch (Exception)
            { }

            TraceLog.TraceError("Failed to create new user account: " + user.Name);
            return HttpStatusCode.Conflict;
        }


        // this would be way more efficient with a single sproc which validates all constraints
        [WebInvoke(UriTemplate = "{id}", Method = "DELETE")]
        public HttpResponseMessageWrapper<User> DeleteUser(HttpRequestMessage req, Guid id)
        {
            Operation operation = null;
            HttpStatusCode code = AuthenticateUser(req);
            if (code != HttpStatusCode.OK)
            {   // user is not authenticated
                return ReturnResult<User>(req, operation, code);
            }

            // get the tag from the message body if one was passed
            User clientUser;
            if (req.Content.Headers.ContentLength > 0)
            {
                code = ProcessRequestBody<User>(req, out clientUser, out operation);
                if (code != HttpStatusCode.OK)  // error encountered processing body
                    return ReturnResult<User>(req, operation, code);

                if (clientUser.ID != id)
                {   // IDs must match
                    TraceLog.TraceError("ID in URL does not match entity body");
                    return ReturnResult<User>(req, operation, HttpStatusCode.BadRequest);
                }
            }
            else
            {
                // otherwise get the client user from the database
                try
                {
                    clientUser = this.StorageContext.Users.Single<User>(u => u.ID == id);
                    var session = GetSessionFromMessageHeaders(req);
                    operation = this.StorageContext.CreateOperation(CurrentUser, req.Method.Method, null, clientUser, null, session);
                }
                catch (Exception)
                {   // user not found - it may have been deleted by someone else.  Return 200 OK.
                    TraceLog.TraceInfo("Entity not found, return OK");
                    return ReturnResult<User>(req, operation, HttpStatusCode.OK);
                }
            }

            // verify credentials passed in headers match the user in request body
            // disallows one user deleting another user (may want to allow in future with proper permissions)
            if (clientUser.Name.Equals(CurrentUser.Name, StringComparison.OrdinalIgnoreCase))
            {
                return ReturnResult<User>(req, operation, HttpStatusCode.BadRequest);
            }

            try
            {
                // verify user id in storage matches id being deleted
                User storedUser = this.StorageContext.Users.Single<User>(u => u.Name == clientUser.Name.ToLower());
                if (storedUser.ID != clientUser.ID)
                {
                    return ReturnResult<User>(req, operation, HttpStatusCode.Forbidden);
                }
                
                if (Membership.DeleteUser(CurrentUser.Name))
                {   // delete user and all related data
                    return ReturnResult<User>(req, operation, clientUser, HttpStatusCode.Accepted);
                }
            }
            catch (Exception)
            { }
            return ReturnResult<User>(req, operation, HttpStatusCode.InternalServerError);
        }

        [WebGet(UriTemplate = "")]
        [LogMessages]
        public HttpResponseMessageWrapper<User> GetCurrentUser(HttpRequestMessage req)
        {
            Operation operation = null;
            HttpStatusCode code = AuthenticateUser(req);
            if (code != HttpStatusCode.OK)
            {   // user not authenticated
                return ReturnResult<User>(req, operation, code);  
            }

            try
            {
                UserDataModel model = new UserDataModel(this);
                // make sure the response isn't cached
                var response = ReturnResult<User>(req, operation, model.UserData, HttpStatusCode.OK);
                response.Headers.CacheControl = new CacheControlHeaderValue() { NoCache = true };
                return response;
            }
            catch (Exception)
            {   // no such user account - return 404 Not Found
                return ReturnResult<User>(req, operation, HttpStatusCode.NotFound);               
            }
        }

        // TODO: why would we allow one user to access data for another user? Can we remove this method?
        [WebGet(UriTemplate = "{id}")]
        [LogMessages]
        public HttpResponseMessageWrapper<User> GetUser(HttpRequestMessage req, Guid id)
        {
            Operation operation = null;
            HttpStatusCode code = AuthenticateUser(req);
            if (code != HttpStatusCode.OK)
            {   // user not authenticated
                return ReturnResult<User>(req, operation, code);
            }

            try
            {
                User requestedUser = this.StorageContext.Users.Single<User>(u => u.ID == id);
                return ReturnResult<User>(req, operation, requestedUser, code);
            }
            catch (Exception)
            {   // no such user account - return 404 Not Found
                return ReturnResult<User>(req, operation, HttpStatusCode.NotFound);
            }
        }

        [WebGet(UriTemplate = "{id}/folderitems")]
        [LogMessages]
        public HttpResponseMessageWrapper<List<Folder>> GetFoldersForUser(HttpRequestMessage req, Guid id)
        {
            Operation operation = null;
            HttpStatusCode code = AuthenticateUser(req);
            if (code != HttpStatusCode.OK)
            {   // user not authenticated
                return ReturnResult<List<Folder>>(req, operation, code);  
            }

            try
            {
                User requestedUser = this.StorageContext.Users.Single<User>(u => u.ID == id);

                // if the requested user is not the same as the authenticated user, return 403 Forbidden
                if (requestedUser.ID != CurrentUser.ID)
                {
                    return ReturnResult<List<Folder>>(req, operation, HttpStatusCode.Forbidden);
                }
                else
                {
                    try
                    {
                        var folderitems = this.StorageContext.Folders.
                            Include("FolderUsers").
                            Include("Items.ItemTags").
                            Include("Items.FieldValues").
                            Where(f => f.FolderUsers.Any(fu => fu.UserID == id)).
                            ToList();
                        var response = ReturnResult<List<Folder>>(req, operation, folderitems, HttpStatusCode.OK);
                        response.Headers.CacheControl = new CacheControlHeaderValue() { NoCache = true };
                        return response;
                    }
                    catch (Exception)
                    {   // items not found - return 404 Not Found
                        return ReturnResult<List<Folder>>(req, operation, HttpStatusCode.NotFound);
                    }
                }
            }
            catch (Exception)
            {   // no such user account - return 404 Not Found
                return ReturnResult<List<Folder>>(req, operation, HttpStatusCode.NotFound);
            }
        }

        [WebInvoke(UriTemplate = "{id}", Method = "PUT")]
        public HttpResponseMessageWrapper<User> UpdateUser(HttpRequestMessage req, Guid id)
        {
            Operation operation = null;
            HttpStatusCode code = AuthenticateUser(req);
            if (code != HttpStatusCode.OK)
            {   // user not authenticated
                return ReturnResult<User>(req, operation, code);
            }

            // verify body contains two sets of user data - the original values and the new values
            List<BasicAuthCredentials> userCreds = null;
            code = ProcessRequestBody<List<BasicAuthCredentials>>(req, out userCreds, out operation);
            if (code != HttpStatusCode.OK)  // error encountered processing body
                return ReturnResult<User>(req, operation, code);

            // get the original and new items out of the message body
            BasicAuthCredentials originalUserData = userCreds[0];
            BasicAuthCredentials newUserData = userCreds[1];

            // make sure the item ID's match
            if (originalUserData.ID != newUserData.ID || originalUserData.ID != id)
            {
                return ReturnResult<User>(req, operation, HttpStatusCode.BadRequest);
            }
       
            try
            {   // TODO: should we allow changing of username?

                // check to make sure the old password passed in the message is valid
                if (!Membership.ValidateUser(CurrentUser.Name, originalUserData.Password))
                {   
                    return ReturnResult<User>(req, operation, HttpStatusCode.Forbidden);
                }

                MembershipUser mu = Membership.GetUser(originalUserData.Name);
                if (!mu.Email.Equals(newUserData.Email, StringComparison.OrdinalIgnoreCase))
                {   
                    mu.Email = newUserData.Email;
                    Membership.UpdateUser(mu);   
                }
                if (originalUserData.Password != newUserData.Password)
                {   
                    mu.ChangePassword(originalUserData.Password, newUserData.Password);    
                }

                User currentUser = this.StorageContext.Users.Single<User>(u => u.ID == CurrentUser.ID);
                return ReturnResult<User>(req, operation, currentUser, HttpStatusCode.Accepted);
            }
            catch (Exception)
            {
                return ReturnResult<User>(req, operation, HttpStatusCode.InternalServerError);
            }
        }
    }
}