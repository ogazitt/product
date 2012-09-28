<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl" %>

<style type="text/css">
    #help_carousel .carousel-inner { margin-top: -20px; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; }
    #help_carousel .carousel-inner .item { text-align: left; }
    #help_carousel .carousel-inner .item p { font-size: 12pt; font-style: italic; color: #333; line-height: 20px; }
    #help_carousel .carousel-inner .item span { font-size: 12pt; color: #333; font-style: normal; white-space: nowrap; }
    #help_carousel .carousel-inner .item h1 { color: #08C; margin: 0 32px 16px 32px; } 
    #help_carousel .carousel-inner .item h3 { color: #08C; }
    #help_carousel .carousel-inner .item img { margin: 4px; }
    #help_carousel .carousel-inner .item img.pull-left { margin-right: 12px; }
    #help_carousel .carousel-inner .item img.pull-right { margin-left: 12px; }
    #help_carousel .carousel-inner .item .carousel-body { display:block; margin: 4px; }
    #help_carousel .carousel-control { top: 24px; background-color: #08C; width: 30px; height: 30px; font-size: 24px; }
    #help_carousel .carousel-control i { font-size: 28px; margin-left: -4px; padding-top: 2px; }
    #help_carousel .carousel-control.left { left: -8px; xright: 32px; }
    #help_carousel .carousel-control.right { right: -8px; }
    #help_carousel .carousel-control.right i { margin-left: 2px; }
</style>

<div id="help_carousel" class="carousel slide hide">
    <div class="carousel-inner">
        <div class="item active">
            <div class="carousel-body">
                <h1>Let's get started!</h1>
                <p>
                TwoStep installed some Activities for you, but you need to start them.  In the <strong>Organizer</strong>,
                click the 
                <span><i class="icon-user"></i> <strong>Personal</strong></span> 
                category, then click the 
                <span><i class="icon-stop" style="color:Red"></i> <strong>Haircut</strong></span> 
                Activity.  Tell TwoStep how often you get your hair done by clicking the 
                <span><i class="icon-repeat" style="color:Green"></i> <strong>Repeat</strong></span> 
                button.  Finally, click the 
                <span><i class="icon-play" style="color:Green"></i> <strong>Start</strong></span> 
                button to run the Activity.  Rinse and repeat for the other Activities :-)
                </p>
                <img alt="dashboard" src="<%: Url.Content("~/content/images/help/getting-started.png") %>" />
                <!--
                helps you organize and manage your life's Activities.  Activities are things you do - 
                from infrequent events, like planning a wedding, to things you do on a regular basis, 
                like getting your oil changed.  TwoStep helps you break Activities down into actionable Steps 
                <span>( <i class="icon-search"></i>, <i class="icon-phone"></i>, <i class="icon-calendar"></i> ),</span>
                and keeps track of the next steps for you to take across all of your Activities.  
                </p>
                <p>
                TwoStep has selected a set of Activities based on what you told it about yourself when 
                you filled out your profile.  To get things started, you need to configure and run the Activities 
                using this <span> <i class="icon-dashboard"></i> <strong>Activity Dashboard</strong></span>. 
                The following slides explain how to do this. 
                </p>
                <img class="pull-right" alt="Help" src="<%: Url.Content("~/content/images/help/help.png") %>" />
                <p>
                To return to this introduction, select <span>&nbsp;<i class="icon-question-sign"></i> <strong>Help</strong></span> 
                from the menu in the top-right corner.
                </p>
                -->
            </div>
        </div>
        <div class="item">
            <div class="carousel-body">
                <h1>Run Mode</h1>
                <p>
                In Run mode, the next Step is shown as active, and you can 
                <span> <i class="icon-time"></i> <strong>Defer</strong>,
                <i class="icon-share"></i> <strong>Skip</strong>, or 
                <i class="icon-check"></i> <strong>Complete</strong> </span>
                the Step.
                </p>
                <p>
                Every Step has an Action - 
                <span> <i class="icon-search"></i> <strong>Find</strong>,</span>
                <span> <i class="icon-phone"></i> <strong>Call</strong>,</span>
                <span> <i class="icon-calendar"></i> <strong>Add to Calendar</strong>, </span>
                and so on.  Click on the Action icon to perform the step!
                </p>
                <img alt="Run Mode" src="<%: Url.Content("~/content/images/help/run-mode.png") %>" />
            </div>
        </div>  
        <div class="item">
            <div class="carousel-body">
                <h1>The Gallery</h1>
                <img class="pull-right" alt="Gallery" src="<%: Url.Content("~/content/images/help/gallery-install.png") %>" />
                <br />
                <br />
                <p>
                The Gallery contains more preconfigured Activities. 
                </p>
                <p>
                Select an entire Category, or an Activity, and click 
                <span> <i class="icon-download"></i> <strong>Install</strong></span> 
                to add it to your Organizer.
                </p>
            </div>
        </div>
