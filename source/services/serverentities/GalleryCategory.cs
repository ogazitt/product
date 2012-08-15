using System.Collections.Generic;
using System.Runtime.Serialization;

namespace BuiltSteady.Product.ServerEntities
{
    public class GalleryCategory
    {
        public int CategoryID { get; set; }
        public string Name { get; set; }

        [IgnoreDataMember]
        public int? ParentID { get; set; }
        public List<GalleryCategory> Subcategories { get; set; }
        public List<GalleryActivity> Activities { get; set; }

        public override string ToString()
        {
            return this.Name;
        }
    }
}