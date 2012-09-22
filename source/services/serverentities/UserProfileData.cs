using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using BuiltSteady.Product.Shared.Entities;

namespace BuiltSteady.Product.ServerEntities
{
    public class UserProfileData
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Gender { get; set; }
        public string Picture { get; set; }
        public string Birthday { get; set; }
        public string GeoLocation { get; set; }
        public string Timezone { get; set; }
        public string FacebookID { get; set; }
        public string WizardPage { get; set; }

        public UserProfileData() { }

        public UserProfileData(UserProfile userProfile)
        {
            foreach (var prop in userProfile.GetType().GetProperties())
            {
                var value = (string)prop.GetValue(userProfile, null);
                if (!String.IsNullOrEmpty(value))
                {
                    var thisProp = this.GetType().GetProperty(prop.Name);
                    if (thisProp != null)
                        thisProp.SetValue(this, value, null);
                }
            }
        }

        public override string ToString()
        {
            if (String.IsNullOrEmpty(FirstName) && String.IsNullOrEmpty(LastName))
                return base.ToString();
            return String.Format("{0} {1}", FirstName, LastName);
        }
    }
}
