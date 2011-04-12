/* 
 * Copyright (c) 2011 Lars Gersmann (lars.gersmann@gmail.com, http://orangevolt.blogspot.com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 */
((window.$deferRun || function( run ){ run( jQuery); }) (
	function( $, options) {
		$.ampere.view = function view( state, options) {
			this.state   = state;
	
			this.ensure = $.ampere.util.ensure( state.ensure.namespace + '.View(' + options.name + ')');
			this.log    = $.ampere.util.log   ( state.ensure.namespace + '.View(' + options.name + ')');
			
			this.options = function( key, _default) {
				switch( arguments.length) {
					case 0  : return options;
					case 1  : return options[ key];
					case 2  : return Object.hasOwnProperty( options, key) ? options[ key] : _default;
					default : return options;
				}
			};
			
				// id is called as template tag
				// returns a unique id string for the provided $item
				// if $item.id is undefined and $item.data[name || id] unset 
				// a new id will be generated using the (optional) prefix  
			this.id = (function() {
				var ids = {};
				var id = function( $item, $1, $2) {
					if( $item.id) {
						return $item.id;
					} else if( $item.data && $item.data.id!==undefined && $item.data.id!==null && !$.isFunction( $item.data.id)) {
						return ($item.id=$item.data.id); 
					} else {
						var prefix = $2!==undefined && $2!==null ? $2 : '';
					
						ids[ prefix]!==undefined || (ids[prefix] = 0);
					
						$item.id = prefix + ids[ prefix]++;
						return ($item.id=$item.id);
					}
				};
				id.reset = function() {
					ids = {};
				};
				
				return id;
			})();
			
				/* function is called in template context -> this is a tmplItem */
			this.render = function() {
				var view = this/*.data*/;
					
					// reset uid generator
				view.id.reset();
					// reset "reset" generator
				view.reset.counter = 0;
				
				var result = undefined;
				
				if( typeof( view.options( 'template'))=='string') {
					result = document.getElementById( view.options( 'template'));
					view.ensure( result, 'template with id "', view.options( 'template'), '" doesnt exist in document');
				} else if( $.isFunction( view.options('template'))) {
					result = view.options('template').call( view);
				} else if( view.options( 'template')===undefined) {
					result = $.tmpl( $.ampere.theme.templates.views[ 'default'], view);				
				} else {
					view.ensure( false, 'cannot handle view template ', view.options( 'template'));
				}
				
				view.ensure( result!==undefined, 'failed to render view');
				
				this.reset.data = $.ampere.util.getOwnProperties( this.state);
				
				return $.template( null, result);
			};
			
			this.reset = function() {
				var view = this.module.element.find( '.ampere.view').tmplItem().data;
				for( var i in this) { 
					if( Object.hasOwnProperty.call( this, i) && typeof(i)=='string' && i.charAt(0)!='_') {
						delete( this[i]); 
					} 
				}	
				$.extend( view.state, view.reset.data);
				$.ampere.theme.render( view);
			};
			this.reset.disabled = function() {
				var view = this.module.element.find( '.ampere.view').tmplItem().data;
					// remember : update wil be called also for initial update
				return view.reset.counter++==0;
			};
		};
	}
));