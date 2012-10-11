/*
 * Orangevolt Ampere Framework
 *
 * http://github.com/lgersman
 * http://www.orangevolt.com
 *
 * Copyright 2012, Lars Gersmann <lars.gersmann@gmail.com>
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
;(window.ov && window.ov.ampere && window.ov.ampere.util) || (function( $) {
	window.ov.ampere.util = {
		ucwords : function ucwords( s) {
			typeof( s)=='string' || (s=''+s);
			return s ? s.replace(
				/^(.)|\s(.)/g,
				function($1) {
					return $1.toUpperCase( );
				}
			) : s;
		},
	
			/**
			 * ie doesnt support function property name
			 *
			 * @return function name
			 */
		functionName : function( /*function*/f) {
			return f.name!==undefined ? f.name : f.toString().match(/^function ([^(]+)/)[1];
		}
	};
})( jQuery);