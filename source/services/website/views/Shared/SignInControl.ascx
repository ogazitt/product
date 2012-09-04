﻿<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl" %>
<% if (Request.IsAuthenticated) { %>
<ul class="nav nav-pills pull-right">
<% if (Request.Url.PathAndQuery.IndexOf("mobile", StringComparison.CurrentCultureIgnoreCase) >= 0) { %>
    <li class="option-nextsteps hide"><a><i class="icon-play icon-white"></i>&nbsp;</a></li>
    <li class="option-categories hide"><a><i class="icon-folder-open icon-white"></i>&nbsp;</a></li>
    <li class="option-add hide"><a><i class="icon-plus icon-white"></i>&nbsp;</a></li>
<% } %>
    <li class="divider-vertical"></li>    
    <li class="dropdown active">
        <a class="dropdown-toggle" data-toggle="dropdown">
            <i class="icon-user icon-white"></i> <strong><%: Request.Path.IndexOf("Mobile", StringComparison.OrdinalIgnoreCase) > 0 ? "" : Page.User.Identity.Name %></strong> <b class="caret"></b>
        </a>
        <ul class="dropdown-menu">
<% if (Request.Url.PathAndQuery.IndexOf("mobile", StringComparison.CurrentCultureIgnoreCase) >= 0) { %>
            <li><a href="<%: Url.Content("~/mobile/home") %>"><i class="icon-play"></i> Next Steps</a></li>
<% } else { %>
            <li><a href="<%: Url.Content("~/dashboard/home") %>"><i class="icon-dashboard"></i> Activity Dashboard</a></li>
            <li><a href="<%: Url.Content("~/dashboard/nextsteps") %>"><i class="icon-play"></i> Next Steps</a></li>
<% } %>
            <li class="divider"></li>            
            <li class="option-help hide"><a><i class="icon-question-sign"></i> Help</a></li>
            <li class="option-settings hide"><a><i class="icon-cogs"></i> User Settings</a></li>
            <li class="option-refresh hide"><a><i class="icon-refresh"></i> Refresh</a></li>
            <li class="divider"></li>            
            <li><a href="<%: Url.Content("~/account/signout") %>" onclick="Service.SignOut()"><i class="icon-off"></i> Sign Out</a></li>
        </ul>
    </li>
</ul>
<% } else if (Request.Path.EndsWith("SignIn", StringComparison.OrdinalIgnoreCase)) { %>
    <ul class="nav pull-right">
        <li class="divider-vertical"></li>    
        <li><button class="btn btn-primary" onclick="window.location='<%: Url.Content("~/account/register") %>'">Sign Up</button></li>
    </ul>
<% } else { %> 
    <ul class="nav pull-right">
        <li class="divider-vertical"></li>    
        <li><button class="btn btn-primary" onclick="window.location='<%: Url.Content("~/account/signin") %>'">Sign In</button></li>
    </ul>
<% } %>

