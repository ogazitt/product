<%@ Page Language="C#" MasterPageFile="~/Views/Shared/Bootstrap.Master" Inherits="System.Web.Mvc.ViewPage<UserDataModel>" %>
<%@ Import Namespace="System.Web" %>
<%@ Import Namespace="BuiltSteady.Product.ServiceHost" %>
<%@ Import Namespace="BuiltSteady.Product.Website.Models" %>

<asp:Content ContentPlaceHolderID="MasterHead" runat="server">
    <title>Profile Wizard</title>
    <link href="<%: Url.Content("~/content/themes/bootstrap/jquery-ui-1.8.18.css") %>" rel="stylesheet" type="text/css" />

    <style type="text/css">
        h1, h2, h3 { color: #08C; margin: 4px; font-family: 'Trebuchet MS', sans-serif; }
        h1 { font-size: 36pt; margin-bottom: 24px; }
        h2, h3 { margin-bottom: 12px; }
        .wizard-region { margin: 0 3% 0 3%; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
        .wizard-region .well { position:relative; min-height: 450px; background: #eee url('/content/images/twostep-watermark.png') no-repeat fixed 50% 40%; }      
        .wizard-region .control-group.inline { margin: 12px 0 0 12px; }
        .wizard-region .btn-success, .wizard-region .btn-primary { min-width: 64px; }
        .wizard-region .controls.pull-bottom { position: absolute; bottom: 12px; right: 24px; }
        .info-pane { display: none }
        .info-pane.active { display: block; }
        .info-pane p { margin: 4px 4px 12px 4px; width: 80%; font-size: 12pt; font-style: italic; color: #333; line-height: 20px; }
        .info-pane .control-group { margin-left: 12px; }
        .info-pane .control-label { font-size: 8pt; margin: 0 0 -4px 8px; }
        .info-pane .controls.inline { margin-right: 24px; }
        .info-pane label.inline { margin-right: 24px; }
        .info-pane .help-inline { margin-left: 20px; }
        .info-pane .input-xlarge { width: 300px; }
        .info-pane .span3 { padding-top: 8px; }
        .info-pane small { display: block; font-size: 8pt; }
        .info-pane small.connected { color: #08C; }
    </style>
</asp:Content>

<asp:Content ContentPlaceHolderID="MainContent" runat="server">
    <div class="wizard-region container-fluid">
        <div class="row-fluid">
            <div class="span12 well">

                <!-- wizard panes -->
                <div id="user_info" class="info-pane">
                    <h1>Welcome to TwoStep!</h1>
                    <h3>TwoStep works best if you tell it a few things about yourself.</h3>
                    <p>
                    </p>

                    <div class="control-group">
                        <div class="controls inline">
                            <label class="control-label">First Name</label>
                            <input type="text" class="fn-firstname" />
                        </div>
                        <div class="controls inline">
                            <label class="control-label">Last Name</label>
                            <input type="text" class="fn-lastname" />
                        </div>
                    </div>
                    <div class="control-group">
                        <div class="controls">
                            <input type="radio" class="fn-gender" name="fn-gender" value="male" />
                            <label class="inline">Male</label>
                            <input type="radio" class="fn-gender" name="fn-gender" value="female" />
                            <label class="inline">Female</label>
                            <span class="help-inline" style="margin-left:82px;">Gender is used to select relevant Activities for you</span>
                        </div>
                    </div>
                    <div class="control-group">
                        <div class="controls">
                            <label class="control-label">Birthday</label>
                            <input type="text" class="fn-birthday" />
                            <span class="help-inline">Age is used to select relevant Activities for you</span>
                        </div>
                    </div>                    
                    <div class="control-group">
                        <div class="controls">
                            <label class="control-label">Mobile Phone</label>
                            <input type="text" class="fn-mobile" />
                            <span class="help-inline">Send reminders via text message, if you like</span>
                        </div>
                    </div>
                    <div class="control-group">
                        <div class="controls">
                            <label class="control-label">Home Address</label>
                            <input type="text" class="fn-address input-xlarge" />
                            <span class="help-inline">Your address is used to find local businesses and places</span>
                        </div>
                    </div>  
                </div>

                <div id="connect_info" class="info-pane">
                    <h1>Get Connected!</h1>
                    <h3>Consider connecting TwoStep to Facebook and Google Calendar.</h3>
                    <div class="span12">
                        <div class="span3">
                            <a class="fb"><img src="/content/images/connect-to-facebook.png" alt="Facebook" /></a>
                            <small class="fb help-inline">Not connected</small>
                        </div>
                        <div class="span9">
                            <p>
                            When you connect to Facebook, your contacts will be imported, allowing you to easily select contacts for
                            your activities. TwoStep will <strong>never</strong> post to Facebook unless you explicitly tell it to.
                            </p>  
                        </div>           
                    </div>
                    <div class="span12">
                        <div class="span3">
                            <a class="btn google"><img src="/content/images/google-calendar.png" alt="Google" /></a>
                            <small class="google help-inline">Not connected</small>
                        </div>
                        <div class="span9">
                            <p>
                            When you connect to your Google calendar, TwoStep can manage your schedule for you.  
                            Activities which require a scheduled appointment can be added to your calendar.                     
                            Your calendar will also contain an event and link to your Next Steps each and every day, 
                            making it easy to stay on top of what you need to get done while you are on the go.
                            </p>  
                        </div>           
                    </div> 
                </div>

                <div class="control-group inline">
                    <div class="controls inline">
                        <button class="btn btn-primary">Back</button>
                        <button class="btn btn-success">Next</button>
                    </div>
                    <div class="controls pull-bottom">
                        <input type="checkbox" class="" />
                        <label class="inline">Do not show startup screen</label>
                    </div>
                </div>

            </div>        
        </div>
    </div>
    
    <!-- modal popup dialogs -->
    <% Html.RenderPartial("ModalMessage"); %>
    <% Html.RenderPartial("ModalPrompt"); %>


</asp:Content>

<asp:Content ContentPlaceHolderID="ScriptBlock" runat="server">
<%  if (HostEnvironment.IsAzure && !HostEnvironment.IsAzureDevFabric) { %>
    <!-- use merged and minified scripts when deployed to Azure -->
    <script type="text/javascript" src="<%: Url.Content("~/scripts/wizard/wizard.generated.min.js") %>"></script>
<%  } else { %>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/shared/control-core.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/shared/control-display.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/shared/control-icons.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/shared/datamodel.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/shared/entity-core.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/shared/entity-constants.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/shared/entity-objects.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/dashboard/suggestionmanager.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/wizard/profile-wizard.js") %>"></script>
<%  } %>
    <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?sensor=false&libraries=places"></script>

<%
    string jsonConstants = Ajax.JavaScriptStringEncode(ConstantsModel.JsonConstants);
    string jsonUserData = Ajax.JavaScriptStringEncode(Model.JsonUserData);
    string consentStatus = (Model.ConsentStatus == null) ? "" : Model.ConsentStatus;
%>    
    <script type="text/javascript">
        // document ready handler
        $(function () {
            DataModel.Init('<%= jsonConstants %>', '<%= jsonUserData %>');
            ProfileWizard.Init(DataModel, '<%= consentStatus %>');
        });
    </script>
</asp:Content>
