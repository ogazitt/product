using System;

namespace BuiltSteady.Product.ServerEntities
{
    public class Timer
    {
        public Guid ID { get; set; }
        public string WorkflowType { get; set; }
        public DateTime NextRun { get; set; }
        public int Cadence { get; set; }
        public DateTime Created { get; set; }
        public DateTime LastModified { get; set; }
        public string LockedBy { get; set; }

        public override string ToString()
        {
            return this.WorkflowType;
        }
    }
}