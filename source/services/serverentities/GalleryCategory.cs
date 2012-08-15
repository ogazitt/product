using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace BuiltSteady.Product.ServerEntities
{
    public class GalleryCategory
    {
        [Key]
        [IgnoreDataMember]
        public int CategoryID { get; set; }

        public string Name { get; set; }
        public List<GalleryActivity> Activities { get; set; }
        public List<GalleryCategory> Subcategories { get; set; }

        [IgnoreDataMember]
        public int? ParentID { get; set; }

        public override string ToString()
        {
            return this.Name;
        }
    }
}