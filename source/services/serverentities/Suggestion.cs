﻿using System;

namespace BuiltSteady.Product.ServerEntities
{
    public class Suggestion
    {
        public Guid ID { get; set; }
        public Guid? ParentID { get; set; }
        public string SuggestionType { get; set; }
        public Guid EntityID { get; set; }
        public string EntityType { get; set; }
        public string WorkflowType { get; set; }
        public Guid WorkflowInstanceID { get; set; }
        public string State { get; set; }
        public string DisplayName { get; set; }
        public string GroupDisplayName { get; set; }
        public int? SortOrder { get; set; }
        public string Value { get; set; }
        public DateTime? TimeSelected { get; set; }
        public string ReasonSelected { get; set; }

        public override string ToString()
        {
            return this.DisplayName;
        }
    }
}