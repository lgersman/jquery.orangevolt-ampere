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
	entity relation utilities
 */
;(window.ov && window.ov.entity) || (function( $) {
	window.ov = window.ov || {};

	var _ns = $.ov.namespace( 'window.ov.entity');

	function _createGetter( key, value) {
		switch( $.type( value)) {
			case 'function'	:
				return function( item) {
					item = arguments.length ? item : this;
					return value.call( this, item);
				};
			case 'object'	:
				return function( item) {
					item = arguments.length ? item : this;
					var entry = window.ov.entity.find( value.values, $.type( item)=='object' ? item[ value.id || 'id'] : item);
					return entry;
				};
			case 'array'	:
				return function( item) {
					item = arguments.length ? item : this;
					var entry = window.ov.entity.find( value, item[ key]);
					return entry;
				};
			default			:
				return function( item) {
					item = arguments.length ? item : this;
					return item[ key];
				};
		}
	}

	function Projection( options) {
		if( this instanceof Projection) {
			var keys = Object.keys( options || {});
			for( var i=0; i<keys.length; i++) {
				var key = keys[i], value = options[ key];

				this[ 'get' + window.ov.ampere.util.ucwords( key)] = _createGetter( key, value);
			}
			this.options = function() {
				return options;
			};
		} else {
			return new Projection( options);
		}
	}
		/**
		 * creates an projection for lists containing an atomar datatype acting as the key
		 * into another list
		 */
	Projection.atomic = function( atom) {
		return Projection({
			'_' : atom
		});
	};

	Projection.prototype.get = function( item, property) {
		var getterName = 'get' + window.ov.ampere.util.ucwords( property || '_');
		if( $.isFunction( this[ getterName])) {
			return this[ getterName]( item);
		} else {
			return item[ property];
		}
	};
	Projection.prototype.has = function( item, property) {
		var getterName = 'get' + window.ov.ampere.util.ucwords( property);
		return $.isFunction( this[ getterName]);
	};
		/**
		 * searches the array including all (via projection) referenced arrays for matching
		 * properties.
		 *
		 * @param subject string or regexp
		 * @return array if items with a property/projection matching the subject
		 */
	Projection.prototype.match = function match( array, subject) {
		var hits = [];

		if( typeof( subject)=='string') {
			subject = $.trim( subject);
			if( !subject.length) {
				hits.concat( array);
				return hits;
			}
		}

		subject = typeof( subject)=='string'? new RegExp( window.ov.ampere.util.regexp_quote( subject)) : subject;
		$.ov.namespace( 'window.ov.entity.projection::match()').assert(
			$.type( subject)=='regexp',
			'argument expected to be an regexp or string'
		);

		var properties;
		for( var i=0; i<array.length; i++) {
			if( !properties) {
				properties = $.isPlainObject(array[i]) ? Object.keys( array[i]) : '_';
			}

			var item = array[i];

			for( var k=0; k<properties.length; k++) {
				var value = this.get( item, properties[k]);
				switch( $.type( value)) {
					case 'function' :
						break;
					case 'object' :
						var members = Object.keys( value);
						for( var t=0; t<members.length; t++) {
							if( subject.test( value[ members[t]])) {
								hits.push( item);
								break;
							}
						}
						break;
					case 'array' :
						for( var v=0; v<value.length; v++) {
							if( subject.test( value[ v])) {
								hits.push( item);
								break;
							}
						}
						break;
					default :
						if( subject.test( value)) {
							hits.push( item);
							break;
						}
						break;
				}
			}
		}

		return hits;
	};

		/**
		 * @param array all allowed values of param property
		 * @property (optional) property to compare to. if undefined/not given defaults to 'id'
		 * @negate (optional) if true all elements not having property==value are returned
		 *
		 * @return array with all items matching (or all items not matching if negate==true)
		 */
	Projection.prototype.all = function all( array, property, negate) {
		var hits = [];
		property = arguments.length>1 && property || '_';

		var option = this.options()[ property];
		$.ov.namespace( 'window.ov.entity.projection::all()').assert(
			$.isPlainObject( option) && $.isArray( option.values),
			'only mapped array supported right now'
		);

		for( var i=0; i<option.values.length; i++) {
			var value = option.values[i], key = value[ option.id], pos;

			if( (pos=$.inArray( key, array))!=-1) {
				!negate && hits.splice( Math.min( pos, hits.length), 0, value);
			} else if( negate){
				hits.splice( Math.min( i, hits.length), 0, value);
			}
		}

		return hits;
	};

	function Entity( array, projection) {
		if( this instanceof Entity) {
			$.ov.namespace( 'window.ov.entity').assert(
				$.type( array)=='array',
				'first argument expected to be an array'
			);

			this.get = function() {
				return array;
			};

			this.projection = (function() {
				var p = projection instanceof Projection ? projection : window.ov.entity.projection( projection);
				return function( item) {
					if( arguments.length==1) {
						if( arguments[0] instanceof Projection) {
							return arguments[0];
						} else {
							var record = function() {
								$.extend( this, $.isPlainObject( item) ? item : this.get_( item));
								this.get = function() {
									return item;
								};
								return this;
							};
							record.prototype = p;
							return new record();
						}
					} else {
						return p;
					}
				};
			})();

			return this;
		} else {
			return new Entity( array, projection);
		}
	}
	window.ov.entity = Entity;
	window.ov.entity.prototype.find = function find( value, property) {
		return window.ov.entity.find( this.get(), value, property);
	};
	window.ov.entity.prototype.filter = function filter( value, property) {
		return window.ov.entity.filter( this.get(), value, property);
	};
	window.ov.entity.prototype.next = function filter( item) {
		return window.ov.entity.next( this.get(), item);
	};
	window.ov.entity.prototype.prev = function filter( item) {
		return window.ov.entity.prev( this.get(), item);
	};
	window.ov.entity.prototype.first = function first( item) {
		return window.ov.entity.first( this.get());
	};
	window.ov.entity.prototype.last = function last( item) {
		return window.ov.entity.last( this.get());
	};
		/**
		 * example : window.ov.entity( [ 1,3,5,6,7,8]).where( 'this % 2')
		 */
	window.ov.entity.prototype.where = function where( expr) {
		return window.ov.entity.where( this.get(), expr);
	};
		/**
		 * example : window.ov.entity( [ 1,3,5,6,7,8]).select( 'this * 10')
		 */
	window.ov.entity.prototype.select = function select( expr) {
		return window.ov.entity.select( this.get(), expr);
	};
	window.ov.entity.prototype.last = function last( item) {
		return window.ov.entity.last( this.get());
	};
		/**
		 * searches the array including all (via projection) referenced arrays for matching
		 * properties.
		 *
		 * @param subject string or regexp
		 * @return array if items with a property/projection matching the subject
		 */
	window.ov.entity.prototype.match = function match( subject) {
		return this.projection().match( this.get(), subject);
	};

		/**
		 * see Projection.all
		 */
	window.ov.entity.prototype.all = function match( array, property, negate) {
		return this.projection().all.apply( this.projection(), arguments);
	};

	function _filter( value, property) {
		switch( $.type( value)) {
			case 'function' :
				return value;
			case 'object'	:
				var keys = Object.keys( value);
				return function( item, index, _property) {
					for( var i=0; i<keys.length; i++) {
						var key = keys[i];
						if( value[key]!=item[key]) {
							return false;
						}
					}
					return true;
				};
			case 'regexp'   :
				property = property || 'id';
				return function( item, index, _property) {
					var o = item[property];
					if( $.isArray( o)) {
						for( var i=0; i<o.length; i++) {
							if( value.test( o[i])) {
								return true;
							}
						}
					} else {
						return value.test( o);
					}
				};
			default			:
				property = property || 'id';
				return function( item, index, _property) {
					var o = $.isPlainObject( item) ? item[property] : item;
					return $.isArray( o) ? $.inArray( value, o)!=-1 : o===value;
				};
		}
	}

		/**
		 * @param array collection of items
		 * @param value to compare with or comparator function
		 * @param property item-property to look for
		 * @return found item or undefined
		 */
	window.ov.entity.find = function find( /*Array collection*/array, /*value to compare with or comparator function*/value, /*options, fallback is 'id'*/property) {
		var f = _filter( value, property);

		if( !$.isArray( array)) {
			return;
		}

		for( var i=0; i<array.length; i++) {
			var item = array[i];
			if( f.call( array, item, i, property)) {
				return item;
			}
		}
	};

		/**
		 * @param array collection of items
		 * @param value to compare with or comparator function
		 * @param property item-property to look for
		 * @return array of matching items
		 */
	window.ov.entity.filter = function filter( /*Array collection*/array, /*value to compare with or comparator function*/value, /*options, fallback is 'id'*/property) {
		var filtered = [];

		var f = _filter( value, property);
		for( var i=0; i<array.length; i++) {
			var item = array[i];
			if( f.call( array, item, i, property)) {
				filtered.push( item);
			}
		}

		return filtered;
	};

		/**
		 * @param array collection of items
		 * @param item object before next
		 * @return next item or undefined if item is last
		 */
	window.ov.entity.next = function next( array, item) {
		var pos = $.inArray( item, array);
		return pos<array.length-1 ? array[ pos+1] : undefined;
	};

		/**
		 * @param array collection of items
		 * @param item object after before
		 * @return item before or undefined if item is first
		 */
	window.ov.entity.prev = function next( array, item) {
		var pos = $.inArray( item, array);
		return pos>0 ? array[ pos-1] : undefined;
	};

		/**
		 * @return first item of array
		 */
	window.ov.entity.first = function first( array) {
		return array && array.length && array[ 0] || undefined;
	};

		/**
		 * @return last item of array
		 */
	window.ov.entity.last = function last( array) {
		return array && array.length && array[ array.length-1] || undefined;
	};


		/**
		 * return a sorted copy of the array
		 *
		 * @param array
		 * @param property
		 * @returns {array}
		 */
		/*
	window.ov.entity.sort = function sort( array, property) {
		property = arguments.length==2 && arguments[1]!==undefined ? arguments[1] : 'id';
		var sorted = [].concat( array).sort( function( l, r) {
			l = l[property];
			r = r[property];

			if( l!==null && l!==undefined) {
				return l.localeCompare( r);
			} else {
				return l!==r ? 1 : -1;
			}
		});

		return sorted;
	};
		*/

	window.ov.entity.projection = Projection;

		/**
		 * creates a lamda function from a lambda string or js expression.
		 * if the javascript expression doesnt contain a return or ending ; it will be added automagically
		 * 
		 * @param expr_string a javascript expression or 
		 *    ( param1, param2, ...) => javascript expression
		 * 
		 * @return function
		 */
	window.ov.entity.lambda = function lambda( expr_string) {
		var fn = expr_string.match(/\((.*)\)\s*=>\s*(.*)/), params = [], body = expr_string;

			// if parameters are provided 
		if( fn && fn.length) {
				// drop whole string
			fn.shift();
			body = fn.pop();
			params = $.trim( fn.pop().replace(/,/g, ' ')).split( /\s+/);
		}	

			// prepend a return if not already there.
		fn = (! /\s*return\s+/.test( body) && "return " || "") + body + ';';

		params.push( fn);

		try {
			//  unfortunately we cannot catch syntax errors in all browsers ...
			return Function.apply( {}, params ) ;
		} catch( ex) {
			$.ov.namespace( 'window.ov.entity.lambda()').raise( "could not transform lamda expression(='" + expr_string + "') into a function : ", params);
		}
	};

		/**
		 * queries the given array for all elements matching the expr. 
		 * expr is expected to be  lamda function from a lambda string or js expression.
		 * @see window.ov.entity.lambda
		 * 
		 * examples: 
		 *  window.ov.entity.where( [ 1,3,5,6,7,8], 'this % 2')
		 *  window.ov.entity.where( [ 1,3,5,6,7,8], '( item, index, out) => this % 2 && out.length<2')
		 * 
		 * @param array the array to query
		 * @param expr a javascript expression or 
		 *   ( item, index, result_array) => javascript expression
		 * 
		 * @return new array containing all matching elements
		 */
	window.ov.entity.where = function where( array, /*function of lamda'able expression string*/expr /*, var_args*/) {
		expr = $.isFunction( expr) && expr || window.ov.entity.lambda( expr);

			// initialize result array
		var res = [] ;

			// set up parameters for filter function call
		var p = [ 0, 0, res ];

			// append any pass-through parameters to parameter array
		for(var i = arguments.length - 1; i > 1; i--) {
			p.push( arguments[i]);
		}

			// for each array element, pass to filter function
		for( i=0; i<array.length; i++) {
				// param1 = array element             
			p[0] = array[ i];
				// param2 = current indeex
			p[1] = i;
         
				// call filter function. if return true, copy element to results            
			expr.apply( array[i], p) && res.push( array[i]);
		}

		return res;
	};

		/**
		 * maps the items of the given array for all elements by returning array of expr calls.   
		 * expr is expected to be  lamda function from a lambda string or js expression.
		 * @see window.ov.entity.lambda
		 * 
		 * examples: 
		 *  window.ov.entity.select( [ 1,3,5,6,7,8], 'this * 10')
		 *  window.ov.entity.select( [ 1,3,5,6,7,8], '( item, index, out) => item * index')
		 * 
		 * @param array the array to map items from. if not an wrapping array will be created containg the array element
		 * @param expr a javascript expression or 
		 *    ( item, index, result_array) => javascript expression
		 * 
		 * @return new array containing all mapping result elements
		 */
	window.ov.entity.select = function select( array, /*function of lamda'able expression string*/expr /*, var_args*/) {
		expr = $.isFunction( expr) && expr || window.ov.entity.lambda( expr);

			// initialize result array
		var res = [] ;

			// set up parameters for filter function call
		var p = [ 0, 0, res ];

			// append any pass-through parameters to parameter array
		for(var i = arguments.length - 1; i > 1; i--) {
			p.push( arguments[i]);
		}

		array = $.isArray( array) && array || [ array];

			// for each array element, pass to filter function
		for( i=0; i<array.length; i++) {
				// param1 = array element             
			p[0] = array[ i];
				// param2 = current indeex
			p[1] = i;
         
				// call mapping function and store result
			res.push( expr.apply( array[i], p));
		}

		return res;		
	};

	window.ov.entity.sort = function sort( array, sortPredicate, reverseOrder) {
		if( !(array instanceof Array)) {
			return array;
		}

		if( !sortPredicate) {
			return array;
		}

		function identity( p) {
			return p;
		}

		function comparator( o1, o2) {
			for( var i = 0; i < sortPredicate.length; i++) {
				var comp = sortPredicate[i](o1, o2);
				if( comp !== 0) {
					return comp;
				}
			}
			return 0;
		}

		function reverseComparator( comp, descending) {
			return !!descending ? function( a,b) { return comp( b,a); } : comp;
		}

		function compare( v1, v2){
			var t1 = typeof( v1);
			var t2 = typeof( v2);

			if( t1 == t2) {
				if( t1 == "string") {
					v1 = v1.toLowerCase();
				}
				if( t1 == "string") {
					v2 = v2.toLowerCase();
				}
				if( v1 === v2) {
					return 0;
				}
				return v1 < v2 ? -1 : 1;
			} else {
				return t1 < t2 ? -1 : 1;
			}
		}

		sortPredicate = $.isArray( sortPredicate) ? sortPredicate: [sortPredicate];
		sortPredicate = $.map( sortPredicate, function( predicate) {
			var descending = false, get = predicate || identity;
			if( typeof( predicate)=='string') {
				if( (predicate.charAt(0) == '+' || predicate.charAt(0) == '-')) {
					descending = predicate.charAt(0) == '-';
					predicate = predicate.substring(1);
				}
				get = function( item) {
					return item[ predicate];
				};
			}

			return reverseComparator( function( a,b){
				return compare( get( a),get( b));
			}, descending);
		});

		array.sort( reverseComparator( comparator, reverseOrder));

		return [].concat( array);
	};
})( jQuery);