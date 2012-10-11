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
 * browser compatibility layer
 */
;(jQuery.ov && jQuery.ov.compat) || (function( $) {
	$.ov = $.ov || {};
	$.ov.compat = {};

	//check, if we can use the native method
	//prevent to use prototype.js keys-method, because its crashes in ie7
	if(Object.keys && Object.keys.toString().indexOf('[native code]') == -1 ) {
		Object.keys=function( obj) {
			var a = [];
			
			if( this) {
					// prototype optimization for arrays
				if( $.isArray( obj)) {
					for( var i=0; i<obj.length; i++) {
						a.push( i);
					}
				} else {
						// Retrieve the names of an object's properties.
                          // Delegates to **ECMAScript 5**'s native `Object.keys`
					var keys = [];
                    for (var key in obj) {
                        if (Object.hasOwnProperty.call(obj, key)) {
                            keys[keys.length] = key;
                        }
                    }
                    return keys;
				}
			}
			
			return a;
		};
	}
})( jQuery);