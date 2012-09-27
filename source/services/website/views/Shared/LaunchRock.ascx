﻿<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl" %>
<style type="text/css">
    #launchrock { background: #101010; opacity: 0.8; }
    .modal-body { min-height: 480px; }
    .inviteform label { color: #ffffff; }
    .modal-body .lrdiscoverwidget .site-tagline { font-size: 16pt; font-style: italic; }
    #launchrock button { color: #fff; }
</style>

    <div id="launchrock" class="modal hide fade">
        <button type="button" class="close" data-dismiss="modal"><strong>x</strong></button>
        <div class="modal-body">
            <center>
                <div rel="L7VSE7VS" class="lrdiscoverwidget" data-logo="on" data-background="off" data-share-url="twostepdev1.cloudapp.net" data-css="">
                </div>
            </center>
        </div>        
    </div>

    <script type="text/javascript" src="http://launchrock-ignition.s3.amazonaws.com/ignition.1.1.js"></script>
    <script type="text/javascript">
        // modal message
        ShowLaunchRock = function () {
            var $launchrock = $('#launchrock');
            if ($launchrock.length == 0) {
            } else {
                $launchrock.modal('show');
            }
        }
    </script>