/*!
 * Orangevolt Ampere Framework 
 *
 * http://github.com/lgersman
 * http://www.orangevolt.com
 *
 * Copyright 2012, Lars Gersmann <lars.gersmann@gmail.com>
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

/**
 * JSON support layer
 */
;(jQuery.ov && jQuery.ov.json) || (function( $) {

	/**
	 * implement JSON.stringify serialization with configurable second parameter
	 * 
	 * options : 
	 * 
	 * indent (string, default='  ') indent string
	 * linebreak (string, default='\r\n') line break string
	 * alignPropertyNames (boolean, default=true) object property names will be aligned  
	 * optimizePropertyNames (boolean, default=true) object property names will only be wrapped within "" if it's a javascript keyword  
	 */
	var jsReservedWords = [ "abstract", "boolean", "break", "byte", "case", "catch", "char", "class", "const", "continue", "debugger", "default", "delete", "do", "double", "else", "enum", "export", "extends", "false", "final", "finally", "float", "for", "function", "goto", "if", "implements", "import", "in", "instanceof", "int", "interface", "long", "native", "new", "null", "package", "private", "protected", "public", "return", "short", "static", "super", "switch", "synchronized", "this", "throw", "throws", "transient", "true", "try", "typeof", "var", "void", "volatile", "while", "with"];
	var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	var meta = { // table of character substitutions
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    };
	function quote(string) {
		// If the string contains no control characters, no quote characters, and no
		// backslash characters, then we can safely slap some quotes around it.
		// Otherwise we must also replace the offending characters with safe escape
		// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }
	
	function domSymbol( selector) {
	    selector = selector.jquery ? selector : $(selector);

		return selector.length>0
			? selector.map( function() {
				var suffix = this.getAttribute ? this.getAttribute( 'id') || this.getAttribute( 'name') : '';
				return this.tagName + (suffix ? '#' + suffix : '');
			}).get().join( ', ')
			: selector.jquery ? selector.selector : selector.toString();
	}
	
	jQuery.ov.json = {
			stringify : function( obj, options) {
				// if we do run in context of array 
				// -> make it 
			if( !$.isArray( this)) {
				return arguments.callee.call( [], obj, options);
			}
			
			options = options || {};
			options.indent = options.indent || '  ';
			options._currindent = options._currindent || '';
			options._linebreak = options._linebreak || '\r\n';
			options.alignPropertyNames = options.alignPropertyNames===false ? false : true;
			options.optimizePropertyNames = options.optimizePropertyNames===false ? false : true;
			
			var t = typeof (obj);
			if( obj===window) {
				return '<Window>window';
			} else if( obj===window.document) {
				return '<Document>window.document';
			} else if( t=='object' && obj!==null && obj!==undefined && obj.nodeType) {
				return '<HTMLElement>' + domSymbol( obj);
			} else if (t != "object" || obj === null) {
					// simple data type
					if (t == "string") {
						obj = quote( obj);
					}
					
					return String(obj);
			} else {
					// recurse array or object
				var n, v, json = [], arr = $.isArray( obj);

				var properties = Object.keys( obj);
				
				var maxPropertyNameLength = 0;
				if( options.alignPropertyNames) {
					for( var i=0; i<properties.length; i++) {
						maxPropertyNameLength = Math.max( maxPropertyNameLength, properties[i].length);
					}
				}
				
				for( var i=0; i<properties.length; i++) {
					n = properties[i];
					v = obj[n];
					t = typeof(v);

					if( t=='function' && options.skipFunctions) {
						continue;
					}
					if( v===null && options.skipNull) {
						continue;
					}
					if( t=='undefined' && options.skipUndefined) {
						continue;
					}
					
					if (v!==null) {
						if( t!='object' || $.inArray( v, this)==-1) {
							(t!='object') || this.push( v);
							
							var _options = $.extend( { }, options);
							_options._currindent = options._currindent + options.indent;
							
							v = arguments.callee.call(
								this,	
								v, 
								_options
							);
						} else {
							v = '(circular ref ... ' + v + ')';
						}
					}	

					n = options.optimizePropertyNames && $.inArray( n.toString().toLowerCase(), jsReservedWords)==-1 ? n : '"' + n + '"'; 
					
					var spaces = '  ';
					if( options.alignPropertyNames) {
						var count = maxPropertyNameLength-n.length; 
						while( count-->0) {
							spaces = spaces.concat( ' ');
						}
					}
					
					json.push((arr ? "" : n + spaces + ': ') + String(v));
				}
				
				if( properties.length==0) {
					json = "";
				} else {
					json = options._linebreak + options._currindent + options.indent 
					+ json.join( ',' + options._linebreak + options._currindent + options.indent) 
					+ options._linebreak 
					+ (options._currindent.length>0 ? options._currindent.substring( 0, options._currindent.length - 0/*options.indent.length*/) : options._currindent);
				}
				
				return (arr ? "[" : "{") + json + (arr ? "]" : "}");
			}
		}
	};
	
	$.extend( $.ov.json.stringify, {
		COMPACT : {
			indent : '',
			linebreak : '',
			skipFunctions : true,
			alignPropertyNames : false,  
			optimizePropertyNames : true	
		},
		FORMATTED : {
			indent : '  ',
			linebreak : '\r\n',
			skipFunctions : true,
			alignPropertyNames : true,  
			optimizePropertyNames : true
		}
	});
	
	if( !window.JSON) {
		var _options = {
			indent : '',
			linebreak : '',
			skipFunctions : true,
			alignPropertyNames : false,  
			optimizePropertyNames : false	
		};
		
		window.JSON = {
			stringify : function( value , replacer , space) {
				return $.ov.json.stringify( value, _options);
			}
		};
	}
})( jQuery);