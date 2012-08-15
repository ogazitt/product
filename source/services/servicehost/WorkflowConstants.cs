using System;
using System.Collections.Generic;
using System.IO;
using BuiltSteady.Product.ServerEntities;
using BuiltSteady.Product.ServiceHost;

namespace BuiltSteady.Product.ServiceHost
{
    public class WorkflowConstants
    {
        private const string IntentsFileName = @"workflows\Intents.txt";

        public static string SchemaVersion { get { return "1.0.2012.0815"; } }
        public static string ConstantsVersion { get { return "2012-08-15 16:20"; } }

        public static List<GalleryCategory> DefaultGallery()
        {
            // load activity gallery from directories and files
            bool cdBack = false;
            try
            {
                Directory.SetCurrentDirectory(@"activities");
                cdBack = true;

                // recursively create categories for each of the directories inside of the activities directory
                var galleryCategories = new List<GalleryCategory>();
                int currID = 0;
                foreach (var dir in Directory.EnumerateDirectories(@"."))
                    galleryCategories.Add(CreateCategory(dir, null, ref currID));

                cdBack = false;
                Directory.SetCurrentDirectory(@"..");
                return galleryCategories;
            }
            catch (Exception ex)
            {
                TraceLog.TraceException("Reading gallery failed", ex);
                if (cdBack)
                    Directory.SetCurrentDirectory(@"..");
                return null;
            }
        }

        public static List<Intent> DefaultIntents()
        {
            try
            {
                if (!File.Exists(IntentsFileName))
                {
                    TraceLog.TraceError("Intents file not found");
                    return null;
                }

                // load intents from file
                var intents = new List<Intent>();
                using (var file = File.Open(IntentsFileName, FileMode.Open, FileAccess.Read))
                using (var reader = new StreamReader(file))
                {
                    string intentDef = reader.ReadLine();
                    while (!String.IsNullOrEmpty(intentDef))
                    {
                        string[] parts = intentDef.Split(new char[] { ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries);
                        if (parts.Length != 3)
                            continue;
                        intents.Add(new Intent()
                        {
                            Verb = parts[0],
                            Noun = parts[1],
                            WorkflowType = parts[2]
                        });
                        intentDef = reader.ReadLine();
                    }
                }
                return intents;
            }
            catch (Exception ex)
            {
                TraceLog.TraceException("Reading intents failed", ex);
                return null;
            }
        }

        public static List<WorkflowType> DefaultWorkflowTypes()
        {
            // load workflow types from files
            bool cdBack = false;
            try
            {
                Directory.SetCurrentDirectory(@"workflows");
                cdBack = true;
                var workflowTypes = new List<WorkflowType>();
                foreach (var filename in Directory.EnumerateFiles(@".", @"*.json"))
                {
                    string prefix = @".\";
                    string suffix = @".json";
                    using (var file = File.Open(filename, FileMode.Open, FileAccess.Read))
                    using (var reader = new StreamReader(file))
                    {
                        // strip ".\" off the beginning of the filename, and the ".json" extension
                        string workflowName = filename.StartsWith(prefix) ? filename.Substring(prefix.Length) : filename;
                        workflowName = workflowName.Replace(suffix, "");

                        string workflowDef = reader.ReadToEnd();
                        if (!String.IsNullOrEmpty(workflowDef))
                            workflowTypes.Add(new WorkflowType() { Type = workflowName, Definition = workflowDef });
                    }
                }
                cdBack = false;
                Directory.SetCurrentDirectory(@"..");
                return workflowTypes;
            }
            catch (Exception ex)
            {
                TraceLog.TraceException("Reading workflows failed", ex);
                if (cdBack)
                    Directory.SetCurrentDirectory(@"..");
                return null;
            }
        }

        static GalleryCategory CreateCategory(string dirname, int? parentID, ref int currID)
        {
            bool cdBack = false;
            const string prefix = @".\";
            const string suffix = @".json";

            try
            {
                Directory.SetCurrentDirectory(dirname);
                cdBack = true;

                string categoryName = dirname.StartsWith(prefix) ? dirname.Substring(prefix.Length) : dirname;
                var galleryCategory = new GalleryCategory()
                {
                    CategoryID = currID++,
                    Name = categoryName,
                    ParentID = parentID,
                    Activities = new List<GalleryActivity>(),
                    Subcategories = new List<GalleryCategory>()
                };

                foreach (var dir in Directory.EnumerateDirectories(@"."))
                    galleryCategory.Subcategories.Add(CreateCategory(dir, galleryCategory.CategoryID, ref currID));

                foreach (var filename in Directory.EnumerateFiles(@".", @"*.json"))
                {
                    using (var file = File.Open(filename, FileMode.Open, FileAccess.Read))
                    using (var reader = new StreamReader(file))
                    {
                        // strip ".\" off the beginning of the filename, and the ".json" extension
                        string activityName = filename.StartsWith(prefix) ? filename.Substring(prefix.Length) : filename;
                        activityName = activityName.Replace(suffix, "");

                        string activityDef = reader.ReadToEnd();
                        if (!String.IsNullOrEmpty(activityDef))
                            galleryCategory.Activities.Add(new GalleryActivity() { Name = activityName, Definition = activityDef, CategoryID = galleryCategory.CategoryID });
                    }
                }
                cdBack = false;
                Directory.SetCurrentDirectory(@"..");
                return galleryCategory;
            }
            catch (Exception ex)
            {
                TraceLog.TraceException("Reading gallery failed", ex);
                if (cdBack)
                    Directory.SetCurrentDirectory(@"..");
                return null;
            }
        }
    }
}
