// ==UserScript==
// @name        IO_Helper
// @namespace   io_helper
// @description Imperia Online game helper.
// @include     http://www*.imperiaonline.org/imperia/game_v6/game/village.php*
// @require     http://code.jquery.com/jquery-2.1.3.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/later/1.2.0/later.min.js
// @require     https://greasyfork.org/scripts/5392-waitforkeyelements/code/WaitForKeyElements.js
// @require     https://greasyfork.org/scripts/5279-greasemonkey-supervalues/code/GreaseMonkey_SuperValues.js
// @resource 	ioh-html https://raw.githubusercontent.com/panayot-zhi/IO_Helper/master/ioh-main.html
// @resource 	ioh-style https://raw.githubusercontent.com/panayot-zhi/IO_Helper/master/ioh-style.css
// @version     1.9
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
var GM_SuperValue = GM_SuperValue || console.error("Imperia Online Helper: This script requires access to the GM_SuperValue extension function.");
var GM_xmlhttpRequest = GM_xmlhttpRequest || console.error("Imperia Online Helper: This script requires access to the GM_xmlhttpRequest.");
var GM_getResourceText = GM_getResourceText || console.error("Imperia Online Helper: This script requires access to the GM_getResourceText function.", "Greasemonkey");
var GM_registerMenuCommand = GM_registerMenuCommand || console.error("Imperia Online Helper: This script requires access to the GM_registerMenuCommand function.", "Greasemonkey");

// TODO: Extract variables from localStorage here
var debugMode = false;

var DB = {
    get vassals() {
        var vassals = GM_SuperValue.get("vassals", []);
        $('#widget-navigation #fast-provinces .ui-location.ui-vassals').each(function (i, item) {
            var regExp = /\{provinceId:\d+}/;
            var extractedStrings = regExp.exec(item.href);
            if (extractedStrings.length > 1) throw "More than one province ID's found with regular expression!";
            var provinceId = eval(extractedStrings[0]);
            if (vassals.indexOf(provinceId) < 0) {
                vassals.push(provinceId);
                log("A new vassal was recorded.")
            }
        });

        GM_SuperValue.set("vassals", vassals);
        return vassals;
    }
};

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

    allStyles: function() {
        var _styles = GM_getResourceText('ioh-style');
        inject.style(_styles);
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
        position: "center;top"
    }));

    var _messageBox = $("#messageboxioh");
    var _iohMain = GM_getResourceText("ioh-html");
    _messageBox.html(_iohMain);

    unsafeWindow.container.position('ioh', inject.object({
        my: 'center top',
        at: 'center top+80',
        of: '.ui-top-center.ui'
    }));

}

function showTabMenu(e){
    e.preventDefault();
    $("ul#ioh-tabs li").removeClass('active');
    var target = $(e.currentTarget);
    var tab = target.attr('id');
    target.addClass("active");

    $("#ioh-content").find("div.content").hide();
    var tabContent = $('#' + tab + '-content.content');
    if(!tabContent.length) warn('No content for the target tab was found!');
    tabContent.show();
}

