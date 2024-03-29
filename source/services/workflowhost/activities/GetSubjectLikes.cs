﻿using System;
using System.Collections.Generic;
using System.Linq;
using BuiltSteady.Product.ServerEntities;
using BuiltSteady.Product.ServiceHost;
using BuiltSteady.Product.ServiceUtilities.FBGraph;
using BuiltSteady.Product.Shared.Entities;

namespace BuiltSteady.Product.WorkflowHost.Activities
{
    public class GetSubjectLikes : WorkflowActivity
    {
        public override string GroupDisplayName { get { return JsonSerializer.Serialize(new List<string>() { "Choose from", "$(" + ActivityVariables.SubjectHint + ")'s", "Facebook interests" }); } }
        public override string OutputParameterName { get { return ActivityVariables.Likes; } }
        public override string SuggestionType { get { return SuggestionTypes.ChooseOne; } }
        public override Func<WorkflowInstance, ServerEntity, object, Status> Function
        {
            get
            {
                return ((workflowInstance, entity, data) =>
                {
                    return Execute(
                        workflowInstance, 
                        entity,
                        data,
                        SystemItemTypes.Task,
                        (instance, e, dict) => { return GenerateSuggestions(instance, e, dict); });
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
                TraceLog.TraceError("Could not find the user associated with Item " + item.Name);
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
                TraceLog.TraceError(String.Format("Could not find Facebook ID for Contact {0}", subject.Name));
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

            return Status.Pending;
        }
    }
}
