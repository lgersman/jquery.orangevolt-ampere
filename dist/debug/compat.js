/*!
 * jQuery Orangevolt Ampere
 *
 * version : 0.1.0
 * created : 2012-10-10
 * source  : https://github.com/lgersman/jquery.orangevolt-ampere
 *
 * author  : Lars Gersmann (lars.gersmann@gmail.com)
 * homepage: http://www.orangevolt.com
 *
 * Copyright (c) 2012 Lars Gersmann; Licensed MIT, GPL
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