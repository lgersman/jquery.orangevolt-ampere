/* 
 * Copyright (c) 2011 Lars Gersmann (lars.gersmann@gmail.com, http://orangevolt.blogspot.com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 */
/**
 * @author lars gersmann <lars.gersmann@gmail.com>
 */
;(jQuery.orangevolt && jQuery.orangevolt.ampere) || (function($) {
		/*

		 */
	function ampere() {
		if( !(this instanceof ampere)) {
			var instance = new $.orangevolt.ampere();
			
			return instance;
		}
		
		$.extend( this, {
		});
	};
	
	$.orangevolt = $.orangevolt || {};
	$.orangevolt.ampere = $.orangevolt.ampere || ampere;
})( jQuery);