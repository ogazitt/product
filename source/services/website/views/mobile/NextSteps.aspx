<%@ Page Language="C#" MasterPageFile="~/Views/Shared/Bootstrap.Master" Inherits="System.Web.Mvc.ViewPage<NextStepsDataModel>" %>
<%@ Import Namespace="System.Web" %>
<%@ Import Namespace="BuiltSteady.Product.ServiceHost" %>
<%@ Import Namespace="BuiltSteady.Product.Website.Models" %>

<asp:Content ContentPlaceHolderID="MasterHead" runat="server">
    <title>Next Steps</title>
    <link href="<%: Url.Content("~/content/themes/bootstrap/jquery-ui-1.8.18.css") %>" rel="stylesheet" type="text/css" />
</asp:Content>

<asp:Content ContentPlaceHolderID="MainContent" runat="server">
    <div class="dashboard-region container-fluid">
        <div class="row-fluid">
            <div class="dashboard-left dashboard-list span3 well">&nbsp </div>        
            <div class="dashboard-center span9">&nbsp;</div>
        </div>
    </div>

    <div id="modalMessage" class="modal hide fade">
        <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal">×</button>
            <h3></h3>        
        </div>
        <div class="modal-body">
            <p></p>        
        </div>        
        <div class="modal-footer">
            <a href="#" class="btn btn-primary" data-dismiss="modal">OK</a>      
        </div>
    </div>
    <div id="modalPrompt" class="modal hide fade">
        <div class="modal-header">
            <h3></h3>        
        </div>
        <div class="modal-body">
            <p></p>        
        </div>        
        <div class="modal-footer">
            <a href="#" class="btn btn-primary">OK</a>      
            <a href="#" class="btn btn-cancel">Cancel</a>  
        </div>
    </div>

</asp:Content>

<asp:Content ContentPlaceHolderID="ScriptBlock" runat="server">
<%  if (HostEnvironment.IsAzure && !HostEnvironment.IsAzureDevFabric) { %>
    <!-- use merged and minified scripts when deployed to Azure -->
    <script type="text/javascript" src="<%: Url.Content("~/scripts/dashboard/nextsteps.generated.min.js") %>"></script>
<%  } else { %>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/nextsteps/actiontypelist.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/shared/controls.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/shared/entityconstants.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/nextsteps/nextstepsmodel.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/nextsteps/nextstepspage.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/nextsteps/steplist.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/nextsteps/stepmanager.js") %>"></script>
<!--
    <script type="text/javascript" src="<%: Url.Content("~/scripts/dashboard/dashboard.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/dashboard/folderlist.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/dashboard/foldermanager.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/dashboard/listeditor.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/dashboard/itemeditor.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/dashboard/suggestionlist.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/dashboard/suggestionmanager.js") %>"></script>
    -->
<%  } %>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/jquery-ui-timepicker.js") %>"></script>
    <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?sensor=false&libraries=places"></script>

<%
    string jsonConstants = Ajax.JavaScriptStringEncode(ConstantsModel.JsonConstants);
    string jsonNextStepsData = Ajax.JavaScriptStringEncode(Model.JsonNextStepsData);
%>    
    <script type="text/javascript">
        // document ready handler
        $(function () {
            NextStepsModel.Init('<%= jsonConstants %>', '<%= jsonNextStepsData %>');
            NextStepsPage.Init(NextStepsModel);
        });
    </script>
</asp:Content>
