/* 
 * Copyright (c) 2011 Lars Gersmann (lars.gersmann@gmail.com, http://orangevolt.blogspot.com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 */
((window.$deferRun || function( run ){ run( jQuery); }) (
	function( $, options) {

		var ensure = (function() {
			var cache = {};
			return function ensure( namespace) {
				if( cache[ namespace]) {
					return cache[ namespace];  
				}
				
				var fn = function( /*condition(, message)* */) {
					if( arguments.length==0) {
						return;
					}
					
					var args = $.makeArray( arguments);
					var condition = args.shift();
					if( !condition) {
						if( arguments.callee && arguments.callee.caller && ''!=arguments.callee.caller.name) {
							args.unshift( arguments.callee.caller.name, '() : ');
						}
						for( var i in args) {
							args[i] = args[i];
						}
						args = args.join( '');
						
						console && console.error( 'ENSURE ' + namespace + ' : ' + args);
						throw new Error( args);
					}
					
					return fn;
				};
				fn.namespace = namespace;
				cache[ namespace] = fn;
				
				return fn;
			};
		})();
		
		var log = (function() {
			var cache = {};
			return function log( namespace) {
				if( !cache[ namespace]) {
					var fn = function( level /*message, (, message)* */) {
						if( !$.ampere.options.debug || !window.console) {
							return;
						}
			
						var args = $.makeArray( arguments);
						args.shift();
						if( !$.isFunction( console[ level])) {
							for( var i in args) {
								args[i] = args[i];
							}
							args = args.join( '');
							
							console && console[ level]( namespace + ' : ' + args);
						} else {
							args.unshift( namespace + ' : ');
							jQuery.browser.mozilla ? console[ level].apply( this, args) : console[ level]( args.join( ''));
						}
						
						return cache[ namespace][level];
					};
					
					function wrap( level) {
						return function() {
							var args = jQuery.makeArray( arguments);
							args.unshift( level);
							return fn.apply( this, args);
						};
					}
					
					fn.namespace = namespace;
					cache[ namespace] = wrap( 'log');
					cache[ namespace].log = wrap( 'log');
					cache[ namespace].info = wrap( 'info');
					cache[ namespace].warn = wrap( 'warn'); 
				}
				
				return cache[ namespace];
			};
		})();
		
			// util
		function isDate( obj) {
			return !!(obj && obj.getTimezoneOffset && obj.setUTCFullYear);
		}
		
		function isNaN( obj) {
			  // Is the given value `NaN`? `NaN` happens to be the only value in JavaScript
			  // that does not equal itself.
			return obj !== obj;
		}
		
		var keys = Object.keys || function(obj) {
				// Retrieve the names of an object's properties.
			  	// Delegates to **ECMAScript 5**'s native `Object.keys`
			var keys = [];
		    for (var key in obj) { 
		    	if (hasOwnProperty.call(obj, key)) {
		    		keys[keys.length] = key;
		    	}
		    }
		    return keys;
		};
		
			// Perform a deep comparison to check if two objects are equal.
			// see https://github.com/documentcloud/underscore/raw/master/underscore.js
		function equals( a, b) {
		    	// Check object identity.
		    if( a===b) return true;
		    	// Different types?
		    var atype = typeof(a), btype = typeof(b);
		   
		    if( atype != btype) return false;
		    	// Basic equality test (watch out for coercions).
		    if( a==b) return true;
		    	// One is falsy and the other truthy.
		    if( (!a && b) || (a && !b)) return false;
		    	// One of them implements an isEqual()?
		    if( a.equals) return a.equals( b);
		    	// Check dates' integer values.
		    if( isDate(a) && isDate(b)) return a.getTime() === b.getTime();
		    	// Both are NaN?
		    if( isNaN(a) && isNaN(b)) return false;
		    	// Compare regular expressions.
		    if( jQuery.type(a)=='regexp'  && jQuery.type(b)=='regexp')
		      return a.source     === b.source &&
		             a.global     === b.global &&
		             a.ignoreCase === b.ignoreCase &&
		             a.multiline  === b.multiline;
		    	// If a is not an object by this point, we can't handle it.
		    if( atype !== 'object') return false;
		    	// Check for different array lengths before comparing contents.
		    if( a.length && (a.length !== b.length)) return false;
		    	// Nothing else worked, deep compare the contents.
		    var aKeys = keys(a), bKeys = keys(b);
		    	// Different object sizes?
		    if( aKeys.length != bKeys.length) return false;
		    	// Recursive comparison of contents.
		    for( var key in a) {
		    	if (!(key in b) || !equals(a[key], b[key])) return false;
		    }
		    return true;
		  };
		
		function ucwords( s) {
			typeof( s)=='string' || (s=''+s);
			return s ? s.replace( 
				/^(.)|\s(.)/g, 
				function($1) { 
					return $1.toUpperCase( ); 
				}
			) : undefined;
		}
		
		function getParam( name, _default) {
			name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	        var regexS = "[\\?&]"+name+"=([^&#]*)";
	        var regex = new RegExp( regexS );
	        var results = regex.exec( window.location.href);
	        if( results == null )
	          return arguments.length==1 ? undefined : _default;
	        else
	          return results[1];
	    }
		
		function getOwnProperties( obj) {
			var properties = {};
			for( var i in obj) { 
				if( Object.hasOwnProperty.call( obj, i) && typeof(i)=='string' && i.charAt(0)!='_') {
					properties[i] = obj[i]; 
				} 
			}		
			return properties;
		}
		
		function getDeferUrl( deferDefName, url) {
			if ( url.indexOf( "://")!==-1 || url.charAt(0)==='/') {
				return url;
			}

			var basePath = '';
			var deferDef = $.defer[ deferDefName];
			if( deferDef) {
				basePath = $.deferSettings.min && deferDef.minUrl ? deferDef.minUrl : deferDef.url;
				basePath = basePath.slice( 0, basePath.lastIndexOf("/") + 1);
			}			
			
			return basePath + url;
		}
		
			// should be removed when deferjs supports loading styles
			// asumes varargs as urls 
		function loadStyles( deferDefName/* (, style url)* */) {
			ensure( 'ampere.util')
			( arguments.length>1, 'more than ', arguments.length, ' argument expected')
			( 'string'==typeof( deferDefName), 'argument deferName expected to be  string');
			
			for( var i=1; i<arguments.length; i++) {
				var style = document.createElement("link");
				style.href = getDeferUrl( deferDefName, arguments[i]);
				style.rel = "stylesheet";
				style.type = "text/css";
				$('head').append( style);

				log( 'ampere.util')( 'loading style "', arguments[i], '"(deferDef:', deferDefName, ') =>', style.href);
			}
		};
		
		function getHashParams( _defaults) {
			var hash = window.location.hash;
			
			if( hash) {
				hash = hash.substring( 1);
				var tokens = hash.split( '$');
				
				var params = {};
				for( var index in tokens) {
					var token = tokens[index];
					if( token.length) {
						var matches = token.match( /([^\-]+)(-(.+))?/);
						if( matches) {
							params[ matches[1]] = matches[3] ? matches[3] : true;  
						}
					}
				}
				return $.extend( {}, _defaults, params);
			}
			
			return $.extend( {}, _defaults);
		}
		
		$.ampere.util = {
			isDate  		: isDate,
			isNaN   		: isNaN,
			keys    		: keys,
			equals  		: equals,
			ucwords 		: ucwords,
			loadStyles		: loadStyles,
			ensure 			: ensure,
			log				: log,
			getDeferUrl 	: getDeferUrl,
			getOwnProperties: getOwnProperties,
			getParam 		: getParam,
			getHashParams	: getHashParams,
			regexp			: {
				not : function( regexp) {
					negotiation = { 
						test : function( s) {
							return !regexp.test( s);
						} 
					};
					
					return negotiation;
				}
			}
		};
	}
));