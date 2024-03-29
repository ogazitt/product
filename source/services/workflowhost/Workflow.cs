﻿using System;
using System.Collections.Generic;
using System.Linq;
using BuiltSteady.Product.ServerEntities;
using BuiltSteady.Product.ServiceHost;
using BuiltSteady.Product.WorkflowHost.Activities;

namespace BuiltSteady.Product.WorkflowHost
{
    // some well-known workflow names
    public class WorkflowNames
    {
        public const string NewContact = "NewContact";
        public const string NewFolder = "NewFolder";
        public const string NewGrocery = "NewGrocery";
        public const string NewTask = "NewTask";
        public const string NewUser = "NewUser";
    }

    public class Workflow
    {
        public virtual List<WorkflowState> States { get; set; }

        public UserStorageContext UserContext { get; set; }
        public SuggestionsStorageContext SuggestionsContext { get; set; }

        /// <summary>
        /// This is the typical way to execute a workflow.  This implementation
        /// will retrieve any data (e.g. user selection, or a result of a previous Activity)
        /// and pass it into the Process method.
        /// </summary>
        /// <param name="instance">Workflow instance</param>
        /// <param name="entity">Entity to process</param>
        /// <returns>true if completed, false if not</returns>
        public virtual WorkflowActivity.Status Execute(WorkflowInstance instance, ServerEntity entity)
        {
            // get the data for the current state (if any is available)
            // this data will be fed into the Process method as its argument
            List<Suggestion> data = null;
            try
            {
                data = SuggestionsContext.Suggestions.Where(sugg => sugg.WorkflowInstanceID == instance.ID && sugg.State == instance.State).ToList();
                
                // if there is no suggestion data, indicate this with a null reference instead
                if (data.Count == 0)
                    data = null;
            }
            catch
            {
                // this is not an error state - the user may not have chosen a suggestion
            }

            // return the result of processing the state with the data
            return Process(instance, entity, data);
        }

        /// <summary>
        /// Default implementation for the Workflow's Process method.
        ///     Get the current state
        ///     Invoke the corresponding action (with the data object passed in)
        ///     Add any results to the Item's SuggestionsList
        ///     Move to the next state and terminate the workflow if it is at the end
        /// </summary>
        /// <param name="instance">Workflow instance</param>
        /// <param name="entity">Entity to process</param>
        /// <param name="data">Extra data to pass to Activity</param>
        /// <returns>true if completed, false if not</returns>
        protected virtual WorkflowActivity.Status Process(WorkflowInstance instance, ServerEntity entity, object data) 
        {
            try
            {
                // get current state and corresponding activity
                TraceLog.TraceInfo(String.Format("Workflow {0} entering state {1}", instance.WorkflowType, instance.State));
                WorkflowState state = States.Single(s => s.Name == instance.State);
                //var activity = PrepareActivity(instance, state.Activity, UserContext, SuggestionsContext);
                
                WorkflowActivity activity = null;
                if (state.Activity != null)
                    activity = WorkflowActivity.CreateActivity(state.Activity);
                else if (state.ActivityDefinition != null)
                    activity = WorkflowActivity.CreateActivity(state.ActivityDefinition, instance);

                if (activity == null)
                {
                    TraceLog.TraceError("Could not find or prepare Activity");
                    return WorkflowActivity.Status.Error;
                }
                else
                {
                    activity.UserContext = UserContext;
                    activity.SuggestionsContext = SuggestionsContext;
                }

                // invoke the activity
                TraceLog.TraceInfo(String.Format("Workflow {0} invoking activity {1}", instance.WorkflowType, activity.Name));
                var status = activity.Function.Invoke(instance, entity, data);
                TraceLog.TraceInfo(String.Format("Workflow {0}: activity {1} returned status {2}", instance.WorkflowType, activity.Name, status.ToString()));
                instance.LastModified = DateTime.Now;

                // if the activity completed, advance the workflow state
                if (status == WorkflowActivity.Status.Complete)
                {
                    // store next state and terminate the workflow if next state is null
                    instance.State = state.NextState;
                    if (instance.State == null)
                    {
                        status = WorkflowActivity.Status.WorkflowDone;
                        TraceLog.TraceInfo(String.Format("Workflow {0} is done", instance.WorkflowType));
                    }
                }
                SuggestionsContext.SaveChanges();

                return status;
            }
            catch (Exception ex)
            {
                TraceLog.TraceException("Process failed", ex);
                return WorkflowActivity.Status.Error;
            }
        }

        /// <summary>
        /// Run a workflow until it is blocked for user input or is terminated
        /// </summary>
        /// <param name="instance"></param>
        /// <param name="entity"></param>
        public void Run(WorkflowInstance instance, ServerEntity entity)
        {
            TraceLog.TraceInfo("Running workflow " + instance.WorkflowType);
            var status = WorkflowActivity.Status.Complete;
            try
            {
                // invoke the workflow and process steps until workflow is blocked for user input
                while (status == WorkflowActivity.Status.Complete)
                {
                    status = Execute(instance, entity);
                }
            }
            catch (Exception ex)
            {
                TraceLog.TraceException("Workflow execution failed", ex);
            }

            // if the workflow is done or experienced a fatal error, terminate it
            if (status == WorkflowActivity.Status.WorkflowDone ||
                status == WorkflowActivity.Status.Error)
            {
                try
                {
                    SuggestionsContext.WorkflowInstances.Remove(instance);
                    SuggestionsContext.SaveChanges();
                }
                catch (Exception ex)
                {
                    TraceLog.TraceException("Could not remove workflow instance", ex);
                }
            }
        }
    }
}
