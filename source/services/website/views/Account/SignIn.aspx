<%@ Page Language="C#" MasterPageFile="~/Views/Shared/Bootstrap.Master" Inherits="System.Web.Mvc.ViewPage<SignInModel>" %>
<%@ Import Namespace="BuiltSteady.Product.Website.Models" %>

<asp:Content ContentPlaceHolderID="MasterHead" runat="server">
    <title>TwoStep: Sign In</title>
    <style type="text/css">
      .field-validation-valid { display: none; }
      h1 { margin:24px 0 24px 0; font-family:'Segoe UI Light', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:32pt; }
      .main-content { margin: 0 24px 0 24px; }
      fieldset { margin-top: 32px;}
      .control-group { margin: 0 10px 0 0; padding: 0; }
      .control-group .control-label { font-size: 8pt; margin: 0 0 -4px 8px; }
      .control-group button { margin: 12px 0 12px 0; }
      .span5 { padding-left: 36px; }
      
      body { min-width: 900px }
      .full-center { width:100%; text-align: center; }
      .img-logo { height: 330px; min-width: 495px; }
      .btn-learn-more { margin-right: 10%; margin-top: 57px; }
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
        <div class="span7">
            <%--<% Html.RenderPartial("IntroCarouselControl"); %>--%>  
            <div class="full-center"> 
                <img class="img-logo" src="<%: Url.Content("~/content/images/landing/twostep-dance-through-life.png") %>" alt="TwoStep: Dance through life." />
            </div>
            <button class="btn btn-info btn-learn-more pull-right" onclick="LearnMoreHandler()">Learn More...</button>
        </div>
        <div class="span5">
        <% using (Html.BeginForm("signin", "account", FormMethod.Post, new { @class = "form-vertical" })) { %>
            <fieldset>
                    <div class="control-group">
                        <div class="controls"><h2>Sign In</h2></div>
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
                    <div class="controls">
                        <label class="checkbox">
                            <%: Html.CheckBoxFor(m => m.RememberMe)%>
                            Remember Me?
                        </label>
                    </div>
                </div>
                              
                <div class="control-group">
                    <div class="controls">
                    <button class="btn btn-primary" type="submit" onclick="SignInButtonHandler()">Sign In</button>
                    </div>
                </div>

                <%: Html.ValidationSummary(true, "Invalid or unrecognized email or password. Please try again.", new { @class = "alert alert-error" })%>

            </fieldset>
        <% } %>
        </div>
    </div>
    </div>
    <div class="row-fluid">
        <div class="span12">
            <% Html.RenderPartial("ProductInfoControl"); %>       
        </div>
    </div>
</asp:Content>

<asp:Content ContentPlaceHolderID="ScriptBlock" runat="server">
    <script type="text/javascript">
        SignInButtonHandler = function () {
            Events.Track(Events.Categories.LandingPage, Events.LandingPage.SignInFormPost);
        }

        LearnMoreHandler = function () {
            Events.Track(Events.Categories.LandingPage, Events.LandingPage.LearnMoreButton);
            window.location='<%: Url.Content("#product_info") %>'
        }
    </script>
</asp:Content>
