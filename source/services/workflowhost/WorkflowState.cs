using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json.Linq;
using BuiltSteady.Product.ServerEntities;
using BuiltSteady.Product.ServiceHost;

namespace BuiltSteady.Product.WorkflowHost
{
    public class WorkflowState
    {
        public string Name { get; set; }
        public string Activity { get; set; }
        public JObject ActivityDefinition { get; set; }
        public string NextState { get; set; }
    }
}
