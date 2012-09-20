<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl" %>

<style type="text/css">
    .product-info { margin-top: 300px; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; }
    .product-info .item { padding: 50px; }
    .product-info .item p {
        max-width: 750px; padding-left: 100px; padding-right: 100px; padding-top: 20px; 
        font-size: 12pt; color: #333; font-style: italic;
    }
    .product-info .item h2 { color: #08C; }
    .product-info .item .left-pic { margin-right: 20px; }
    .product-info .item .right-pic { margin-left: 20px; margin-top: -30px; }
    .product-info .item .full-pic { margin-left: 100px; }
    .product-info .item img { margin: 20px; }
    .product-info .item .title-text { max-width: 850px; margin-right: 100px; }
    #intro_section      { background-color: #eee; /*#f0fff0;*/ }
    #gallery_section    { background-color: #fff; /*#f0f0f0;*/ }
    #cadence_section    { background-color: #eee; /*#fffff0;*/ }
    #find_section       { background-color: #fff; /*#f0f0ff;*/ }
    #steps_section      { background-color: #eee; /*#fff0f0;*/ }
    #nextsteps_section  { background-color: #fff; /*#ffffff;*/ }
    #nextsteps_section img { margin-top: 0px; margin-bottom: 0px; max-width: 330px; }
</style>

<div id="product_info" class="product-info">
    <div id="intro_section" style="min-height: 470px">
        <div class="item">
            <div class="title-text">
                <button class="btn btn-success pull-right signup" onclick="window.location='<%: Url.Content("~/account/register") %>'">Sign Up</button>
                <h2>The personal assistant for life's activities.</h2>
            </div>
            <span class="left-pic pull-left"><img alt="Organizer" src="<%: Url.Content("~/content/images/landing/organizer-color.png") %>" /></span>
            <p>
            Our lives revolve around a set of activities.  We carry the burden of remembering them all in our heads.  
            We try to make lists of things we need to do, but whether  tracked on paper or digitally, the information 
            is hard to find, easy to lose, and often becomes stale.  Our calendar reminds us of when and where we need 
            to be, but life is a lot more complicated than what fits into the calendar.  Today, we simply don’t have 
            the tools we need to cope with our busy lives – we just fall back on using our brain as the place to store 
            all those details… which causes us stress as we worry that something important may not get done.
            </p>
            <p>
            TwoStep can help!  Taking control of your life starts with capturing all of your activities, understanding 
            what the next actionable steps are across them all, and making it easy to take those next steps.
            </p>
        </div>
    </div>
    <div id="gallery_section" style="min-height: 400px">
        <div class="item">
            <span class="right-pic pull-right"><img alt="Gallery" src="<%: Url.Content("~/content/images/landing/gallery-install.png") %>" /></span>
            <div class="title-text">
                <button class="btn btn-success pull-right signup" onclick="window.location='<%: Url.Content("~/account/register") %>'">Sign Up</button>
                <h2>Get started in under a minute.</h2>
            </div>
            <p>
            We all tend to do many of the same kinds of activities. With an extensive gallery of activities curated 
            from users like you, across categories like Personal Care, Home, Auto, Kid’s Activities, and Finances, 
            TwoStep suggests and lets you choose the activities that best fit your life.
            </p>
        </div>
    </div>
    <div id="cadence_section" style="min-height: 440px">
        <div class="item">
            <div class="title-text">
                <button class="btn btn-success pull-right signup" onclick="window.location='<%: Url.Content("~/account/register") %>'">Sign Up</button>
                <h2>Stay on top of repeating activities.</h2>
            </div>
            <span class="left-pic pull-left"><img alt="Gutter Cleaning" src="<%: Url.Content("~/content/images/landing/gutter-cleaning.png") %>" /></span>
            <!--
            <span>
                <img alt="Gutter Cleaning" src="<%: Url.Content("~/content/images/landing/gutter-cleaning.png") %>" />
                <img alt="Repeat" src="<%: Url.Content("~/content/images/landing/repeat.png") %>" />
            </span>
            -->
            <p>
            Most activities tend to repeat themselves on a regular basis. With TwoStep you can define a cadence 
            for your recurring activities. You can attach reference information to an activity – such as people, 
            places, links, notes, and lists – so the next time you need to clean the gutters, you can easily find 
            the service you used last time, what you thought of them, and their phone number – saving you the 
            effort of finding that information all over again.
            </p>
        </div>
    </div>
    <div id="find_section" style="min-height: 500px">
        <div class="item">
            <div class="title-text">
                <button class="btn btn-success pull-right signup" onclick="window.location='<%: Url.Content("~/account/register") %>'">Sign Up</button>
                <h2>Find out how others get activities done.</h2>
            </div>
            <span class="full-pic"><img alt="Gutter Cleaning" src="<%: Url.Content("~/content/images/landing/ask-facebook-friends-small.png") %>" /></span>
            <p>
            We often procrastinate most when we are faced with a task that requires us to find something.  
            If you’ve never had your gutters cleaned, wouldn’t it be nice to find out who your neighbors use?  
            TwoStep allows you to share your activity information with your friends and neighbors, and vice 
            versa, so you can find out what people like you are doing to handle certain activities.
            </p>
        </div>
    </div>
    <div id="steps_section" style="min-height: 500px">
        <div class="item">
            <div class="title-text">
                <button class="btn btn-success pull-right signup" onclick="window.location='<%: Url.Content("~/account/register") %>'">Sign Up</button>
                <h2>Break complex tasks into actionable steps.</h2>
            </div>
            <span class="full-pic"><img alt="Plan Party" src="<%: Url.Content("~/content/images/landing/plan-party.png") %>" /></span>
            <p>
            The secret to staying on top of an activity is to break it down into a sequence of actionable steps.  
            TwoStep helps you do this, so that you always know what your next actionable step is for any activity.  
            From a single step, like “make an appointment at the hair salon”, to a complex sequence of steps, 
            like “plan a wedding”, the activity gallery can recommend relevant steps and let you arrange them in 
            the most appropriate sequence.
            </p>
        </div>
    </div>
    <div id="nextsteps_section" style="min-height: 450px">
        <div class="item">
            <div class="title-text">
                <button class="btn btn-success pull-right signup" onclick="window.location='<%: Url.Content("~/account/register") %>'">Sign Up</button>
                <h2>Stay two steps ahead.</h2>
            </div>
            <br />
            <span class="left-pic pull-left"><img alt="Next Steps" src="<%: Url.Content("~/content/images/landing/twostep-iphone-small.png") %>" /></span>
            <p>
            You get things done by completing steps.  TwoStep always provides you with a prioritized, organized 
            list of the next steps that you should take, across all of your activities.  These steps are most 
            efficiently completed when organizing them by type – for example, steps which require making a phone 
            call, or steps which require running an errand. 
            <br /><br />
            Your list of next steps is organized by type and 
            easily accessible from any mobile device. So when you have that free half hour riding the bus, you 
            can complete those steps that require a phone call.
            </p>
            <img xstyle="width:330px" alt="Dance through life" src="<%: Url.Content("~/content/images/landing/twostep-dance-through-life.png") %>" />
        </div>
    </div>
</div>
