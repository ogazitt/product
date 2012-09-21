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
        .wizard-region .well .connect { position:absolute; top: 16px; right: 16px; text-align:center; }   
        .wizard-region .well .connect a { display: none; margin-bottom: 8px; }
        .wizard-region .btn-success { margin: 12px 0 0 12px; min-width: 96px; }
        .info-pane { display: none }
        .info-pane.active { display: block; }
        .info-pane p { margin: 4px 4px 12px 4px; width: 80%; font-size: 12pt; font-style: italic; color: #333; line-height: 20px; }
        .info-pane .control-group { margin-left: 12px; }
        .info-pane .control-label { font-size: 8pt; margin: 0 0 -4px 8px; }
        .info-pane .controls.inline { margin-right: 24px; }
        .info-pane label.inline { margin-right: 24px; }
        .info-pane .help-inline { margin-left: 14px; }
    </style>
</asp:Content>

<asp:Content ContentPlaceHolderID="MainContent" runat="server">
    <div class="wizard-region container-fluid">
        <div class="row-fluid">
            <div class="span12 well">
                <h1>Welcome to TwoStep!</h1>
            
                <div class="connect">
                    <a class="fb"><img src="/content/images/connect-to-facebook.png" alt="Facebook" /></a>
                    <a class="btn google"><img src="/content/images/google-calendar.png" alt="Google" /></a>
                </div>

                <!-- wizard panes -->
                <div id="user_info" class="info-pane">
                    <h3>TwoStep works best if you tell it a few things about yourself.</h3>
                    <p>
                    The easiest way to get started is to connect TwoStep to Facebook, and allow it to do 
                    a much better job for you.  Your contacts will be imported,
                    along with your name, gender, birthday, location, and your family information. 
                    TwoStep will <strong>never</strong> post to Facebook unless you explicitly tell it to.
                    </p>

                    <div class="control-group">
                        <div class="controls inline">
                            <label class="control-label">First Name</label>
                            <input type="text" placeholder="First Name" />
                        </div>
                        <div class="controls inline">
                            <label class="control-label">Last Name</label>
                            <input type="text" placeholder="Last Name" />
                        </div>
                    </div>
                    <div class="control-group">
                        <div class="controls">
                            <input type="radio" name="gender" value="Male" checked />
                            <label class="inline">Male</label>
                            <input type="radio" name="gender" value="Female" />
                            <label class="inline">Female</label>
                            <span class="help-inline" style="margin-left:76px;">Gender is used to select relevant Activities for you</span>
                        </div>
                    </div>
                    <div class="control-group">
                        <div class="controls">
                            <label class="control-label">Birthday</label>
                            <input type="text" placeholder="Birthday" />
                            <span class="help-inline">Age is used to select relevant Activities for you</span>
                        </div>
                    </div>                    
                    <div class="control-group">
                        <div class="controls">
                            <label class="control-label">Mobile</label>
                            <input type="text" placeholder="Mobile" />
                            <span class="help-inline">Send reminders via text message, if you like</span>
                        </div>
                    </div>
                </div>

                <!--div id="spouse_info" class="info-pane"></div-->
                <!--div id="family_info" class="info-pane"></div-->

                <div id="home_info" class="info-pane">
                    <h3>Next, provide information about where you live.</h3>
                    <p>
                    By connecting to your Google calendar, TwoStep can manage your schedule for you.  
                    Activities which require a scheduled appointment can be added to your calendar. 
                    </p>                      
                    <div class="control-group">
                        <div class="controls">
                            <label class="control-label">Address</label>
                            <input type="text" placeholder="Address" />
                            <span class="help-inline">Your location is used to find relevant businesses and places</span>
                        </div>
                    </div>    
                    <div class="control-group">
                        <div class="controls">
                            <input type="checkbox" name="homeowner" />
                            <label class="inline">Do you own your house?</label>
                            <span class="help-inline" style="margin-left:50px;">Used to select relevant Activities for home owners</span>
                        </div>
                    </div> 
                    <div class="control-group">
                        <div class="controls">
                            <input type="checkbox" name="yardwork" />
                            <label class="inline">Do you have a yard?</label>
                            <span class="help-inline" style="margin-left:74px;">Used to select appropriate Activities for yard maintentance</span>
                        </div>
                    </div>           
                </div>

                <div id="auto_info" class="info-pane">
                    <h3>Next, provide information about what you drive.</h3>
                    <p>
                    By connecting to your Google calendar, TwoStep can provide easy access from your mobile devices.  
                    Your calendar will contain an event and link to your Next Steps each and every day.
                    Manage your schedule and the things you need to get done while you are on the go!
                    </p>  
                    <div class="control-group">
                        <div class="controls">
                            <label class="control-label">Make & Model</label>
                            <input type="text" name="make_model" placeholder="Make & Model" />
                            <span class="help-inline">Used to select Activities relevant to car owners</span>
                        </div>
                    </div> 
                    <div class="control-group">
                        <div class="controls">
                            <label class="control-label">Year</label>
                            <input type="text" placeholder="Year" />
                            <span class="help-inline">Used to select Activities relevant to your car</span>
                        </div>
                    </div>                 
                </div>

                <div id="connect_info" class="info-pane">
                    <h3>Finally, if you haven't yet, please consider connecting TwoStep to Facebook and Google.</h3>
                    <p>
                    When you connect to Facebook, your contacts will be imported, allowing you to easily select 
                    contacts for your activities.
                    TwoStep will <strong>never</strong> post to Facebook unless you explicitly tell it to.
                    </p>  
                    <p>
                    When you connect to your Google calendar, TwoStep can manage your schedule for you.  
                    Activities which require a scheduled appointment can be added to your calendar.                     
                    Your calendar will also contain an event and link to your Next Steps each and every day, 
                    making it easy to stay on top of what you need to get done while you are on the go.
                    </p>  
                </div>

                <div class="control-group">
                    <div class="controls">
                        <button class="btn btn-success">Next</button>
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
    <script type="text/javascript" src="<%: Url.Content("~/scripts/wizard/profile-wizard.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/shared/control-core.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/shared/control-display.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/shared/control-icons.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/shared/datamodel.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/shared/entity-core.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/shared/entity-constants.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/shared/entity-objects.js") %>"></script>
    <script type="text/javascript" src="<%: Url.Content("~/scripts/dashboard/suggestionmanager.js") %>"></script>
<%  } %>

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
