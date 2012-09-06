using System;
using System.Collections.Generic;
using System.Linq;
using BuiltSteady.Product.ServerEntities;
using BuiltSteady.Product.ServiceHost;

namespace BuiltSteady.Product.ServiceHost.Gallery
{
    public class ActivityDefinition
    {
        public string Name { get; set; }
        public List<ActivityStep> Steps { get; set; }
        public string Recurrence { get; set; }
    }
}
