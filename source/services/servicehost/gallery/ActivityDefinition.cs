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
        public int ID { get; set; }
        public string Name { get; set; }
        public List<ActivityStep> Steps { get; set; }
        public JObject Recurrence { get; set; }
        public JObject Filter { get; set; }
        public string Status { get; set; }
    }
}
