/* 
 * Copyright (c) 2011 Lars Gersmann (lars.gersmann@gmail.com, http://orangevolt.blogspot.com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 */
((window.$deferRun || function( run ){ run( jQuery); }) (
	function( $, options) {
			// action
		
			/**
			 * Action wraps transition logic within an object 
			 * 
			 * @see State#action
			 * @see Module#proceed
			 */
		$.ampere.action = function action( /*function*/logic, /*Object*/options) {
			this.logic 	 = logic;
			
			options || (options={});
			
			if( this.logic.name && !options.name) {
				options.name = logic.name;
			}
			
			options = $.extend( {}, logic, options);
			
			this.options = function( key, _default) {
				switch( arguments.length) {
					case 0  : return options;
					case 1  : return options[ key];
					case 2  : return key in options ? options[ key] : _default;
					default : return options;
				}
			};
		};
	}
));