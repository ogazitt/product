using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace BuiltSteady.Product.ServerEntities
{
    public class GalleryActivity
    {
        [Key, Column("ActivityID")]
        public int ID { get; set; }
        public string Name { get; set; }

        [IgnoreDataMember]
        public int CategoryID { get; set; }

        [IgnoreDataMember]
        public string Definition { get; set; }

        [IgnoreDataMember]
        public string Filter { get; set; }

        [IgnoreDataMember]
        public bool InGallery { get; set; }

        public override string ToString()
        {
            return this.Name;
        }
    }
}