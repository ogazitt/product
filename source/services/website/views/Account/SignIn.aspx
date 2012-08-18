﻿<%@ Page Language="C#" MasterPageFile="~/Views/Shared/Bootstrap.Master" Inherits="System.Web.Mvc.ViewPage<SignInModel>" %>
<%@ Import Namespace="BuiltSteady.Product.Website.Models" %>

<asp:Content ContentPlaceHolderID="MasterHead" runat="server">
    <title>Sign In</title>
    <style type="text/css">
      .field-validation-valid { display: none; }
      h1 { margin:24px 0 24px 0; font-family:'Segoe UI Light', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:32pt; }
      .main-content { margin: 0 24px 0 48px; }
      fieldset { margin-left: 32px; }
      .control-group { margin: 0 10px 0 0; padding: 0; }
      .control-group .control-label { font-size: 8pt; margin: 0 0 -4px 8px; }
      .control-group button { margin: 12px 0 12px 0; }
    </style>
</asp:Content>

<asp:Content ContentPlaceHolderID="MainContent" runat="server">
    <div class="container-fluid main-content">
    <div class="row-fluid">
        <div class="span12"><h1>Dance through life with TwoStep</h1></div>
    </div>
    <div class="row-fluid">
        <div class="span7">
            <% Html.RenderPartial("IntroCarouselControl"); %>  
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
                    <button class="btn btn-success" type="submit">Sign In</button>
                    </div>
                </div>

                <%: Html.ValidationSummary(true, "Invalid or unrecognized email or password. Please try again.", new { @class = "alert alert-error" })%>

            </fieldset>
        </div>
        </div>
        </div>
    <% } %>

</asp:Content>
