﻿
namespace BuiltSteady.Product.ServerEntities
{
    public class Intent
    {
        public long IntentID { get; set; }
        public string Verb { get; set; }
        public string Noun { get; set; }
        public string WorkflowType { get; set; }

        public override string ToString()
        {
            return this.WorkflowType;
        }
    }
}