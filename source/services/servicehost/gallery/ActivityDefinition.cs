using System;
using System.Collections.Generic;
using System.Linq;
using BuiltSteady.Product.ServerEntities;
using BuiltSteady.Product.ServiceHost;
using Newtonsoft.Json.Linq;

namespace BuiltSteady.Product.ServiceHost.Gallery
{
    public class ActivityDefinition
    {
        public string Name { get; set; }
        public List<ActivityStep> Steps { get; set; }
        public string Recurrence { get; set; }
        public JObject Filter { get; set; }
    }
}
