using System;
using System.Collections.Generic;
using System.IO;
using BuiltSteady.Product.ServerEntities;
using BuiltSteady.Product.ServiceHost;
using Newtonsoft.Json.Linq;

namespace BuiltSteady.Product.ServiceHost
{
    public class WorkflowConstants
    {
        private const string IntentsFileName = @"Intents.txt";

        public static string SchemaVersion { get { return "1.0.2012.1002"; } }
        public static string ConstantsVersion { get { return "2012-10-02"; } }

        public static List<GalleryCategory> DefaultGallery()
        {
            // load activity gallery from directories and files
            bool cdBack = false;
            var currDir = Directory.GetCurrentDirectory();
            try
            {
                Directory.SetCurrentDirectory(HostEnvironment.GalleryDirectory);
                cdBack = true;

                var galleryCategories = new List<GalleryCategory>();
                int currID = 0;

                // recursively create categories for each of the directories inside of the activities directory
                Directory.SetCurrentDirectory(@"galleryactivities");
                foreach (var dir in Directory.EnumerateDirectories(@"."))
                    galleryCategories.Add(CreateCategory(dir, null, ref currID, true));

                // do the same for system activities that won't be displayed in the gallery
                Directory.SetCurrentDirectory(@"..\systemactivities");
                foreach (var dir in Directory.EnumerateDirectories(@"."))
                    galleryCategories.Add(CreateCategory(dir, null, ref currID, false));

                cdBack = false;
                Directory.SetCurrentDirectory(currDir);
                return galleryCategories;
            }
            catch (Exception ex)
            {
                TraceLog.TraceException("Reading gallery failed", ex);
                if (cdBack)
                    Directory.SetCurrentDirectory(currDir);
                return null;
            }
        }

        public static List<Intent> DefaultIntents()
        {
            bool cdBack = false;
            var currDir = Directory.GetCurrentDirectory();
            try
            {
                Directory.SetCurrentDirectory(HostEnvironment.WorkflowDirectory);
                cdBack = true;

                if (!File.Exists(IntentsFileName))
                {
                    TraceLog.TraceError("Intents file not found");
                    cdBack = false;
                    Directory.SetCurrentDirectory(currDir);
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
                cdBack = false;
                Directory.SetCurrentDirectory(currDir);
                return intents;
            }
            catch (Exception ex)
            {
                TraceLog.TraceException("Reading intents failed", ex);
                if (cdBack)
                    Directory.SetCurrentDirectory(currDir);
                return null;
            }
        }

        public static List<WorkflowType> DefaultWorkflowTypes()
        {
            // load workflow types from files
            bool cdBack = false;
            var currDir = Directory.GetCurrentDirectory();
            try
            {
                Directory.SetCurrentDirectory(HostEnvironment.WorkflowDirectory);
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
                Directory.SetCurrentDirectory(currDir);
                return workflowTypes;
            }
            catch (Exception ex)
            {
                TraceLog.TraceException("Reading workflows failed", ex);
                if (cdBack)
                    Directory.SetCurrentDirectory(currDir);
                return null;
            }
        }

        static GalleryCategory CreateCategory(string dirname, int? parentID, ref int currID, bool inGallery)
        {
            bool cdBack = false;
            const string prefix = @".\";
            const string suffix = @".json";

            try
            {
                Directory.SetCurrentDirectory(dirname);
                cdBack = true;

                // construct category name
                string categoryName = dirname.StartsWith(prefix) ? dirname.Substring(prefix.Length) : dirname;
                var index = categoryName.IndexOf('-');
                if (index >= 0)
                    categoryName = categoryName.Substring(index + 1);
                
                var galleryCategory = new GalleryCategory()
                {
                    ID = currID++,
                    Name = categoryName,
                    ParentID = parentID,
                    InGallery = inGallery,
                    Activities = new List<GalleryActivity>(),
                    Subcategories = new List<GalleryCategory>()
                };

                foreach (var dir in Directory.EnumerateDirectories(@"."))
                    galleryCategory.Subcategories.Add(CreateCategory(dir, galleryCategory.ID, ref currID, inGallery));

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
                        {
                            // crack the definition open and retrieve the name if available
                            var value = JObject.Parse(activityDef);
                            if (!String.IsNullOrEmpty((string)value["Name"]))
                                activityName = (string)value["Name"];
                            var filter = value["Filter"] != null ? value["Filter"].ToString() : null;

                            int activityID = 0;
                            try
                            {
                                activityID = value["ID"].Value<int>();
                            }
                            catch (Exception ex)
                            {
                                TraceLog.TraceException(String.Format("Activity definition for {0} is missing an ID", activityName), ex);
                                continue;
                            }
                            if (activityID <= 0)
                            {
                                TraceLog.TraceError(String.Format("Activity definition for {0} is missing an ID", activityName));
                                continue;
                            }
                            
                            galleryCategory.Activities.Add(new GalleryActivity() 
                            { 
                                ID = activityID,
                                Name = activityName, 
                                Definition = activityDef, 
                                CategoryID = galleryCategory.ID, 
                                InGallery = inGallery,
                                Filter = filter
                            });
                        }
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
