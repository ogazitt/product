<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl" %>

<style type="text/css">
    .carousel-inner .item { height: 340px; margin: 24px; text-align: center; }
    .carousel-inner .item  p { margin: 16px 32px 0 32px; font-size: 14pt; color: #06A; font-family:'Segoe UI Light', 'Helvetica Neue', Helvetica, Arial, sans-serif;}
</style>

<div id="intro_carousel" class="carousel slide">
    <div class="carousel-inner">
        <div class="item active">
            <span><img alt="Step 1" src="<%: Url.Content("~/content/images/twostep-logo.png") %>" /></span>
            <p>Wouldn’t life be easier if you always knew the next step to take?</p>
        </div>
        <div class="item">
            <span><img alt="Step 2" src="<%: Url.Content("~/content/images/twostep-logo.png") %>" /></span>
            <p>TwoStep keeps you two steps ahead.  You tell it what you already do in your life and what you want to do more of, and it will help you select and organize the steps to get it done.</p>
        </div>
        <div class="item">
            <span><img alt="Step 3" src="<%: Url.Content("~/content/images/twostep-logo.png") %>" /></span>
            <p>TwoStep keeps track of all your next steps and helps you carry them out.</p>
        </div>
        <div class="item">
            <span><img alt="Step 4" src="<%: Url.Content("~/content/images/twostep-logo.png") %>" /></span>
            <p>TwoStep remembers what you did last time and makes it easier to do it this time.</p>
        </div>
        <div class="item">
            <span><img alt="Step 5" src="<%: Url.Content("~/content/images/twostep-logo.png") %>" /></span>
            <p>Procrastinate less, get more done.<br />Dance through life with TwoStep!</p>
        </div>
    </div>
    <a class="carousel-control left" href="#intro_carousel" data-slide="prev">&lsaquo;</a>
    <a class="carousel-control right" href="#intro_carousel" data-slide="next">&rsaquo;</a>
</div>
