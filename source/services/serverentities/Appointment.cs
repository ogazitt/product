using System.Reflection;
using System;

namespace BuiltSteady.Product.ServerEntities
{
    public class Appointment
    {
        public string Name { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }
        public string Location { get; set; }
        public string Notes { get; set; }
        public Guid ItemID { get; set; }

        public Appointment() { }

        public Appointment(Appointment obj)
        {
            Copy(obj);
        }

        public void Copy(Appointment obj)
        {
            if (obj == null)
                return;

            // copy all of the properties
            foreach (PropertyInfo pi in this.GetType().GetProperties())
            {
                var val = pi.GetValue(obj, null);
                pi.SetValue(this, val, null);
            }
        }

        public override string ToString()
        {
            return this.Name;
        }
    }
}