<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl" %>

<style type="text/css">
    .product-info { margin-top: 300px; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; }
    .product-info .item { padding: 32px 48px; }
    .product-info .item.pull-left { margin-left: 60px; }
    .product-info .item.pull-right { margin-right: 60px; }
    .product-info .item p {
        max-width: 600px; padding-left: 100px; padding-right: 100px; padding-top: 20px; 
        font-size: 12pt; color: #333; font-style: italic;
    }
    .product-info .item h2 { color: #08C; }
    .product-info .item img { margin: 20px; }
    .product-info .item .title-text { max-width: 700px; margin-right: 100px; }
    .product-info .btn { font-size: 18pt; padding: 12px; }

    #intro_section      { background-color: #eee; }
    #steps_section      { background-color: #fff; }
    #cadence_section    { background-color: #eee; }
    #find_section       { background-color: #fff; }
    #action_section     { background-color: #eee; }
    #tools_section      { background-color: #fff; }
    #gallery_section    { background-color: #eee; }
    #gallery_section img  { margin-top: -25px; }
    #nextsteps_section  { background-color: #fff; }
</style>

<div id="product_info" class="product-info">
    <div id="intro_section" style="min-height: 540px; padding-top: 60px;">
        <div class="item pull-left">
            <div class="title-text">
                <h2>Stay on top of life's activities.</h2>
            </div>
            <div class="well"><img alt="Manage all your activities in the Organizer" src="<%: Url.Content("~/content/images/landing/activities.png") %>" /></div>
        </div>
    </div>
    <div id="steps_section" style="min-height: 430px">
        <div class="item pull-right">
            <div class="title-text">
                <h2>Break complex tasks into actionable steps.</h2>
            </div>
            <div class="well"><img alt="Break complex tasks into simple, actionable steps" src="<%: Url.Content("~/content/images/landing/plan-a-party.png") %>" /></div>
            <!-- <p>TwoStep helps you come up with the right set of steps, and connects the result of each step with the activity it belongs to. </p>-->
        </div>
    </div>
    <div id="cadence_section" style="min-height: 450px">
        <div class="item pull-left">
            <div class="title-text">
                <h2>Remember everything about repeating activities.</h2>
            </div>
            <div class="well"><img alt="Remember all information about recurring activities" src="<%: Url.Content("~/content/images/landing/gutter-cleaning-details.png") %>" /></div>
            <!-- <p>Easily find the gutter cleaning service you used last year, what you thought of them, and their phone number.</p>-->
        </div>
    </div>
    <div id="find_section" style="min-height: 400px">
        <div class="item pull-right">
            <div class="title-text">
                <h2>Find out how others get activities done.</h2>
            </div>
            <div class="well"><img alt="Find local businesses your friends use" src="<%: Url.Content("~/content/images/landing/ask-facebook-friends-small.png") %>" /></div>
            <!-- <p>Share your activity information with your friends and neighbors, and find out what services others use.</p>-->
        </div>
    </div>
    <div id="action_section" style="min-height: 300px">
        <div class="item pull-left">
            <div class="title-text">
                <h2>Take action.</h2>
            </div>
            <div><img alt="Call, email, find, ask Facebook friends, add to calendar, remind, map" src="<%: Url.Content("~/content/images/landing/action-buttons.png") %>" /></div>
        </div>
    </div>
    <div id="tools_section" style="min-height: 350px">
        <div class="item pull-right">
            <div class="title-text">
                <h2>Integrates with the tools you use every day.</h2>
            </div>
            <div><img alt="Works with Facebook, Google calendar, iPhone, iPad, Android, Windows Phone, Windows, Mac" src="<%: Url.Content("~/content/images/landing/tools.png") %>" /></div>
        </div>
    </div>
    <div id="gallery_section" style="min-height: 480px">
        <div class="item">
            <div class="well pull-left" style="height:420px; margin-right:32px;">
                <img style="padding-top:40px;" alt="Get started using our extensive gallery of activities" src="<%: Url.Content("~/content/images/landing/gallery-install.png") %>" />
            </div>
            <div class="title-text">
                <h2>Get started in under a minute.</h2>
            </div>
            <p>
            With an extensive gallery of activities curated from users like you, 
            TwoStep suggests and lets you choose the activities that best fit your life.
            </p>
        </div>
    </div>
    <div id="nextsteps_section" style="min-height: 550px">
        <div class="item">
            <div class="title-text">
                <button class="btn btn-success pull-right signup" onclick="ProductInfoSignUpButtonHandler()">Sign Up</button>
                <h2>Stay two steps ahead, anywhere, on any device.</h2>
            </div>
            <br />
            <div><img alt="Take your list of next steps with you on any mobile device" src="<%: Url.Content("~/content/images/landing/iphone-next-steps-schedule.png") %>" /></div>
            <!-- <p>
            Take your list of next steps on the go, using any mobile device.  TwoStep organizes all of your steps by type, 
            and allows you to call, text, email, map, find a new service, and schedule appointments - all from your phone.
            </p> -->
            <!-- <img xstyle="width:330px" alt="Dance through life" src="<%: Url.Content("~/content/images/landing/twostep-dance-through-life.png") %>" /> -->
        </div>
    </div>
</div>

<script type="text/javascript">
    ProductInfoSignUpButtonHandler = function () {
        Events.Track(Events.Categories.LandingPage, Events.LandingPage.ProductInfoSignUpButton);
        // since the user explicitly asked for the Register page, pass in a parameter to remove the ExistingUser cookie
        window.location = '<%: Url.Content("~/account/register/?removeCookie=true") %>';
    }
</script>