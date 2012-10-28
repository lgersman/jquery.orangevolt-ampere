/*
 * Orangevolt Ampere Framework
 *
 * http://github.com/lgersman
 * http://www.orangevolt.com
 *
 * Copyright 2012, Lars Gersmann <lars.gersmann@gmail.com>
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

;(jQuery.ov && jQuery.ov.entity) || (function( $) {
	$.ov = $.ov || {};

	var _ns = $.ov.namespace( 'window.ov.entity');

	$.ov.entity = function Entity() {

	};

		/**
		 * @param array collection of items
		 * @param value to compare with or comparator function
		 * @param property item-property to look for
		 */
	$.ov.entity.find = function find( /*Array collection*/array, /*value to compare with or comparator function*/value, /*options, fallback is 'id'*/property) {
		property = property!==undefined ? property : 'id';
		for( var i=0; i<array.length; i++) {
			var item = array[i], equal;
			if( equal = $.isFunction( value) ? value.call( array, item, i, property) : item[property]===value) {
				return item;
			}
		}
	};
})( jQuery);