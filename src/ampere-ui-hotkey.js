/*
 * Orangevolt Ampere Framework
 *
 * http://github.com/lgersman
 * http://www.orangevolt.com
 *
 * Copyright 2012, Lars Gersmann <lars.gersmann@gmail.com>
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

/**
 * Hotkey support for Twitter Bootstrap / AngularJS Renderer
 */
;(window.ov && window.ov.ampere && window.ov.ampere.ui.hotkey) || (function( $) {
	var _ns = $.ov.namespace( 'window.ov.ampere.ui.twitterbootstrap');

	var specialKeys = {
		8: "backspace", 9: "tab", 13: "return", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause",
		20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
		37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del",
		96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7",
		104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111 : "/",
		112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8",
		120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll", 188: ",", 190: ".",
		191: "/", 224: "meta"
	};

	var shiftNums = {
		"`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&",
		"8": "*", "9": "(", "0": ")", "-": "_", "=": "+", ";": ": ", "'": "\"", ",": "<",
		".": ">",  "/": "?",  "\\": "|"
	};

	function computeMatchingHotkeys( event) {
		// Keypress represents characters, not special keys
		var special = event.type !== "keypress" && specialKeys[ event.which ],
			character = String.fromCharCode( event.which ).toLowerCase(),
			key,
			modif = '',
			possible = [];

		// check combinations (alt|ctrl|shift+anything)
		if ( event.altKey && special !== "alt" ) {
			modif += "alt_";
		}

		if ( event.ctrlKey && special !== "ctrl" ) {
			modif += "ctrl_";
		}

		// TODO: Need to make sure this works consistently across platforms
		if ( event.metaKey && !event.ctrlKey && special !== "meta" ) {
			modif += "meta_";
		}

		if ( event.shiftKey && special !== "shift" ) {
			modif += "shift_";
		}

		if ( special ) {
			possible.push( modif + special);

		} else {
			possible.push( modif + character);
			possible.push( modif + shiftNums[ character ]);

			// "$" can be triggered as "Shift+4" or "Shift+$" or just "$"
			if ( modif === "shift_" ) {
				possible.push( shiftNums[ character ]);
			}
		}

		return possible;
	}

	window.ov.ampere.ui.hotkey = {
		computeMatchingHotkeys : computeMatchingHotkeys
	};
})( jQuery);