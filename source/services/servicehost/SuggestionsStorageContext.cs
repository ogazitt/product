﻿namespace BuiltSteady.Product.ServiceHost
{
    using System;
    using System.Data.Entity;
    using System.Linq;
    using BuiltSteady.Product.ServerEntities;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    // ****************************************************************************
    // storage context for the Suggestions database
    // ****************************************************************************
    public class SuggestionsStorageContext : DbContext
    {
        public SuggestionsStorageContext() : base(HostEnvironment.SuggestionsConnection) { }
        public SuggestionsStorageContext(string connection) : base(connection) { }
        
        protected override void OnModelCreating(DbModelBuilder modelBuilder) 
        {
            modelBuilder.Entity<GalleryActivity>().
                HasKey(ga => ga.ID).
                Property(ga => ga.ID).
                HasColumnName("ActivityID");
            modelBuilder.Entity<GalleryActivity>().
                Property(ga => ga.ID).
                HasDatabaseGeneratedOption(DatabaseGeneratedOption.None);
            modelBuilder.Entity<GalleryCategory>().
                HasMany(gc => gc.Subcategories).
                WithOptional().
                HasForeignKey(gc => gc.ParentID);
            modelBuilder.Entity<GalleryCategory>().
                HasMany(gc => gc.Activities).
                WithOptional().
                HasForeignKey(ga => ga.CategoryID);
        }

        public DbSet<GalleryActivity> GalleryActivities { get; set; }
        public DbSet<GalleryCategory> GalleryCategories { get; set; }
        public DbSet<Intent> Intents { get; set; }
        public DbSet<Suggestion> Suggestions { get; set; }
        public DbSet<Timer> Timers { get; set; }
        public DbSet<WorkflowInstance> WorkflowInstances { get; set; }
        public DbSet<WorkflowType> WorkflowTypes { get; set; }
        public DbSet<DatabaseVersion> Versions { get; set; }

        // check if schema version in Suggestion database and WorkflowConstants match
        public bool CheckSchemaVersion()
        {   
            var match = Versions.Any(v => v.VersionType == DatabaseVersion.Schema && v.VersionString == WorkflowConstants.SchemaVersion);
            if (match == false)
            {
                TraceLog.TraceError(String.Format("Suggestions database schema version {0} not found", WorkflowConstants.SchemaVersion));
            }
            return match;
        }

        // update constants in Suggestion database to current version defined in WorkflowConstants
        public bool VersionConstants(string me, bool onlyGallery = false)
        {   
            try
            {
                bool updateDB = false;
                if (Versions.Any(v => v.VersionType == DatabaseVersion.Constants && v.VersionString == WorkflowConstants.ConstantsVersion) == false)
                {   // no database - create and lock the new version entry
                    TraceLog.TraceInfo(String.Format("Suggestions database version {0} not found", WorkflowConstants.ConstantsVersion));

                    // remove any existing database version (there should never be more than one)
                    foreach (var existingVersion in Versions.Where(v => v.VersionType == DatabaseVersion.Constants).ToList())
                    {
                        Versions.Remove(existingVersion);
                    }
                    SaveChanges();
                    
                    // create the new version entry
                    DatabaseVersion ver = new DatabaseVersion()
                    {
                        VersionType = DatabaseVersion.Constants,
                        VersionString = WorkflowConstants.ConstantsVersion,
                        Status = me
                    };
                    Versions.Add(ver);
                    SaveChanges();
                    updateDB = true;
                }
                else
                {
                    var dbVersion = Versions.Single(v => v.VersionType == DatabaseVersion.Constants && v.VersionString == WorkflowConstants.ConstantsVersion);
                    if (dbVersion.Status == DatabaseVersion.Corrupted)
                    {   // try to update the database again - take a lock
                        TraceLog.TraceInfo("Suggestions database corrupted");
                        dbVersion.Status = me;
                        SaveChanges();
                        updateDB = true;
                    }
                }
                if (updateDB == false)
                {
                    TraceLog.TraceInfo(String.Format("Suggestions database version {0} is up to date", WorkflowConstants.ConstantsVersion));
                    return true;
                }
            }
            catch (Exception ex)
            {
                TraceLog.TraceException("Could not find database version", ex);
                return false;
            }

            // update the default database values
            DatabaseVersion version = null;
            SuggestionsStorageContext versionContext = Storage.NewSuggestionsContext;
            try
            {   // verify that this unit of execution owns the update lock for the database version
                version = versionContext.Versions.Single(v => v.VersionType == DatabaseVersion.Constants && v.VersionString == WorkflowConstants.ConstantsVersion);
                if (version.Status != me)  
                    return true;

                TraceLog.TraceInfo(String.Format("{0} updating Suggestions database to version {1}", me, WorkflowConstants.ConstantsVersion));

                // try to update the gallery, and if the onlyGallery flag is false (which is the default), also try to update the workflows
                if (!UpdateGallery() || 
                    !onlyGallery && !UpdateWorkflows())
                {
                    version.Status = DatabaseVersion.Corrupted;
                    versionContext.SaveChanges();
                    return false;
                }

                // save the new version number
                version.Status = DatabaseVersion.OK;
                versionContext.SaveChanges();

                return true;
            }
            catch (Exception ex)
            {
                TraceLog.TraceException("VersionConstants failed", ex);
                // mark the version as corrupted
                version.Status = DatabaseVersion.Corrupted;
                versionContext.SaveChanges();
                return false;
            }
        }

        bool UpdateGallery()
        {
            // remove existing gallery activities and categories
            RemoveGalleryCategory(null);
            var categories = WorkflowConstants.DefaultGallery();
            if (categories == null)
            {
                TraceLog.TraceError("Could not find or load categories");
                return false;
            }
            // add current categories
            foreach (var entity in categories)
                AddGalleryCategory(entity);
            SaveChanges();
            TraceLog.TraceInfo("Replaced categories");

            return true;
        }

        bool UpdateWorkflows()
        {
            // remove existing intents 
            foreach (var entity in Intents.ToList()) { Intents.Remove(entity); }
            var intents = WorkflowConstants.DefaultIntents();
            if (intents == null)
            {
                TraceLog.TraceError("Could not find or load intents");
                return false;
            }
            // add current intents
            foreach (var entity in intents) { Intents.Add(entity); }
            SaveChanges();
            TraceLog.TraceInfo("Replaced intents");

            // remove existing timers 
            foreach (var entity in Timers.ToList()) { Timers.Remove(entity); }
            var timers = WorkflowConstants.DefaultTimers();
            if (timers == null)
            {
                TraceLog.TraceError("Could not find or load timers");
                return false;
            }
            // add current timers
            foreach (var entity in timers) { Timers.Add(entity); }
            SaveChanges();
            TraceLog.TraceInfo("Replaced timers");

            // remove existing workflow types
            foreach (var entity in WorkflowTypes.ToList()) { WorkflowTypes.Remove(entity); }
            var workflowTypes = WorkflowConstants.DefaultWorkflowTypes();
            if (workflowTypes == null)
            {
                TraceLog.TraceError("Could not find or load workflow definitions");
                return false;
            }
            // add current workflow types
            foreach (var entity in workflowTypes) { WorkflowTypes.Add(entity); }
            SaveChanges();
            TraceLog.TraceInfo("Replaced workflow types");
            
            return true;
        }

        void AddGalleryCategory(GalleryCategory gc)
        {
            if (gc == null) 
                return;

            var subcats = gc.Subcategories;
            gc.Subcategories = null;
            GalleryCategories.Add(gc);
            SaveChanges();
            foreach (var sc in subcats)
            {
                // fix the parent ID for this subcategory before adding
                sc.ParentID = gc.ID;
                AddGalleryCategory(sc);
            }

            var e = false;
            if (e && gc.Activities != null && gc.Activities.Count > 0)
            {
                foreach (var a in gc.Activities)
                    GalleryActivities.Add(a);
                SaveChanges();
            }
        }

        void RemoveGalleryCategory(GalleryCategory gc)
        {
            int? id = gc != null ? (int?)gc.ID : null;
            
            // process this gallery category's children recursively

            List<GalleryCategory> list = null;
            if (gc == null)
            {
                var cats = GalleryCategories.Include("Subcategories.Activities").Include("Activities").Where(c => c.ParentID == null);
                list = cats.ToList();
            }
            else
            {
                var cats = GalleryCategories.Include("Subcategories.Activities").Include("Activities").Where(c => c.ParentID == id);
                list = cats.ToList();
            }
            foreach (var c in list)
                RemoveGalleryCategory(c);

            // remove this gallery category and its activities (except for the base case, where the category passed in is null)
            if (gc != null)
            {
                foreach (var a in gc.Activities.ToList())
                    GalleryActivities.Remove(a); 
                GalleryCategories.Remove(gc);
                SaveChanges();
            }
        }
    }
}