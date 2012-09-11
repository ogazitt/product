using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace BuiltSteady.Product.ServerEntities
{
    public class GalleryCategory
    {
        [Key, Column("CategoryID")]
        public int ID { get; set; }

        public string Name { get; set; }
        public List<GalleryActivity> Activities { get; set; }
        public List<GalleryCategory> Subcategories { get; set; }

        [IgnoreDataMember]
        public int? ParentID { get; set; }

        [IgnoreDataMember]
        public bool InGallery { get; set; }

        public override string ToString()
        {
            return this.Name;
        }
    }
}