using System;
#if CLIENT
using BuiltSteady.Product.Devices.ClientEntities;
#else
using BuiltSteady.Product.ServerEntities;
#endif

namespace BuiltSteady.Product.Shared.Entities
{

    // ************************************************************************
    // Shared Json objects
    //
    // These are objects that are serialized and stored as Json within
    // the FieldValues of Items and can be accessed on server or client
    //
    // ************************************************************************

    public struct JsonWebLink
    {
        public string Name;
        public string Url;
    }

}