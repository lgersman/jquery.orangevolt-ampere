/*
 * Orangevolt Ampere Framework
 *
 * http://github.com/lgersman
 * http://www.orangevolt.com
 *
 * Copyright 2012, Lars Gersmann <lars.gersmann@gmail.com>
 * Dual licensed under the MIT or GPL Version 2 licenses.
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
		 * searches the array including all (via projection) referenced arrays for matching
		 * properties.
		 *
		 * @param property 'string' an angular expression
		 * @return sorted array
		 */
	Projection.prototype.sort = function match( array, property) {
		var sorted = [].concat( array);
			// TODO
		return sorted;
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
		var property = arguments.length>1 && property || '_';

		var option = this.options()[ property];
		$.ov.namespace( 'window.ov.entity.projection::all()').assert(
			$.isPlainObject( option) && $.isArray( option.values),
			'only mapped array supported right now'
		);

		for( var i=0; i<option.values.length; i++) {
			var value = option.values[i], key = value[ option.id];

			if( $.inArray( key, array)!=-1) {
				!negate && hits.push( value);
			} else if( negate){
				hits.push( value);
			};
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
		return array.length && array[ 0] || undefined;
	};

		/**
		 * @return last item of array
		 */
	window.ov.entity.last = function last( array) {
		return array.length && array[ array.length-1] || undefined;
	};

	window.ov.entity.projection = Projection;
})( jQuery);