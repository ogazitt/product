﻿using System;
using System.Collections.Generic;
using System.Linq;
using BuiltSteady.Product.ServerEntities;
using BuiltSteady.Product.ServiceHost;
using BuiltSteady.Product.ServiceUtilities.FBGraph;
using BuiltSteady.Product.Shared.Entities;

namespace BuiltSteady.Product.WorkflowHost.Activities
{
    public class GenerateSubjectLikes : WorkflowActivity
    {
        public override string GroupDisplayName { get { return JsonSerializer.Serialize(new List<string>() { "Choose from", "$(" + ActivityVariables.SubjectHint + ")'s", "Facebook interests" }); } }
        public override string OutputParameterName { get { return ActivityVariables.LikeSuggestionList; } }
        public override string SuggestionType { get { return SuggestionTypes.ChooseManyWithChildren; } }
        public override Func<WorkflowInstance, ServerEntity, object, Status> Function
        {
            get
            {
                return ((workflowInstance, entity, data) =>
                {
                    Item item = entity as Item;
                    if (item == null)
                    {
                        TraceLog.TraceError("Entity is not an Item");
                        return Status.Error;
                    }

                    if (VerifyItemType(item, SystemItemTypes.Task) == false)
                        return Status.Error;

                    // check for user selection
                    if (data != null)
                        return ProcessActivityData(workflowInstance, data);

                    // analyze the item for possible suggestions
                    var suggestions = new Dictionary<string, string>();
                    Status status = GenerateSuggestions(workflowInstance, entity, suggestions);

                    // if the function completed with an error, or without generating any data, return (this is typically a fail-fast state)
                    if (status == Status.Error || suggestions.Count == 0)
                        return status;

                    // construct the group display name
                    string groupDisplayName = GroupDisplayName;
                    if (groupDisplayName == null)
                        groupDisplayName = workflowInstance.State;
                    else
                        groupDisplayName = FormatStringTemplate(workflowInstance, groupDisplayName);

                    // add suggestions received from the suggestion function
                    try
                    {
                        // build the JSON-formated output list: [ { "Like": "val", "ParentID": "guid" }, { ... } ]
                        var likeList = new List<Dictionary<string, string>>();
                        int num = 0;
                        
                        // handle the case where no likes come back - create one "like" which has an empty value
                        if (suggestions.Keys.Count == 0)
                            suggestions["General"] = "";

                        foreach (var s in suggestions.Keys)
                        {
                            // limit to four suggestions
                            if (num++ == 4)
                                break;

                            var sugg = new Suggestion()
                            {
                                ID = Guid.NewGuid(),
                                EntityID = entity.ID,
                                EntityType = entity.GetType().Name,
                                WorkflowType = workflowInstance.WorkflowType,
                                WorkflowInstanceID = workflowInstance.ID,
                                State = workflowInstance.State,
                                SuggestionType = SuggestionType,
                                DisplayName = s,
                                GroupDisplayName = groupDisplayName,
                                SortOrder = num,
                                Value = suggestions[s],
                                TimeSelected = null
                            };
                            SuggestionsContext.Suggestions.Add(sugg);

                            // build this iteration of the JSON-formated output list: [ { "Like": "val", "ParentID": "guid" }, { ... } ]
                            var vars = new Dictionary<string, string>()
                            {
                                { ActivityVariables.Like, s},
                                { ActivityVariables.ParentID, sugg.ID.ToString() }
                            };
                            likeList.Add(vars);
                        }

                        // save the generated suggestions
                        SuggestionsContext.SaveChanges();

                        // set the results of this state
                        string serializedLikeList = JsonSerializer.Serialize(likeList);
                        StoreInstanceData(workflowInstance, OutputParameterName, serializedLikeList);
                        StoreInstanceData(workflowInstance, ActivityVariables.LastStateData, serializedLikeList);

                        return status;
                    }
                    catch (Exception ex)
                    {
                        TraceLog.TraceException("Activity execution failed", ex);
                        return Status.Error;
                    }
                });
            }
        }

        private Status GenerateSuggestions(WorkflowInstance workflowInstance, ServerEntity entity, Dictionary<string, string> suggestionList)
        {
            Item item = entity as Item;
            if (item == null)
            {
                TraceLog.TraceError("Entity is not an Item");
                return Status.Error;
            }

            // make sure the subject was identified - if not move the state forward 
            string subjectItem = GetInstanceData(workflowInstance, ActivityVariables.Contact);
            if (subjectItem == null)
                return Status.Complete;

            // set up the FB API context
            FBGraphAPI fbApi = new FBGraphAPI();

            // get the current user
            User user = UserContext.GetUser(item.UserID, true);
            if (user == null)
            {
                TraceLog.TraceError("Could not find the user associated with item " + item.Name);
                return Status.Error;
            }

            UserCredential cred = user.GetCredential(UserCredential.FacebookConsent);
            if (cred != null && cred.AccessToken != null) 
	        {	        
                fbApi.AccessToken = cred.AccessToken;
	        }
	        else
	        {   // user not having a FB token is not an error condition, but there is no way to generate suggestions
                // just move forward from this state
                return Status.Complete;
	        }

            Item subject = null;
            try
            {
                subject = JsonSerializer.Deserialize<Item>(subjectItem);
                
                // if the subjectItem is a reference, chase it down
                while (subject.ItemTypeID == SystemItemTypes.Reference)
                {
                    FieldValue refID = subject.GetFieldValue(FieldNames.EntityRef);
                    Guid refid = new Guid(refID.Value);
                    subject = UserContext.Items.Include("FieldValues").Single(i => i.ID == refid);
                }
            }
            catch (Exception ex)
            {
                TraceLog.TraceException("Could not deserialize subject Item", ex);
                return Status.Error;
            }

            FieldValue fbID = subject.GetFieldValue(FieldNames.FacebookID);
            if (fbID == null || fbID.Value == null)
            {
                TraceLog.TraceError(String.Format("Could not find FacebookID for Contact {0}", subject.Name));
                return Status.Complete;
            }

            try
            {
                // issue the query against the Facebook Graph API
                var results = fbApi.Query(fbID.Value, FBQueries.Likes);
                foreach (var like in results)
                {
                    string name = (string) like[FBQueryResult.Name];
                    suggestionList[name] = name;
                }
            }
            catch (Exception ex)
            {
                TraceLog.TraceException("Error calling Facebook Graph API", ex);
                return Status.Complete;
            }

            return Status.Complete;
        }
    }
}
