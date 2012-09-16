﻿<%@ Page Language="C#" MasterPageFile="~/Views/Shared/Bootstrap.Master" Inherits="System.Web.Mvc.ViewPage<BuiltSteady.Product.Website.Models.RegisterModel>" %>

<asp:Content ContentPlaceHolderID="MasterHead" runat="server">
    <title>Sign Up</title>
    <style type="text/css">
      .field-validation-valid { display: none; }
      h1 { margin:24px 0 24px 0; font-family:'Segoe UI Light', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:32pt; }
      .main-content { margin: 0 24px 0 48px; }
      fieldset { margin-left: 32px; margin-top: 25px; }
      .control-group { margin: 0 10px 0 0; padding: 0; }
      .control-group .control-label { font-size: 8pt; margin: 0 0 -4px 8px; }
      .control-group button { margin: 12px 0 12px 0; }
      .span5 p { margin-left: 32px; }
      .span5 .more-button { margin-left: 32px; }
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
            <% Html.RenderPartial("IntroCarouselControl"); %>  
        </div>
        <div class="span5">
        <% using (Html.BeginForm("register", "account", FormMethod.Post, new { @class = "form-vertical" })) { %>
            <fieldset>
                <div class="control-group">
                    <div class="controls"><h2>Sign Up</h2></div>
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
                        <button class="btn btn-success" type="submit">Sign Up</button>
                    </div>
                </div>
                <%: Html.ValidationSummary(true, "Unable to complete registration. Resolve issues and try again.", new { @class = "alert alert-error" })%>
            </fieldset>
        <% } %>

            <p class="small">
            This product is under development and user registration is currently restricted.
            To request an access code, register an email address at <a href="http://www.builtsteady.com">www.builtsteady.com</a>.
            </p>
            <br />
            <button class="btn more-button" onclick="window.location='<%: Url.Content("#product_info") %>'">Learn More</button>

        </div>

    </div>
    </div>

    <div class="row-fluid">
        <div class="span12">
            <% Html.RenderPartial("ProductInfoControl"); %>  
        </div>
    </div>
</asp:Content>
