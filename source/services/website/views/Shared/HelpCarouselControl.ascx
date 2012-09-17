<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl" %>

<style type="text/css">
    .carousel-inner { margin-top: -16px; }
    .carousel-inner .item { height: 550px; text-align: left; }
    .carousel-inner .item span { font-size: 12pt; color: #06A; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; }
    .carousel-inner .item p { font-size: 12pt; color: #06A; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; }
    .carousel-inner .item h1 { color: #06A; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; }
    .carousel-inner .item h3 { color: #06A; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; }
    .carousel-inner .item .left-pic { margin-right: 20px; }
    .carousel-inner .item .right-pic { margin-left: 20px; }
    .carousel-inner .item .carousel-body { margin: 10px 45px 0 45px; }
    .carousel-inner .item .carousel-block { display: block; margin: 10px 45px 0 45px; }
    .carousel .carousel-control.left { margin-left: -25px; }
    .carousel .carousel-control.right { margin-right:-25px; }
</style>

<div id="help_carousel" class="carousel slide hide">
    <div class="carousel-inner">
        <div class="item active">
            <div class="carousel-body">
                <h1>Welcome to TwoStep!</h1>
                <h3>Here's a short introduction to the product.</h3>
                <p>
                TwoStep helps you organize and manage your life's Activities.  Activities are can be anything - 
                from things you do once, like planning a wedding, to things that you do on a regular basis, 
                like getting your oil changed.  TwoStep helps you break Activities down into actionable Steps 
                <span>
                (
                <i class="icon-search"></i>, <i class="icon-phone"></i>, <i class="icon-calendar"></i>
                ),
                </span>
                and keeps track of the next steps to take across all of your Activities.  
                </p>
                <p>
                TwoStep has already picked a set of Activities that match what you told us about yourself when 
                you filled out your profile.  To get things rolling, you need to configure and run these Activities using
                the <span>&nbsp;<i class="icon-dashboard"></i> Activity Dashboard, </span> the current view.  The next few help panels 
                explain how to do this. 
                </p>
                <span class="right-pic pull-right"><img alt="Help" src="<%: Url.Content("~/content/images/help/help.png") %>" /></span>
                <p>
                To get back to this introduction, simply select <span>&nbsp;<i class="icon-question-sign"></i> Help</span> from the 
                menu at the top right corner.
                </p>
            </div>
        </div>
        <div class="item">
            <div class="carousel-body">
                <h1>Activity Organizer</h1>
                <br />
                <span class="left-pic pull-left"><img alt="Activity Organizer" src="<%: Url.Content("~/content/images/help/organizer-color.png") %>" /></span>
                <span>
                In the Dashboard, the pane on the left is called the Activity Organizer.  The Organizer 
                contains Categories (e.g. <span>&nbsp;<i class="icon-user"></i> Personal,</span> <span>&nbsp;<i class="icon-home"></i> Home), </span> and 
                each Category contains Activities.  Click a Category to view and select the Activities inside.
                </span>
            </div>
        </div>
        <div class="item">
            <div class="carousel-body">
                <h1>Activity Editor</h1>
                <br />
                <img alt="Activity Editor" src="<%: Url.Content("~/content/images/help/activity-editor.png") %>" />
                <br />
                <p>
                The middle pane of the Dashboard allows you to edit the selected Activity.  You can add, 
                remove, or reorder Steps, and control how the Activity repeats.  <br /><br />
                </p>
                <p>
                When you are satisfied with the Activity, click the green Run icon on the top-right 
                corner to run the Activity.  To edit the Activity again, click the Pause icon.
                </p>
            </div>
        </div>
        <div class="item">
            <div class="carousel-body">
                <h1>Run Mode</h1>
                <br />
                <img alt="Run Mode" src="<%: Url.Content("~/content/images/help/run-mode.png") %>" />
                <br />
                <p>
                In Run mode, the current Step is shown, and you can <span>&nbsp;<i class="icon-time"></i> Defer, </span>
                <span>&nbsp;<i class="icon-share"></i> Skip, </span> or <span>&nbsp;<i class="icon-check"></i> Complete </span>
                the Step. <br /><br />
                </p>
                <p>
                Each Step has an Action Type - 
                <span>&nbsp;<i class="icon-search"></i> Find, </span>
                <span>&nbsp;<i class="icon-phone"></i> Call, </span>
                <span>&nbsp;<i class="icon-calendar"></i> Add to Calendar, </span>
                etc.  TwoStep usually does a good job 
                guessing the Action Type, but you can also set it explicitly.  In addition to the common operations 
                (Defer, Skip, Complete), each Step also has Action icon that can help you carry out the Action Type 
                associated with the Step.
                </p>
            </div>
        </div>  
        <div class="item">
            <div class="carousel-body">
                <h1>Gallery</h1>
                <br />
                <span class="right-pic pull-right"><img alt="Gallery" src="<%: Url.Content("~/content/images/help/gallery-install.png") %>" /></span>
                <span>
                The pane on the right side of the Dashboard is the Gallery.  The Gallery contains a set of 
                common Activities with preconfigured Steps - it's a great way to discover Activities that may 
                be relevant to you. 
                <br /><br />
                You can click on the arrow on an 
                Activity or Category to select the Install action, which will add that Activity or that entire 
                Category of Activities to your Organizer.
                </span>
            </div>
        </div>
        <div class="item">
            <div class="carousel-body">
                <h1>Connect to Google and Facebook</h1>
                <br />
                <span class="left-pic pull-left"><img alt="Location Picker" src="<%: Url.Content("~/content/images/help/location-picker.png") %>" /></span>
                <span>
                If an Action requires more information (for example, a Call Step needs a phone number), a dialog box 
                will prompt for a location or contact and try to obtain the phone number automatically.
                </span>
            </div>
            <div class="carousel-body">
                <span class="right-pic pull-right"><img alt="Help" src="<%: Url.Content("~/content/images/help/help.png") %>" /></span>
                <span>
                Actions work better when TwoStep is connected to Facebook and Google: Contacts are auto-completed from 
                Facebook, and the “Add to Calendar” Action Type only works if you connected to the Google calendar.  
                To do this, select <span>&nbsp;<i class="icon-cogs"></i> User Settngs, </span> from the menu at the top-right corner.
                </span>
            </div>
        </div>
        <div class="item">
            <div class="carousel-body">
                <h1>Next Steps View</h1>
                <br />
                <img alt="Next Steps" src="<%: Url.Content("~/content/images/help/next-steps-new.png") %>" />
                <br />
                <br />
                <p>
                TwoStep’s other main view is the <span>&nbsp;<i class="icon-play"></i> Next Steps </span> view - you can find it 
                on the toolbar at the top of the window.  This view presents all your immediate next steps across 
                all Activities, sorted by due date.  It also allows filtering the Steps by Action Type (e.g. all phone calls), 
                and carrying out the Step by clicking its Action icon.
                </p>
            </div>
        </div>  
        <div class="item">
            <div class="carousel-body">
                <h1>Mobile App</h1>
                <br />
                <span class="left-pic pull-left"><img alt="Activity Organizer" src="<%: Url.Content("~/content/images/help/twostep-iphone-small.png") %>" /></span>
                <span>
                Finally, TwoStep’s Mobile app is accessible on the go from any mobile device (iPhone, iPad, Android, 
                Windows Phone and any other device with a browser) by navigating to the TwoStep website.
                The Mobile app allows you to complete Steps on the go (Call, Schedule, Map, etc) as well as viewing 
                your running <span>&nbsp;<i class="icon-folder-open"></i> Activities, </span> and 
                <span>&nbsp;<i class="icon-plus"></i> Adding </span> new Activities to your 
                <span>&nbsp;<i class="icon-envelope"></i> Inbox.</span> 
                </span>
            </div>
        </div>
        <div class="item">
            <div class="carousel-body">
                <h1>That's it!</h1>
                <br />
                <span>
                While there are more features we can tell you about, you now know enough to get started.  
                We hope you enjoy using TwoStep and find it as useful for managing your life as we do.  
                <br /><br />
                So check out your Organizer, select some Activities and run them, and let TwoStep help you stay 
                two steps ahead!
                </span>
            </div>
        </div>
    </div>
    <a class="carousel-control left" href="#help_carousel" data-slide="prev">&lsaquo;</a>
    <a class="carousel-control right" href="#help_carousel" data-slide="next">&rsaquo;</a>
</div>
