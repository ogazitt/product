using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using BuiltSteady.Product.ServiceHost;
using BuiltSteady.Product.ServerEntities;

namespace BuiltSteady.Product.ActivityGallery
{
    public class ActivityProcessor
    {
        public static void InstallCategory(UserStorageContext userContext, SuggestionsStorageContext suggestionsContext, User user, Folder category, Guid? parentID, string name)
        {
            try
            {
                // find the gallery category in the database
                GalleryCategory galleryCategory = suggestionsContext.GalleryCategories.FirstOrDefault(gc => gc.Name == name);
                if (galleryCategory == null)
                {
                    TraceLog.TraceError("InstallCategory could not find Category named " + name);
                    return;
                }

                // if the caller wants to create a new Category, create the folder
                if (category == null)
                {
                    category = new Folder()
                    {
                        ID = Guid.NewGuid(),
                        Name = name,
                        UserID = user.ID,
                        //TODO: set SortOrder to the end of the list
                    };
                    userContext.Folders.Add(category);
                    userContext.SaveChanges();
                    parentID = null;
                }
                else
                {
                    // otherwise, create this (sub)category as a subitem
                    DateTime now = DateTime.Now;
                    var subCategory = new Item()
                    {
                        ID = Guid.NewGuid(),
                        Name = name,
                        FolderID = category.ID,
                        ParentID = parentID,
                        UserID = category.UserID,
                        Created = now,
                        LastModified = now,
                    };
                    userContext.Items.Add(subCategory);
                    userContext.SaveChanges();
                    parentID = subCategory.ID;
                }

                // process all of the subcategories under this (sub)category in the database
                var subCategories = suggestionsContext.GalleryCategories.Where(gc => gc.ParentID == galleryCategory.CategoryID);
                foreach (var sc in subCategories)
                    InstallCategory(userContext, suggestionsContext, user, category, parentID, sc.Name);

                // process all the Activities under this (sub)category
                var activities = suggestionsContext.GalleryActivities.Where(ga => ga.CategoryID == galleryCategory.CategoryID);
                foreach (var activity in activities)
                    InstallActivity(userContext, suggestionsContext, category, parentID, activity);
            }
            catch (Exception ex)
            {
                TraceLog.TraceException("InstallCategory failed", ex);
            }
        }

        public static void InstallActivity(UserStorageContext userContext, SuggestionsStorageContext suggestionsContext, Folder category, Guid? subCategory, string name)
        {
            try
            {
                // find the gallery activity in the database
                var ga = suggestionsContext.GalleryActivities.FirstOrDefault(a => a.Name == name);
                if (ga != null)
                    InstallActivity(userContext, suggestionsContext, category, subCategory, ga);
                else
                    TraceLog.TraceError("Could not find gallery activity named " + name);
            }
            catch (Exception ex)
            {
                TraceLog.TraceException("InstallActivity failed", ex);
            }
        }

        public static void InstallActivity(UserStorageContext userContext, SuggestionsStorageContext suggestionsContext, Folder category, Guid? subCategory, GalleryActivity galleryActivity)
        {
            try
            {
                // deserialize the definition
                var def = JsonSerializer.Deserialize<ActivityDefinition>(galleryActivity.Definition);

                // create the new item corresponding to the activity
                DateTime now = DateTime.Now;
                var activity = new Item()
                {
                    ID = Guid.NewGuid(),
                    Name = def.Name,
                    FolderID = category.ID,
                    ParentID = subCategory,
                    UserID = category.UserID,
                    Created = now,
                    LastModified = now,
                };

                // TODO: set the cadence
                userContext.Items.Add(activity);
                userContext.SaveChanges();

                // install all the steps for the activity
                foreach (var step in def.Steps)
                    InstallStep(userContext, category, activity.ID, step);
            }
            catch (Exception ex)
            {
                TraceLog.TraceException("InstallActivity failed", ex);
            }
        }

        public static void InstallStep(UserStorageContext userContext, Folder category, Guid activity, ActivityStep activityStep)
        {
            try
            {
                DateTime now = DateTime.Now;
                var step = new Item()
                {
                    ID = Guid.NewGuid(),
                    Name = activityStep.Name,
                    FolderID = category.ID,
                    ParentID = activity,
                    Created = now,
                    LastModified = now,
                };
                userContext.Items.Add(step);
                userContext.SaveChanges();
            }
            catch (Exception ex)
            {
                TraceLog.TraceException("InstallStep failed for step " + activityStep.Name, ex);
            }
        }
    }
}
