﻿namespace BuiltSteady.Product.Website.Controllers
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

    public class DashboardController : BaseController
    {

        public ActionResult Home(bool renewFBToken = false, string consentStatus = null)
        {
            UserDataModel model = new UserDataModel(this);
            try
            {   
                // force access to validate current user
                var userData = model.UserData;
                model.RenewFBToken = renewFBToken;
                model.ConsentStatus = consentStatus;
                // TODO: if consent fails, un-Choose the Suggestion

                // if this is a mobile client, redirect to the mobile page
                if (Request.Url.PathAndQuery == "/" && BrowserAgent.IsMobile(Request.UserAgent))
                    return RedirectToAction("Home", "Mobile");
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
        
        public ActionResult Initialize(int id = 0)
        {
            UserDataModel model = new UserDataModel(this);
            try
            {
                if (model.UserData.Folders.Count == 0)
                {   // only create default folders if no folders exist
                    CreateDefaultFolders(model);
                }
            }
            catch (Exception)
            {
                if (id++ < 3)
                {   // retry upto 3 times before giving up
                    return RedirectToAction("Initialize", "Dashboard", new { id = id });
                }
            } 
            // redirect to profile wizard after registration
            return RedirectToAction("Wizard", "UserInfo");
        }

        // partial html response - help carousel
        public ActionResult Help()
        {
            return View("HelpCarouselControl");
        }

        void CreateDefaultFolders(UserDataModel model)
        {
            try
            {
                List<Folder> folders = UserConstants.DefaultFolders(this.CurrentUser);
                foreach (var folder in folders)
                {
                    // child items must be added AFTER saving parent items 
                    // EF cannot determine which items are dependent on eachother
                    List<Item> folderItems = new List<Item>();
                    List<Item> childItems = new List<Item>();
                    foreach (var item in folder.Items)
                    {
                        if (item.ParentID == null) { folderItems.Add(item); }
                        else childItems.Add(item);
                    }
                    folder.Items = folderItems;
                    model.StorageContext.Folders.Add(folder);
                    model.StorageContext.SaveChanges();

                    if (childItems.Count > 0)
                    {
                        foreach (var item in childItems)
                        {
                            model.StorageContext.Items.Add(item);
                        }
                        model.StorageContext.SaveChanges();
                    }
                }

                // create an operation corresponding to the new user creation
                var operation = model.StorageContext.CreateOperation(this.CurrentUser, "POST", (int?)HttpStatusCode.Created, this.CurrentUser, null);

                // kick off the New User workflow
                WorkflowHost.WorkflowHost.InvokeWorkflowForOperation(model.StorageContext, null, operation);
            }
            catch (Exception ex)
            {
                TraceLog.TraceException("CreateDefaultFolders failed", ex);
                throw;
            }
        }

    }
}
