﻿using System;

namespace BuiltSteady.Product.ServerEntities
{
    public class ItemTag
    {
        public Guid ID { get; set; }
        public Guid ItemID { get; set; }
        public Guid TagID { get; set; }
    }
}