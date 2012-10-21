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
		},

			/**
			 * js pendant to php function strip_tags (http://phpjs.org/functions/strip_tags/s)
			 *
			 * @return the provided string with stripped html tags
			 * @see https://raw.github.com/kvz/phpjs/master/functions/strings/strip_tags.js
			 */
		strip_tags : function( input, allowed) {
			allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
			var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
				commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
			return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
				return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
			});
		}
	};
})( jQuery);