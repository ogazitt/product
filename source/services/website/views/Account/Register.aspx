<%@ Page Language="C#" MasterPageFile="~/Views/Shared/Bootstrap.Master" Inherits="System.Web.Mvc.ViewPage<BuiltSteady.Product.Website.Models.RegisterModel>" %>

<asp:Content ContentPlaceHolderID="MasterHead" runat="server">
    <title>TwoStep: The Personal Assistant for Life's Activities</title>
    <meta name="description" content="TwoStep is the Personal Assistant for your life's activities. It breaks complex tasks into actionable steps, and helps you get them done. Sign Up for free!" />
    <style type="text/css">
      .field-validation-valid { display: none; }
      h1 { margin:24px 0 24px 0; font-family:'Segoe UI Light', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:32pt; }
      h2 { font-size: 18pt; white-space: nowrap; margin-bottom: 12px; }
      .main-content { margin: 0 24px 0 24px; }
      fieldset { margin-top: 16px; }
      .control-group { margin: 0 10px 0 0; padding: 0; }
      .control-group .control-label { font-size: 10pt; margin: 0 0 -4px 12px; }
      .control-group button { margin: 12px 0 12px 0; }
      .span5 { padding-left: 36px; }
      .span5 p { width: 250px; margin-top: 12px; }
      
      body { min-width: 900px }
      .full-center { width:100%; text-align: center; }
      .img-logo { height: 330px; min-width: 495px; }
      .main-content input { font-size: 18pt; padding: 8px; width: 300px; }
      .main-content .btn { font-size: 18pt; padding: 12px; }
      .btn-learn-more { margin-right: 10%; margin-top: 56px; }
    </style>
</asp:Content>

<asp:Content ContentPlaceHolderID="MainContent" runat="server">
    <div class="container-fluid main-content">
    <div class="row-fluid">
        <div class="span12">
            <h2>&nbsp;</h2>
        </div>
    </div>
    <div class="row-fluid">
        <div class="span7 intro-carousel">
            <%--<% Html.RenderPartial("IntroCarouselControl"); %>--%> 
            <div class="full-center"> 
                <img class="img-logo" src="<%: Url.Content("~/content/images/landing/twostep-dance-through-life.png") %>" alt="TwoStep: Dance through life." />
            </div>
            <button class="btn btn-info btn-learn-more pull-right" onclick="LearnMoreHandler()">Learn More...</button>
        </div>
        <div class="span5">
        <% using (Html.BeginForm("register", "account", FormMethod.Post, new { @class = "form-vertical" })) { %>
            <fieldset>
                <div class="control-group">
                    <div class="controls"><h2>Sign Up for a free account!</h2></div>
                </div>
                <div class="control-group">
                    <label class="control-label" for="Email">Email address</label>
                    <div class="controls">
                        <%: Html.TextBoxFor(m => m.Email, new { @class = "input-large" })%>
                        <%: Html.ValidationMessageFor(m => m.Email, "", new { @class="badge badge-important"})%>                 
                    </div>
                </div>

                <div class="control-group">
                    <label class="control-label" for="Password">Password</label>
                    <div class="controls">
                        <%: Html.PasswordFor(m => m.Password, new { @class = "input-large" })%>
                        <%: Html.ValidationMessageFor(m => m.Password, "", new { @class = "badge badge-important" })%>
                    </div>      
                </div> 
                
                <div class="control-group">
                    <label class="control-label" for="ConfirmPassword">Confirm password</label>
                    <div class="controls">
                        <%: Html.PasswordFor(m => m.ConfirmPassword, new { @class = "input-large" })%>
                        <%: Html.ValidationMessageFor(m => m.ConfirmPassword, "", new { @class = "badge badge-important" })%>
                    </div>      
                </div> 
                
                <div class="control-group">
                    <label class="control-label" for="AccessCode">Access code</label>
                    <div class="controls">
                        <%: Html.TextBoxFor(m => m.AccessCode, new { @class = "input-large" })%>
                        <%: Html.ValidationMessageFor(m => m.AccessCode, "", new { @class = "badge badge-important" })%>                 
                    </div>
                </div>
                                
                <div class="control-group">
                    <div class="controls">
                        <button class="btn btn-success" type="submit" onclick="SignUpButtonHandler()">Sign Up</button>
                    </div>
                </div>
                <%: Html.ValidationSummary(true, "Unable to complete registration. Resolve issues and try again.", new { @class = "alert alert-error" })%>
            </fieldset>
        <% } %>

            <button class="btn btn-info" onclick="ShowLaunchRock()">Request Access</button>
            <p>TwoStep is in private beta.  If you don't have an access code, request one now!</p>
        </div>

    </div>
    </div>

    <% Html.RenderPartial("LaunchRock"); %>

    <div class="row-fluid">
        <div class="span12">
            <% Html.RenderPartial("ProductInfoControl"); %>  
        </div>
    </div>

</asp:Content>

<asp:Content ContentPlaceHolderID="ScriptBlock" runat="server">
    <script type="text/javascript">
        SignUpButtonHandler = function () {
            Events.Track(Events.Categories.LandingPage, Events.LandingPage.SignUpFormPost);
        }

        LearnMoreHandler = function () {
            Events.Track(Events.Categories.LandingPage, Events.LandingPage.LearnMoreButton);
            window.location='<%: Url.Content("#product_info") %>'
        }
    </script>
</asp:Content>
