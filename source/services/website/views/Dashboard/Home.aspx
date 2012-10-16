<%@ Page Language="C#" MasterPageFile="~/Views/Shared/Bootstrap.Master" Inherits="System.Web.Mvc.ViewPage<UserDataModel>" %>
<%@ Import Namespace="System.Web" %>
<%@ Import Namespace="BuiltSteady.Product.ServiceHost" %>
<%@ Import Namespace="BuiltSteady.Product.Website.Models" %>

<asp:Content ContentPlaceHolderID="MasterHead" runat="server">
    <title>TwoStep Dashboard</title>
    <meta name="description" content="TwoStep Activity Dashboard" />
    <link href="<%: Url.Content("~/content/themes/bootstrap/jquery-ui-1.8.18.css") %>" rel="stylesheet" type="text/css" />
</asp:Content>

<asp:Content ContentPlaceHolderID="MainContent" runat="server">
    <div class="dashboard-region container-fluid">
        <div class="row-fluid">
            <div class="dashboard-left dashboard-list span3 well">&nbsp;</div>        
            <div class="dashboard-center span6">&nbsp;</div>
            <div class="dashboard-right dashboard-list span3 well">&nbsp;</div>
        </div>
    </div>
    
    <!-- modal popup dialogs -->
    <% Html.RenderPartial("ModalMessage"); %>
    <% Html.RenderPartial("ModalPrompt"); %>
    <!-- repeat control dialog -->
    <% Html.RenderPartial("RepeatControl"); %>

</asp:Content>

<asp:Content ContentPlaceHolderID="ScriptBlock" runat="server">
<%  if (HostEnvironment.IsAzure && !HostEnvironment.IsAzureDevFabric) { %>
    <!-- use merged and minified scripts when deployed to Azure -->
    <script type="text/javascript" src="<%: Url.Content("~/scripts/dashboard/dashboard.generated.min.js") %>"></script>
<%  } else { %>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/shared/control-core.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/shared/control-display.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/shared/control-icons.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/shared/datamodel.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/shared/entity-core.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/shared/entity-constants.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/shared/entity-objects.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/dashboard/activitygallery.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/dashboard/control-repeat.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/dashboard/dashboard.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/dashboard/folderlist.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/dashboard/foldermanager.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/dashboard/listeditor.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/dashboard/itemeditor.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/dashboard/suggestionmanager.js") %>"></script>
<%  } %>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/jquery-ui-timepicker.js") %>"></script>
    <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?sensor=false&libraries=places"></script>

<%
    string jsonConstants = Ajax.JavaScriptStringEncode(ConstantsModel.JsonConstants);
    string jsonUserData = Ajax.JavaScriptStringEncode(Model.JsonUserData);
    string renewFBToken = (Model.RenewFBToken) ? "true" : "false";
    string consentStatus = (Model.ConsentStatus == null) ? "" : Model.ConsentStatus;
%>    
    <script type="text/javascript">
        // document ready handler
        $(function () {
            DataModel.Init('<%= jsonConstants %>', '<%= jsonUserData %>');
            Dashboard.Init(DataModel, <%= renewFBToken %>, '<%= consentStatus %>');
        });
    </script>
</asp:Content>
