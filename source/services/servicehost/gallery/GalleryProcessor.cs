using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using BuiltSteady.Product.ServiceHost;
using BuiltSteady.Product.ServerEntities;
using BuiltSteady.Product.Shared.Entities;

namespace BuiltSteady.Product.ServiceHost.Gallery
{
    public class GalleryProcessor
    {
        public static bool InstallCategory(UserStorageContext userContext, SuggestionsStorageContext suggestionsContext, User user, Folder category, Guid? parentID, GalleryCategory newCategory)
        {
            try
            {
                // find the gallery category in the database
                GalleryCategory galleryCategory = suggestionsContext.GalleryCategories.FirstOrDefault(gc => gc.ID == newCategory.ID);
                if (galleryCategory == null)
                {
                    TraceLog.TraceError("InstallCategory could not find Category ID " + newCategory.ID);
                    return false;
                }

                // if the caller didn't pass in a Category, merge with an existing folder (by name), or create a new folder
                if (category == null)
                {
                    category = userContext.Folders.FirstOrDefault(f => f.UserID == user.ID && f.Name == newCategory.Name);
                    if (category == null)
                    {
                        category = new Folder()
                        {
                            ID = Guid.NewGuid(),
                            Name = galleryCategory.Name,
                            UserID = user.ID,
                            ItemTypeID = SystemItemTypes.Category,
                        };

                        // make this the last category in the list
                        float sortOrder = (userContext.Folders.Any(i => i.UserID == user.ID && i.ItemTypeID == SystemItemTypes.Category) ?
                            userContext.Folders.Where(i => i.UserID == user.ID && i.ItemTypeID == SystemItemTypes.Category).
                            Select(i => i.SortOrder).
                            Max() :
                            0f) + 1000f;
                        category.SortOrder = sortOrder;

                        userContext.Folders.Add(category);
                        userContext.SaveChanges();
                    }
                    parentID = null;
                }
                else
                {
                    // otherwise, create this (sub)category as a subitem
                    DateTime now = DateTime.Now;
                    var subCategory = new Item()
                    {
                        ID = Guid.NewGuid(),
                        Name = galleryCategory.Name,
                        FolderID = category.ID,
                        ParentID = parentID,
                        UserID = category.UserID,
                        ItemTypeID = SystemItemTypes.Category,
                        IsList = true,
                        Created = now,
                        LastModified = now,
                    };
                    
                    // make this the last subcategory in the category
                    float sortOrder = (userContext.Items.Any(i => i.UserID == category.UserID && i.FolderID == category.ID && 
                                                                  i.ParentID == parentID && i.ItemTypeID == SystemItemTypes.Category) ?
                        userContext.Items.Where(i => i.UserID == category.UserID && i.FolderID == category.ID && 
                                                     i.ParentID == parentID && i.ItemTypeID == SystemItemTypes.Category).
                        Select(i => i.SortOrder).
                        Max() :
                        0f) + 1000f;
                    subCategory.SortOrder = sortOrder;

                    userContext.Items.Add(subCategory);
                    userContext.SaveChanges();
                    parentID = subCategory.ID;
                }

                // process all of the subcategories under this (sub)category in the database
                var subCategories = suggestionsContext.GalleryCategories.Where(gc => gc.ParentID == galleryCategory.ID);
                foreach (var sc in subCategories)
                    InstallCategory(userContext, suggestionsContext, user, category, parentID, sc);

                // process all the Activities under this (sub)category
                var activities = suggestionsContext.GalleryActivities.Where(ga => ga.CategoryID == galleryCategory.ID);
                foreach (var activity in activities)
                    InstallActivity(userContext, suggestionsContext, category, parentID, activity);
            }
            catch (Exception ex)
            {
                TraceLog.TraceException("InstallCategory failed", ex);
                return false;
            }
            return true;
        }

        public static bool InstallActivity(UserStorageContext userContext, SuggestionsStorageContext suggestionsContext, Folder category, Guid? subCategory, int id)
        {
            try
            {
                // find the gallery activity in the database
                var ga = suggestionsContext.GalleryActivities.FirstOrDefault(a => a.ID == id);
                if (ga != null)
                    return InstallActivity(userContext, suggestionsContext, category, subCategory, ga);
                else
                    TraceLog.TraceError("Could not find gallery activity ID " + id);
                return false;
            }
            catch (Exception ex)
            {
                TraceLog.TraceException("InstallActivity failed", ex);
                return false;
            }
        }

        public static bool InstallActivity(UserStorageContext userContext, SuggestionsStorageContext suggestionsContext, Folder category, Guid? subCategory, GalleryActivity galleryActivity)
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
                    ItemTypeID = SystemItemTypes.Activity, 
                    IsList = true, 
                    Status = StatusTypes.Paused,
                    Created = now,
                    LastModified = now,
                };
                
                // make this the last activity in the (sub)category
                float sortOrder = (userContext.Items.Any(i => i.UserID == category.UserID && i.FolderID == category.ID && 
                                                              i.ParentID == subCategory && i.ItemTypeID == SystemItemTypes.Activity) ? 
                    userContext.Items.Where(i => i.UserID == category.UserID && i.FolderID == category.ID && 
                                                 i.ParentID == subCategory && i.ItemTypeID == SystemItemTypes.Activity).
                    Select(i => i.SortOrder).
                    Max() : 
                    0f) + 1000f;
                activity.SortOrder = sortOrder;

                // if provided, set the default cadence of the activity
                if (def.Recurrence != null)
                    activity.GetFieldValue(FieldNames.Repeat, true).Value = def.Recurrence;

                userContext.Items.Add(activity);
                userContext.SaveChanges();

                // install all the steps for the activity
                sortOrder = 1000f;
                foreach (var step in def.Steps)
                {
                    InstallStep(userContext, category, activity.ID, step, sortOrder);
                    sortOrder += 1000f;
                }
            }
            catch (Exception ex)
            {
                TraceLog.TraceException("InstallActivity failed", ex);
                return false;
            }
            return true;
        }

        public static void InstallStep(UserStorageContext userContext, Folder category, Guid activity, ActivityStep activityStep, float sortOrder)
        {
            try
            {
                DateTime now = DateTime.Now;
                var step = new Item()
                {
                    ID = Guid.NewGuid(),
                    Name = activityStep.Name,
                    FolderID = category.ID,
                    UserID = category.UserID,
                    ParentID = activity,
                    ItemTypeID = SystemItemTypes.Step,
                    SortOrder = sortOrder,
                    Created = now,
                    LastModified = now,
                    FieldValues = new List<FieldValue>()
                };
                step.GetFieldValue(FieldNames.ActionType, true).Value = activityStep.Action;
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
