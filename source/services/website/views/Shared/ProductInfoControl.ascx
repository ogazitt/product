<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl" %>

<style type="text/css">
    .product-info { margin-top: 300px; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; }
    .product-info .item { padding: 50px; }
    .product-info .item p {
        max-width: 600px; padding-left: 100px; padding-right: 100px; padding-top: 20px; 
        font-size: 12pt; color: #333; font-style: italic;
    }
    .product-info .item h2 { color: #08C; }
    .product-info .item .left-pic { margin-right: 20px; }
    .product-info .item .right-pic { margin-left: 20px; margin-top: -30px; }
    .product-info .item .full-pic { margin-left: 100px; }
    .product-info .item img { margin: 20px; }
    .product-info .item .title-text { max-width: 700px; margin-right: 100px; }
    #intro_section      { background-color: #eee; /*#f0fff0;*/ }
    #steps_section      { background-color: #fff; /*#fff0f0;*/ }
    #cadence_section    { background-color: #eee; /*#fffff0;*/ }
    #find_section       { background-color: #fff; /*#f0f0ff;*/ }
    #action_section     { background-color: #eee; /*#f0f0ff;*/ }
    #tools_section      { background-color: #fff; /*#f0f0ff;*/ }
    #gallery_section    { background-color: #eee; /*#f0f0f0;*/ }
    #gallery_section img  { margin-top: -25px; }
    #nextsteps_section  { background-color: #fff; /*#ffffff;*/ }
    /* #nextsteps_section img { margin-top: 0px; margin-bottom: 0px; max-width: 330px; } */
</style>

<div id="product_info" class="product-info">
    <div id="intro_section" style="min-height: 470px">
        <div class="item">
            <div class="title-text">
                <h2>Stay on top of life's activities.</h2>
            </div>
            <span class="left-pic pull-left"><img alt="Manage all your activities in the Organizer" src="<%: Url.Content("~/content/images/landing/activities-gray.png") %>" /></span>
            <!--
            <p>
            </p>
            -->
        </div>
    </div>
    <div id="steps_section" style="min-height: 430px">
        <div class="item">
            <div class="title-text">
                <h2>Break complex tasks into actionable steps.</h2>
            </div>
            <span class="lift-pic pull-left"><img alt="Break complex tasks into simple, actionable steps" src="<%: Url.Content("~/content/images/landing/plan-a-party.png") %>" /></span>
            <!--
            <p>
            TwoStep helps you come up with the right set of steps, and connects the result of each step with the activity it belongs to. 
            </p>
            -->
        </div>
    </div>
    <div id="cadence_section" style="min-height: 450px">
        <div class="item">
            <div class="title-text">
                <h2>Remember everything about repeating activities.</h2>
            </div>
            <span class="left-pic pull-left"><img alt="Remember all information about recurring activities" src="<%: Url.Content("~/content/images/landing/gutter-cleaning-details-small-gray.png") %>" /></span>
            <!--
            <p>
            Easily find the gutter cleaning service you used last year, what you thought of them, and their phone number.
            </p>
            -->
        </div>
    </div>
    <div id="find_section" style="min-height: 350px">
        <div class="item">
            <div class="title-text">
                <h2>Find out how others get activities done.</h2>
            </div>
            <span class="full-pic"><img alt="Find local businesses that your friends use" src="<%: Url.Content("~/content/images/landing/ask-facebook-friends-small.png") %>" /></span>
            <!--
            <p>
            Share your activity information with your friends and neighbors, and find out what services others use.
            </p>
            -->
        </div>
    </div>
    <div id="action_section" style="min-height: 300px">
        <div class="item">
            <div class="title-text">
                <h2>Take action.</h2>
            </div>
            <span class="left-pic pull-left"><img alt="Call, email, find, ask Facebook friends, add to calendar, remind, map" src="<%: Url.Content("~/content/images/landing/action-buttons-gray.png") %>" /></span>
        </div>
    </div>
    <div id="tools_section" style="min-height: 350px">
        <div class="item">
            <div class="title-text">
                <h2>Integrates with the tools you use every day.</h2>
            </div>
            <span class="left-pic pull-left"><img alt="Works with Facebook, Google calendar, iPhone, iPad, Android, Windows Phone, Windows, Mac" src="<%: Url.Content("~/content/images/landing/tools.png") %>" /></span>
        </div>
    </div>
    <div id="gallery_section" style="min-height: 400px">
        <div class="item">
            <span class="left-pic pull-left"><img alt="Get started using our extensive gallery of activities" src="<%: Url.Content("~/content/images/landing/gallery-install-gray.png") %>" /></span>
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
            <span class="full-pic"><img alt="Take your list of next steps with you on any mobile device" src="<%: Url.Content("~/content/images/landing/iphone-next-steps-schedule.png") %>" /></span>
            <!--
            <p>
            Take your list of next steps on the go, using any mobile device.  TwoStep organizes all of your steps by type, 
            and allows you to call, text, email, map, find a new service, and schedule appointments - all from your phone.
            </p>
            -->
            <!--
            <img xstyle="width:330px" alt="Dance through life" src="<%: Url.Content("~/content/images/landing/twostep-dance-through-life.png") %>" />
            -->
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