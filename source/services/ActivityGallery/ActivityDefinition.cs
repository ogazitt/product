using System;
using System.Collections.Generic;
using System.Linq;
using BuiltSteady.Product.ServerEntities;
using BuiltSteady.Product.ServiceHost;

namespace BuiltSteady.Product.ActivityGallery
{
    public class ActivityDefinition
    {
        public string Name { get; set; }
        public List<ActivityStep> Steps { get; set; }
        public TimeSpan Recurrence { get; set; }
    }
}
