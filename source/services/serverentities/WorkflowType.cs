using System.ComponentModel.DataAnnotations;

namespace BuiltSteady.Product.ServerEntities
{
    public class WorkflowType
    {
        [Key]
        public string Type { get; set; }
        public string Definition { get; set; }

        public override string ToString()
        {
            return this.Type;
        }
    }
}