<!--
        <div class="item">
            <div class="carousel-body">
                <h1>Activity Organizer</h1>
                <img class="pull-left" alt="Activity Organizer" src="<%: Url.Content("~/content/images/help/organizer-color.png") %>" />
                <p>
                In the Activity Dashboard, the pane on the left is called the Activity Organizer.  The Organizer 
                contains Categories <span>(e.g. <i class="icon-user"></i> <strong>Personal</strong>,</span> 
                <span> <i class="icon-home"></i> <strong>Home</strong>), </span> 
                which are used to organize Activities. Click a Category to view and select the Activities within.
                </p>
            </div>
        </div>
        <div class="item">
            <div class="carousel-body">
                <h1>Activity Editor</h1>
                <img alt="Activity Editor" src="<%: Url.Content("~/content/images/help/activity-editor.png") %>" />
                <p>
                The center pane of the Activity Dashboard allows you to edit a selected Activity.  
                You can add, remove, or reorder the Steps for an Activity, as well as configure the Activity to repeat.  
                </p>
                <p>
                When you are satisfied with the Activity definition, click the green Run icon on the upper-right.
                TwoStep will keep track of the next Steps for all running Activities.
                To edit a running Activity, click the Pause icon, make your changes and then Resume or Restart.
                </p>
            </div>
        </div>
        <div class="item">
            <div class="carousel-body">
                <h1>Connect to Google and Facebook</h1>
                <img class="pull-left" alt="Location Picker" src="<%: Url.Content("~/content/images/help/location-picker.png") %>" />
                <p>
                If an Action requires more information (for example, a 
                <span> <i class="icon-phone"></i> <strong>Call</strong></span> 
                Step requires a phone number), a dialog box will prompt for you for a location or contact 
                and try to obtain the phone number automatically.
                </p>
            </div>
            <div class="carousel-body">
                <img class="pull-right" alt="Help" src="<%: Url.Content("~/content/images/help/help.png") %>" />
                <p>
                Actions work better when TwoStep is connected to Facebook and Google: 
                Contacts are auto-completed from your Facebook friends, while the 
                <span> <i class="icon-calendar"></i> <strong>Add to Calendar</strong></span> 
                Action can add appointments to your Google calendar if you are connected.  
                To get connected, select <span> <i class="icon-cogs"></i> <strong>User Settings</strong></span> 
                from the menu in the top-right corner.
                </p>
            </div>
        </div>
        <div class="item">
            <div class="carousel-body">
                <h1>Next Steps View</h1>
                <img alt="Next Steps" src="<%: Url.Content("~/content/images/help/next-steps-new.png") %>" />
                <p>
                The other primary view when using TwoStep is the 
                <span> <i class="icon-play"></i> <strong>Next Steps</strong> </span> 
                view - you can find it on the toolbar at the top of the window.  
                This view presents all your active next Steps across all your running Activities, 
                sorted by due date. In addition, you may filter the active Steps by Action such that you
                can focus on Steps of the same type (e.g. making phone calls or running errands).
                </p>
            </div>
        </div>  
        -->
        <div class="item">
            <div class="carousel-body">
                <h1>Mobile App</h1>
                <img class="pull-left" alt="Phone App" src="<%: Url.Content("~/content/images/help/twostep-iphone-small.png") %>" />
                <br />
                <br />
                <p>
                TwoStep is available on the go from any mobile device 
                (iPhone, iPad, Android, Windows Phone and any device with a browser) by navigating to the TwoStep website.  
                All your next steps are collected and available to complete on your phone!
                </p>
            </div>
        </div>
        <!--
        <div class="item">
            <div class="carousel-body">
                <h1>That's it!</h1>
                <p>
                While there are many other features to tell you about, you should know enough to get started.  
                We hope you enjoy using TwoStep and find it as useful for managing your life as we do.  
                </p>
                <p>
                Check out your Organizer, start running your Activities, and let TwoStep help you stay two steps ahead!
                </p>
                <img alt="TwoStep" src="<%: Url.Content("~/content/images/twostep-logo.png") %>" />
           </div>
        </div>
        -->
    </div>
    <a class="carousel-control left" href="#help_carousel" data-slide="prev"><i class="icon-caret-left"></i></a>
    <a class="carousel-control right" href="#help_carousel" data-slide="next"><i class="icon-caret-right"></i></a>
</div>
