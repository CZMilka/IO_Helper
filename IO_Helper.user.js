// ==UserScript==
// @name        IO_Helper
// @namespace   io_helper
// @include     http://www*.imperiaonline.org/imperia/game_v6/game/village.php*
// @require     https://raw.githubusercontent.com/bunkat/later/master/later.min.js
// @version     1
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_getResourceText
// @grant       unsafeWindow
// ==/UserScript==

// will fire every 5 minutes
var textSchedule = later.parse.text('every 1 min');

// execute logTime for each successive occurrence of the text schedule
var timer = later.setInterval(logTime, textSchedule);

// function to execute
function logTime() {
    console.log("Testing later.js, date:", new Date());
}