function run() {

    /*
    * Inject button
    * at the bottom
    * right menu
    * */
    inject.main();
    inject.allStyles();

    // will fire every 5 minutes
    var textSchedule = later.parse.text('every 1 min');

     // execute logTime for each successive occurrence of the text schedule
     var timer = later.setInterval(collectFromVassals, textSchedule);

     // function to execute
     function collectFromVassals() {
         //unsafeWindow.xajax_doCollectVassalGold(false, {provinceId: 8751, allVassal: true})
     }

    /*
    * Add event handlers this way, so they can be wrapped in error handling functions
    * */
    addListener('div#messageboxioh.window-content ul.window-tabs li.ui-ib.ioh', showTabMenu);
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


function container_open(e) {
    var t;
    t = void 0 == e.saveName ? "generalContainer" : e.saveName;
    var i;
    i = void 0 == e.position ? "center;center" : e.position;
    var n;
    n = void 0 !== e.title ? unescape(e.title) : void 0;
    var s;
    s = "function" != typeof e.cancel ? function () {
    } : e.cancel;
    var a = !1;
    return void 0 !== e.keepContent && (a = e.keepContent), e.modal = !!e.modal, e.backdrop = !!e.backdrop, t == container.modalID || t == container.modalIDwo80 || e.modal ? $("#overlay, #overlayContent, #overlayContentTopmost").show() : e.backdrop && $("#backdrop").fadeIn(), $("#" + t).length > 0 ? (container.opened[t] = "object" != typeof i && "modal" != t && $("#" + t).isOnScreen() && "block" == $("#" + t).css("display") || 0 == container[t].flow ? {
        position: parseInt($("#" + t).css("left")) + ";" + parseInt($("#" + t).css("top")),
        cancel: s,
        load: e.load,
        keepContent: a
    } : {
        position: i,
        cancel: s,
        load: e.load,
        keepContent: a
    }, container.position(t, container.opened[t].position), container.opened[t].flow = !0, container.opened[t].modal = e.modal, container.opened[t].backdrop = e.backdrop, container.opened[t].saveName = t, $("#" + t).show(), container.makeActive(t), void 0 == n ? $("#" + t + " .title").hide() : ($("#" + t + " .title").show(), $("#" + t + " ." + container.titleClass).html(n))) : (drag = void 0 == e.noDrag ? 0 : 1, container.construct(t, i, n, drag), container.opened[t] = {
        position: i,
        cancel: s,
        load: e.load,
        keepContent: a
    }), container.opened[t].flow = !1, container.opened[t].modal = e.modal, container.opened[t].backdrop = e.backdrop, container.opened[t].saveName = t, $(document).trigger("containerOpened", {saveName: t}), e.modal && $("#" + t).addClass("modal"), t
}

function container_position(e, t) {
    if (void 0 === e) {
        var i = "." + container.wrapperClass + ".active";
        e = $(i).attr("id")
    } else var i = "#" + e;
    if ("undefined" == typeof t && (t = container.opened[e].position), "object" == typeof t)return void $("#" + e).position(t);
    var n = windowSize.zoomFactor;
    switch (-1 != windowSize.exceptions.indexOf(e) && (n = 1), positionPart = t.split(";"), positionBodyWidth = $("body").width(), positionElemWidth = $(i).width() * n, positionBodyHeight = $("body").height(), positionElemHeight = $(i).height() * n, positionPart[0]) {
        case"left":
            positionL = 0;
            break;
        case"right":
            positionL = positionBodyWidth - positionElemWidth;
            break;
        case"center":
            positionL = Math.ceil(positionBodyWidth / 2 - positionElemWidth / 2);
            break;
        default:
            positionL = positionPart[0]
    }
    switch (positionPart[1]) {
        case"top":
            positionT = 0;
            break;
        case"bottom":
            positionT = positionBodyHeight - positionElemHeight;
            break;
        case"center":
            positionT = Math.ceil(positionBodyHeight / 2 - positionElemHeight / 2);
            break;
        default:
            positionT = positionPart[1]
    }
    70 > positionT && (positionT = 70);
    var s;
    s = isNaN(parseInt(t)) ? parseInt($(document).scrollTop()) : 0, $(i).css({
        left: parseInt(positionL),
        top: parseInt(positionT) + s
    })
}

function xajax_request() {
    var e = arguments.length;
    if (0 == e)return !1;
    var t = {};
    e > 1 && (t = arguments[1]), t.functionName = arguments[0];
    var i = xajax;
    for (i.initializeRequest(t), i.processParameters(t); 0 < t.requestRetry;)try {
        return --t.requestRetry, i.prepareRequest(t), i.submitRequest(t)
    } catch (n) {
        if (xajax.callback.execute([xajax.callback.global, t.callback], "onFailure", t), 0 == t.requestRetry)throw n
    }
}

function xajax_submitRequest(e) {
    e.status.onRequest(), $(window).trigger("xajax.request", e.parameters);
    var t = xajax.callback, i = t.global, n = e.callback;
    return t.execute([i, n], "onResponseDelay", e), t.execute([i, n], "onExpiration", e), t.execute([
        i,
        n
    ], "onRequest", e), e.open(), e.applyRequestHeaders(), e.cursor.onWaiting(), e.status.onWaiting(), xajax._internalSend(e), e.finishRequest()
}

