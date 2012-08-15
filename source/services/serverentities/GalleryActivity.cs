using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace BuiltSteady.Product.ServerEntities
{
    public class GalleryActivity
    {
        [Key]
        public string Name { get; set; }
        public int CategoryID { get; set; }

        [IgnoreDataMember]
        public string Definition { get; set; }

        public override string ToString()
        {
            return this.Name;
        }
    }
}