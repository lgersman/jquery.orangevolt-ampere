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
		$.ampere.action = function action( /*function*/logic) {
			this.logic = logic;
			
			if( this.logic.name) {
				this.name = logic.name;
			}
		};
	}
));