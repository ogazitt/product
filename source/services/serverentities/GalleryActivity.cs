using System.ComponentModel.DataAnnotations;

namespace BuiltSteady.Product.ServerEntities
{
    public class GalleryActivity
    {
        [Key]
        public string Name { get; set; }
        public string Definition { get; set; }
        public int CategoryID { get; set; }
        public GalleryCategory Category { get; set; }

        public override string ToString()
        {
            return this.Name;
        }
    }
}