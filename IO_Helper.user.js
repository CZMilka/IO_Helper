// ==UserScript==
// @name        IO_Helper
// @namespace   io_helper
// @include     http://www*.imperiaonline.org/imperia/game_v6/game/village.php*
// @require     http://code.jquery.com/jquery-2.1.3.min.js
// @require     https://raw.githubusercontent.com/bunkat/later/master/later.min.js
// @resource 	tabs https://raw.githubusercontent.com/panayot-zhi/IO_Helper/master/html/tabs.html
// @resource 	tab-general https://raw.githubusercontent.com/panayot-zhi/IO_Helper/master/html/tab-general.html
// @version     1.8
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_xmlhttpRequest
// @grant       GM_getResourceText
// @grant       GM_registerMenuCommand
// @grant       unsafeWindow
// ==/UserScript==

var $ = this.$ = this.jQuery = jQuery.noConflict(true);
var unsafeWindow = unsafeWindow || console.error("Imperia Online Helper: This script requires access to the unsafeWindow.");
var GM_getValue = GM_getValue || console.error("Imperia Online Helper: This script requires access to the GM_getValue function.");
var GM_setValue = GM_setValue || console.error("Imperia Online Helper: This script requires access to the GM_setValue function.");
var GM_xmlhttpRequest = GM_xmlhttpRequest || console.error("Imperia Online Helper: This script requires access to the GM_xmlhttpRequest.");
var GM_getResourceText = GM_getResourceText || console.error("Imperia Online Helper: This script requires access to the GM_getResourceText function.", "Greasemonkey");
var GM_registerMenuCommand = GM_registerMenuCommand || console.error("Imperia Online Helper: This script requires access to the GM_registerMenuCommand function.", "Greasemonkey");

// TODO: Extract variables from localStorage here
var debugMode = false;

var inject = {

    // makes a shallow
    // structured clone of object
    object: function(object){
        try {

            var exportObject = {};
            if (typeof object == "object") {

                for (var property in object) {
                    if (object.hasOwnProperty(property)) {
                        if(typeof object[property] == "function") {
                            exportObject[property] = exportFunction == "function"
                                ? exportFunction(object[property], unsafeWindow)    // export object function
                                : object[property];  // regular function, no need of cloning
                        } else {
                            exportObject[property] = object[property];
                        }
                    }
                }

                return typeof cloneInto == "function"
                    ? cloneInto(exportObject, unsafeWindow) // return structured clone
                    : exportObject; // regular object (no need of cloning)
            }

        } catch(ex) {
            log("Exception has been caught:");
            console.error(ex);
        }
    },

    main: function () {
        var _html =
            '<div id="widget-ioh-main"><div class="ui-bg ui-buttons"><a href="#" class="ui-icon ioh-main"></a></div></div>';
        var _style =
            '.ioh-main { background: rgba(0, 0, 0, 0) url("http://ihcdn3.ioimg.org/iov6live/gui/tabs_pict.png?v=724") no-repeat scroll -32px -242px }' +
            '.ioh-main:hover { background: rgba(0, 0, 0, 0) url("http://ihcdn3.ioimg.org/iov6live/gui/tabs_pict.png?v=724") no-repeat scroll -1px -242px }';

        inject.style(_style);
        $("div#widget-play-mobile").after(_html);
    },

    style: function (css) {
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;
        document.head.appendChild(style);

        log("Style injected successfully.");
    },

    script: function (code) {

        var script = document.createElement('script');
        script.type = "text/javascript";
        script.innerHTML = code;
        document.head.appendChild(script);

        log("Code injected successfully.");
    }
};

function log() {
    if (!console || !console.log || typeof (console.log) != "function") return; // out of luck
    var argumentsArray = Array.from(arguments);
    argumentsArray.unshift(" <" + new Date().toLocaleTimeString() + "> ");
    argumentsArray.unshift("Imperia Online Helper");
    Function.apply.call(console.log, console, argumentsArray);
}

function warn() {
    if (!console || !console.warn || typeof (console.warn) != "function") return; // out of luck
    var argumentsArray = Array.from(arguments);
    argumentsArray.unshift(" <" + new Date().toLocaleTimeString() + "> ");
    argumentsArray.unshift("Imperia Online Helper");
    console.log(argumentsArray);
    Function.apply.call(console.warn, console, argumentsArray);
}

function enWrap(fn) {
    if (!fn || typeof fn != "function") return;

    // log, do not fail silently

    try {
        return fn.apply(this, fn.arguments);
    } catch (ex) {
        log("Exception has been caught:");
        console.error(ex);
    }
}

function addListener(selector, fn) {
    if (!fn || typeof fn != "function") return; // no listener

    if(!$(selector).length) return warn("No element with selector [" + selector + "] was found on page!");
    $('body').on('click', selector, function(e) {

        // log, do not fail silently

        try {
            fn(e);
        } catch (ex) {
            log("Exception has been caught:");
            console.error(ex);
        }

    });
}

// will fire every 5 minutes
/*var textSchedule = later.parse.text('every 1 min');

 // execute logTime for each successive occurrence of the text schedule
 var timer = later.setInterval(logTime, textSchedule);

 // function to execute
 function logTime() {
 var txt = GM_getResourceText("dialog");
 }*/

// --> Handlers
function showMainIOH(e) {
    e.preventDefault();
    unsafeWindow.container.open(inject.object({
        saveName: "ioh",
        title: "Hello you little rebel",
        position: "center, center"
    }));

    var _messagebox = $("#messageboxioh");
    _messagebox.html('');
    var _tabsHtml = GM_getResourceText("tabs");
    _messagebox.append(_tabsHtml);
    var _generalHtml = GM_getResourceText("tab-general");
    _messagebox.append(_generalHtml);

}

function run() {
    inject.main();
    addListener('div.ui-bottom-right.ui div#widget-ioh-main div.ui-bg.ui-buttons a.ui-icon.ioh-main', showMainIOH);
}

(function initialize() {
    var loading = $("div#imperia").hasClass("hide-widget");
    if (!loading) {
        console.clear();

        log("Done!");
        enWrap(run);
    } else {
        log("Loading...");
        setTimeout(initialize, 1000);
    }
})();