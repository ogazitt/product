using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json.Linq;
using BuiltSteady.Product.ServerEntities;
using BuiltSteady.Product.ServiceHost;

namespace BuiltSteady.Product.ActivityGallery
{
    public class ActivityStep
    {
        public string Name { get; set; }
        
        // Action is a well-known action name
        // StepDefinition is a nested set of ActivitySteps.
        // Only one of these should be set - if Action is set, StepDefinition is ignored.
        // Implementation note: currently, StepDefinition is not used.
        public string Action { get; set; }
        public JObject StepDefinition { get; set; }
    }
}
