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