<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl" %>
<style type="text/css">
    #launchrock { background: #101010; opacity: 0.8; }
    .modal-body { min-height: 500px; }
    .inviteform label { color: #ffffff; }
    .modal-body .lrdiscoverwidget .site-tagline { font-size: 16pt; font-style: italic; }
    #launchrock button { color: #fff; }
</style>

    <div id="launchrock" class="modal hide fade">
        <button type="button" class="close" data-dismiss="modal"><strong>x</strong></button>
        <div class="modal-body">
            <center>
                <div rel="L7VSE7VS" class="lrdiscoverwidget" data-logo="on" data-background="off" data-share-url="www.trytwostep.com" data-css="">
                </div>
            </center>
        </div>        
    </div>

    <script type="text/javascript" src="http://launchrock-ignition.s3.amazonaws.com/ignition.1.1.js"></script>
    <script type="text/javascript">
        // modal message
        ShowLaunchRock = function () {
            Events.Track(Events.Categories.LandingPage, Events.LandingPage.LearnMoreButton);
            if (Browser.MSIE_Version() >= 10) {
                alert("Unfortunately TwoStep doesn't support IE 10 yet - still working out the bugs!  Please try IE 9, Chrome, or Safari.  Thanks!");
                return;
            }

            var $launchrock = $('#launchrock');
            if ($launchrock.length == 0) {
            } else {
                $launchrock.modal('show');
            }

            $launchrock.find('input.submit').one('click', function () {
                Events.Track(Events.Categories.LandingPage, Events.LandingPage.LaunchRockGoButton);
            });
        }
    </script>