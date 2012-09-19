<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl" %>

<style type="text/css">
    #intro_carousel .carousel-inner .item { height: 420px; margin: 16px; padding: 0; text-align: center; }
    #intro_carousel .carousel-inner .item img { margin: 0; max-height: 360px}
    #intro_carousel .carousel-inner .item  div { position:absolute; left: 0; top: 360px; width:100%; text-align: center; }
    #intro_carousel .carousel-inner .item  div p { margin: 0 42px 0 42px;  font-size: 12pt; color: #333; font-style:italic; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;}
    #intro_carousel .carousel-control { top: auto; bottom: 32px; background-color: #08C; }
    #intro_carousel .carousel-control.left { left: 0; }
    #intro_carousel .carousel-control.right { right: 0; }
</style>

<script type="text/javascript">
    // document ready handler
    $(function () { $('#intro_carousel').carousel('pause'); });
</script>

<div id="intro_carousel" class="carousel slide">
    <div class="carousel-inner">
        <div class="item active">
            <span><img alt="Step 1" src="<%: Url.Content("~/content/images/landing/twostep-dance-through-life.png") %>" /></span>
            <div><p>Wouldn’t life be easier if you always knew the next step?</p></div>
        </div>
        <div class="item">
            <span><img alt="Step 2" src="<%: Url.Content("~/content/images/landing/activities-and-steps.png") %>" /></span>
            <div><p>TwoStep keeps you two steps ahead.  Tell it about the activities in your life, and TwoStep will help you select and organize the steps to get them done.</p></div>
        </div>
        <div class="item">
            <span><img alt="Step 3" src="<%: Url.Content("~/content/images/landing/next-steps-web-small.png") %>" /></span>
            <div><p>TwoStep keeps track of all your next steps in one place, and helps you carry them out.</p></div>
        </div>
        <div class="item">
            <span><img alt="Step 4" src="<%: Url.Content("~/content/images/landing/iphone-activity-list-map.png") %>" /></span>
            <div><p>TwoStep remembers everything about the activity and puts that information at your fingertips when you need to do it again.</p></div>
        </div>
        <div class="item">
            <span><img alt="Step 5" src="<%: Url.Content("~/content/images/landing/iphone-next-steps-schedule.png") %>" /></span>
            <div><p>TwoStep connects to and works alongside the digital tools you use - your calendar, mobile phone, Facebook.  And it's available on any smartphone, tablet, or computer with a web browser.</p></div>
        </div>
        <div class="item">
            <span><img alt="Step 6" src="<%: Url.Content("~/content/images/twostep-logo.png") %>" /></span>
            <div><p>Procrastinate less, get more done.<br />Dance through life with TwoStep!</p></div>
        </div>
    </div>
    <a class="carousel-control left" href="#intro_carousel" data-slide="prev">&lsaquo;</a>
    <a class="carousel-control right" href="#intro_carousel" data-slide="next">&rsaquo;</a>
</div>
