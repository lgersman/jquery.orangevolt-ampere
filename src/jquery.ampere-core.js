/* 
 * Copyright (c) 2011 Lars Gersmann (lars.gersmann@gmail.com, http://orangevolt.blogspot.com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 */
((window.$deferRun || function( run ){ run( jQuery); }) (
	function( $, options) {
			// core
		
		$.ampere = function( callback) {
			$.when( $.ampere.theme).done( function() {
				callback.call( $.ampere);
			});
		};
		
		$.ampere.DEFAULTS  = {
			debug : false,
			theme : 'default',
			module : {
				history		: true,	
				icon  		: false,
				state 		: 'main',
				transition 	: {
					icon : 'ui-icon-triangle-1-e' // false
				}
			}
		};
		
		$.ampere.modules = {};
		
		$.ampere.options = $.extend( true, {}, $.ampere.DEFAULTS, options);
	}
));