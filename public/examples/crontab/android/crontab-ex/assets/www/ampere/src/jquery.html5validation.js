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
 * jQuery HTML5 validation Plugin v1.0.0
 *
 * This plugin provides access to the HTML5 validation API by exposing the validation API function to jQuery
 *
 * if an form element has css class "html5validation-title" applied it will dynamically
 * set the title attribute to the current validation state of the element
 *
 * Source and examples:
 * http://github.com/lgersman/jquery.orangevolt-ampere
 *
 * Works in all modern browsers supporting HTML5 validation API (i.e. Chome/FF/Webkit etc.)
 *
 * Requires jQuery v1.7.0 or later
 *
 * http://github.com/lgersman
 * http://www.orangevolt.com
 *
 * Copyright 2012, Lars Gersmann <lars.gersmann@gmail.com>
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

/**
 *
 */
;(jQuery && jQuery.fn.upload) || (function( $) {
		/**
		 * reflects the native HTML5 checkValidity Validation DOM API
		 *
		 * this function is fault tolerant which means it returns true if any of the
		 * causes below will happen :
		 *
		 * - the query collection contains multiple elements only the first one will be taken into account.
		 * - the browser does not support the native checkValidity API, true will be returned by default.
		 * - the target element doesnt support the native checkValidity API (i.e. all non form elements)
		 * true will be returned.
		 *
		 * @return true if all of this form element's associated elements that are
		 * subject to constraint validation satisfy their constraints, and false if any do not.
		 */
	$.fn.checkValidity = function() {
		var e = this.length && this[0];
		return e && $.isFunction( e.checkValidity) ? e.checkValidity() : true;
	};

		/**
		 * reflects the native HTML5 validity property of DOM elements
		 *
		 * this function is fault tolerant which means it returns a compatible fallback object if any of the
		 * causes below will happen :
		 *
		 * - the query collection contains multiple elements only the first one will be taken into account.
		 * - the browser does not support the native validity API, true will be returned by default.
		 * - the target element doesnt support the native validity API (i.e. all non form elements)
		 * true will be returned.
		 *
		 * @see https://developer.mozilla.org/en-US/docs/DOM/ValidityState
		 *
		 * @return  ValidityState object representing the validity states that the element is in (i.e., constraint failure or success conditions).
		 *
		 * if the browser does not support the native validity API, a compatible fallback object will be returned.
		 */
	$.fn.validity = function() {
		var e = this.length && this[0];
		return e && e.validity || {
			customError     : '',
			patternMismatch : false,
			rangeOverflow   : false,
			rangeUnderflow  : false,
			stepMismatch	: false,
			tooLong			: false,
			typeMismatch	: false,
			valid			: true,
			valueMissing	: false
		};
	};

		/**
		 *
		 * @return a message describing any constraint failures that pertain to the element or '' as fallback.
		 */
	$.fn.validationMessage = function() {
		var e = this.length && this[0];
		return e && typeof( e.validationMessage)=='string' ? e.validationMessage : '';
	};

		/**
		 * Sets the html5 validation DOM API property validationMessage.
		 * @param validationMessage
		 */
	$.fn.setCustomValidity = function( /*string | fn<string>*/validationMessage, assignTitleAttr) {
		var e = this.length && this[0];
		if( e && $.isFunction( e.setCustomValidity)) {
			e.setCustomValidity('');
			if( e.checkValidity()) {
				if( $.isFunction( validationMessage)) {
					validationMessage = validationMessage.call( e, e);
				}
				validationMessage && e.setCustomValidity( validationMessage);
			}

		}

		return this;
	};

	$( document).on( 'input change', ".html5validation-title", function( e) {
		$( e.target).attr( 'title', e.target.validationMessage);
	});
})( jQuery);