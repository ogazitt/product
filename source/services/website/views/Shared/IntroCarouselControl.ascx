<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl" %>

<style type="text/css">
    .carousel-inner .item { height: 420px; margin: 24px; text-align: center; }
    .carousel-inner .item  p { margin: 16px 32px 0 32px; font-size: 14pt; color: #06A; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;}
</style>

<script type="text/javascript">
    // document ready handler
    $(function () { $('#intro_carousel').carousel('pause'); });
</script>

<div id="intro_carousel" class="carousel slide">
    <div class="carousel-inner">
        <div class="item active">
            <span><img alt="Step 1" src="<%: Url.Content("~/content/images/landing/twostep-dance-through-life.png") %>" /></span>
            <p>Wouldn’t life be easier if you always knew the next step?</p>
        </div>
        <div class="item">
            <span><img alt="Step 2" src="<%: Url.Content("~/content/images/landing/activities-and-steps.png") %>" /></span>
            <p>TwoStep keeps you two steps ahead.  Tell it about the activities in your life, and TwoStep will help you select and organize the steps to get them done.</p>
        </div>
        <div class="item">
            <span><img alt="Step 3" src="<%: Url.Content("~/content/images/landing/next-steps-web-small.png") %>" /></span>
            <p>TwoStep keeps track of all your next steps in one place, and helps you carry them out.</p>
        </div>
        <div class="item">
            <span><img alt="Step 4" src="<%: Url.Content("~/content/images/landing/iphone-activity-list-map.png") %>" /></span>
            <p>TwoStep remembers everything about the activity and puts that information at your fingertips when you need to do it again.</p>
        </div>
        <div class="item">
            <span><img alt="Step 5" src="<%: Url.Content("~/content/images/landing/iphone-next-steps-schedule.png") %>" /></span>
            <p>TwoStep connects to and works alongside the digital tools you use - your calendar, mobile phone, Facebook.  And it's available on any smartphone, tablet, or computer with a web browser.</p>
        </div>
        <div class="item">
            <span><img alt="Step 6" src="<%: Url.Content("~/content/images/twostep-logo.png") %>" /></span>
            <p>Procrastinate less, get more done.<br />Dance through life with TwoStep!</p>
        </div>
    </div>
    <a class="carousel-control left" href="#intro_carousel" data-slide="prev">&lsaquo;</a>
    <a class="carousel-control right" href="#intro_carousel" data-slide="next">&rsaquo;</a>
</div>
