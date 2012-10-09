using System;
using System.Linq;
using BuiltSteady.Product.ServerEntities;
using BuiltSteady.Product.ServiceHost;
using BuiltSteady.Product.Shared.Entities;

namespace BuiltSteady.Product.WorkflowHost.Activities
{
    public class UpdateNextSteps : WorkflowActivity
    {
        public override Func<WorkflowInstance, ServerEntity, object, Status> Function
        {
            get
            {
                return ((workflowInstance, entity, data) =>
                {
                    try
                    {
                        // get current timezone
                        var hourOffset = GetCurrentHourOffset();
                        var profiles = UserContext.Items.
                            Include("FieldValues").
                            Where(i => i.FieldValues.Any(fv => fv.FieldName == UserProfile.FieldNames.TimezoneHoursOffset && fv.Value == hourOffset)).
                            ToList();
                        TraceLog.TraceDetail(String.Format("Updating {0} Next Steps appointments in Timezone offset {1}",
                            profiles.Count, hourOffset));
                        
                        // update next steps appointment for each user
                        foreach (var profile in profiles)
                        {
                            var user = UserContext.GetUser(profile.UserID, true);
                            if (user != null)
                            {
                                GoogleClient gc = new GoogleClient(user, UserContext);
                                gc.RefreshAccessToken();
                                if (gc.UpdateNextStepsEvent(null))
                                    TraceLog.TraceInfo("Updated Next Steps appointment for user " + user.Name);
                                else
                                    TraceLog.TraceError("Could not update Next Steps appointment for user " + user.Name);
                            }
                            else
                                TraceLog.TraceError(String.Format("User {0} not found", profile.UserID));
                        }
                    }
                    catch (Exception ex)
                    {
                        TraceLog.TraceException("UpdateNextSteps failed", ex);
                        return Status.Error;
                    }
                    return Status.Complete;
                });
            }
        }

        private string GetCurrentHourOffset()
        {
            // get UTC hour on a scale of -11 to 12
            DateTime now = DateTime.UtcNow;
            int hour = now.Hour >= 12 ? 24 - now.Hour : -now.Hour;
            return hour.ToString();
        }
    }
}
