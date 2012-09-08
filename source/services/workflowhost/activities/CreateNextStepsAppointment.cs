using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using BuiltSteady.Product.ServerEntities;
using BuiltSteady.Product.ServiceHost;
using BuiltSteady.Product.Shared.Entities;

namespace BuiltSteady.Product.WorkflowHost.Activities
{
    public class CreateNextStepsAppointment : WorkflowActivity
    {
        public override Func<WorkflowInstance, ServerEntity, object, Status> Function
        {
            get
            {
                return ((workflowInstance, entity, data) =>
                {
                    User user = entity as User;
                    if (user == null)
                    {
                        TraceLog.TraceError("Entity is not a User");
                        return Status.Error;
                    }

                    user = UserContext.GetUser(user.ID, true);
                    if (user == null)
                    {
                        TraceLog.TraceError("User not found");
                        return Status.Error;
                    }

                    try
                    {
                        // get steps with duedates
                        var steps = UserContext.Items.Include("FieldValues").Where(i =>
                            i.UserID == user.ID &&
                            i.ItemTypeID == SystemItemTypes.Step &&
                            i.FieldValues.Any(fv => fv.FieldName == FieldNames.DueDate)).
                            ToList();

                        // create an ordered list of steps that have a duedate on or before today
                        var stepList = new List<StepInfo>();
                        DateTime date;
                        foreach (var s in steps)
                            if (DateTime.TryParse(s.GetFieldValue(FieldNames.DueDate).Value, out date) && date.Date <= DateTime.Today)
                                stepList.Add(new StepInfo() { Name = s.Name, Date = date });
                        var orderedSteps = stepList.OrderBy(s => s.Date);

                        // build a string that contains a step in "date: name" format for each step
                        var sb = new StringBuilder();
                        foreach (var s in orderedSteps)
                            sb.AppendFormat("{0}: {1}\n", s.Date.ToString("MMM dd"), s.Name);
                        var stepString = sb.ToString();

                        // create the next steps appointment with the steps data
                        GoogleClient gc = new GoogleClient(user, UserContext);
                        if (gc.AddNextStepsEvent(null, stepString) == false)
                            return Status.Error;
                    }
                    catch (Exception ex)
                    {
                        TraceLog.TraceException("CreateNextStepsAppointment failed", ex);
                        return Status.Error;
                    }
                    return Status.Complete;
                });
            }
        }

        public class StepInfo
        {
            public string Name { get; set; }
            public DateTime Date { get; set; }
        }
    }
}
