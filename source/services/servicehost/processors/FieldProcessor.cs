﻿using System;
using BuiltSteady.Product.ServerEntities;
using BuiltSteady.Product.Shared.Entities;

namespace BuiltSteady.Product.ServiceHost
{
    public static class FieldProcessor
    {
        // OBSOLETE! Stamping of CompletedOn field is being done on each client to get proper timezone and immediate response.
#if false
        // should only be called if newItem.Complete value is true
        public static bool ProcessUpdateCompletedOn(UserStorageContext userContext, Item oldItem, Item newItem)
        {
            var wasComplete = oldItem.GetFieldValue(FieldNames.Complete);
            if (wasComplete == null || !wasComplete.Value.Equals("true", StringComparison.OrdinalIgnoreCase))
            {   // timestamp the CompletedOn field
                newItem.GetFieldValue(FieldNames.CompletedOn, true).Value = DateTime.UtcNow.ToString();
            }
            return false;
        }
#endif
    }
}
