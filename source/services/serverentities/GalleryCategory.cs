using System.ComponentModel.DataAnnotations;

namespace BuiltSteady.Product.ServerEntities
{
    public class GalleryCategory
    {
        public int CategoryID { get; set; }
        public string Name { get; set; }
        public int? ParentID { get; set; }

        public override string ToString()
        {
            return this.Name;
        }
    }
}