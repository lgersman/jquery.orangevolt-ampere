/* 
 * Copyright (c) 2011 Lars Gersmann (lars.gersmann@gmail.com, http://orangevolt.blogspot.com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 */
((window.$deferRun || function( run ){ run( jQuery); }) (
	function( $, options) {
		$.ampere.transition = function Transition( state, target, options) {
			this.state   = state;
			this.target  = target;
			
			this.ensure = $.ampere.util.ensure( state.ensure.namespace + '.transition(' + options.name + ')');
			this.log    = $.ampere.util.log   ( state.ensure.namespace + '.transition(' + options.name + ')');
			
			options.disabled = $.isFunction( options.disabled) ? options.disabled : (function( disabled) { return function() { return disabled; }; })( options.disabled);  
			
			this.options = function( key, _default) {
				switch( arguments.length) {
					case 0  : return options;
					case 1  : return options[ key];
					case 2  : return options[ key]!==undefined ? options[ key] : _default;
					default : return options;
				}
			};
			
			this.disabled = function() {
				if( this.target && $.isFunction( this.target.disabled)) {
					if( this.target.disabled.call( this.target)) {
						return true;
					}
				}
				
				return this.options( 'disabled').call( this);
			};
		};
	}
));