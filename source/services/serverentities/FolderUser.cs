﻿using System;

namespace BuiltSteady.Product.ServerEntities
{
    public class FolderUser
    {
        public Guid ID { get; set; }
        public Guid FolderID { get; set; }
        public Guid UserID { get; set; }
        public int PermissionID { get; set; }
    }
}