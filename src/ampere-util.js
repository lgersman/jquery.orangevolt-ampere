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

		trueFn : function() {
			return true;
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
		},
			/**
			 * @return regexp reserved characters quoted to be regexp compatible
			 *
			 * @see http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
			 */
		regexp_quote : function( s) {
		    return s.replace(/[\-\/\\\^$*+?.()|\[\]{}]/g, '\\$&');
		},

		getTemplate  : function( o) {
			if( o instanceof HTMLElement) {
				o = $( o);
			}

			var source;
			if( o && o.jquery) {
				$.ov.namespace( 'window.ov.ampere.util.getTemplate()').assert( o.length, 'jQuery collection ' + (o.selector && '"' + o.selector +  '"' || '') + ' is empty');
				if( o[0].tagName=='SCRIPT') {
					source = o.text().replace( "<![CDATA[", "").replace("]]>", "");
						// check if a converter for the given template type is associated
					var converter = window.ov.ampere.util.getTemplate[ o.attr( 'type')];
					if( $.isFunction( converter)) {
						source = converter( source);
					}
				} else {
					source = o.html();
				}
			} else {
				source = o && (o.responseText || o.toString()) || o;
			}

			return $.trim( source);
		},

		angular : {
				/**
				 * returns the jQuery element associated with the scope argument
				 */
			getElement : function( scope) {
				return $( '[ng-scope]').filter( function() {
					return $( this).data( '$scope')===scope;
				});
			}
		},

		parseParams : (function() {
			var re = /([^&=]+)=?([^&]*)/g;
			var decode = function(str) {
			    return decodeURIComponent(str.replace(/\+/g, ' '));
			};
			return function parseParams( query) {
			    var params = {}, e;
			    if( query) {
			        if( query.substr(0, 1) == '?') {
			            query = query.substr(1);
			        }

			        while( e = re.exec(query)) {
			            var k = decode(e[1]);
			            var v = decode(e[2]);
			            if( params[k] !== undefined) {
			                if( !$.isArray(params[k])) {
			                    params[k] = [params[k]];
			                }
			                params[k].push(v);
			            } else {
			                params[k] = v;
			            }
			        }
			    }
			    return params;
			};
		})()
	};
})( jQuery);