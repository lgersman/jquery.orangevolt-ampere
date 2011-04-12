/* 
 * Copyright (c) 2011 Lars Gersmann (lars.gersmann@gmail.com, http://orangevolt.blogspot.com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 */
((window.$deferRun || function( run ){ run( jQuery); }) (
	function( $, options) {
		$.ampere.state = function state( module, options) {
			this.module  = module;
			this.ensure = $.ampere.util.ensure( module.ensure.namespace + '.state(' + options.name + ')');
			this.log    = $.ampere.util.log( module.ensure.namespace + '.state(' + options.name + ')');
			
			this.options = function( key, _default) {
				switch( arguments.length) {
					case 0  : return options;
					case 1  : return options[ key];
					case 2  : return Object.hasOwnProperty( options, key) ? options[ key] : _default;
					default : return options;
				}
			};
			
			this.transitions = {};
			
			this.transition = function( target, options) {
				this.ensure( (target instanceof $.ampere.state) || (options && options.target), 'no target state defined - argument target or option target expected');
				
				if( $.isFunction( options)) {
					options = $.extend( {}, this.module.options( 'transition'), { action : options});
				} else {
					options = $.extend( {}, this.module.options( 'transition'), options || (options = {}));
				}
				
				if( (options.icon==false || options.icon==this.module.options( 'transition').icon) && target && target.options( 'icon')) {
					options.icon = target.options( 'icon');
				}
	
				var action = options.action;
				if( !((options.action instanceof $.ampere.action) || $.isFunction( options.action))) {
					options.action = typeof( options.action)=='string' ? window[ options.action] : $.noop;
					this.ensure( 
						$.isFunction( options.action), 
						'failed to evaluate transition action : no global function "', action, '" available.' 
					);
				} 
				
				if( !options.name) {
					if( typeof( action)=='string') {
						options.name = action;
					} else if( options.action.name) {
						options.name = options.action.name; 
					} else if( target) {
						options.name = target.options( 'name');
					} else if( options.target){
						options.name = options.target.toLowerCase(); 
					} else {
						this.ensure( false, 'could not resolve name property of transition ', t, ' (', options ,')');
					}
				}
				
				//options.label===false || options.label || (options.label=$.ampere.util.ucwords( options.name));
				if( target && (options.label!==false && !options.label)) {
					var label = target.options( 'label');
					if( label || label===false) {
						options.label = label;
					} else {
						options.label=$.ampere.util.ucwords( options.name);
					}
				}
				
				options.type || (options.type='primary'); 
				
				this.ensure( !this.transitions[ options.name], 'transition named "', options.name + '" already defined state "', this.options( 'label'), '"');
				
				var transition = function() { };
				transition.prototype   			 = new $.ampere.transition( this, target, options);
				transition.prototype.constructor = options.action;
				
				this.transitions[ options.name] = new transition();
				
					// overwrite default transition functions if this is a variable transition 
				if( !target) {
						/**
						 * returns the current target of this variable transition 
						 */
					function getTransition() {
						var transition = this.state[ options.target];
						if( transition instanceof $.ampere.transition) {
							this.ensure( transition.state===this, 'targeted transition ', transition,' not owned by this state');
							
							return transition;
						} else if( transition!=undefined) {
							this.ensure( typeof( transition)=='string', 'variable ' + options.variable + ' expected to be a transition name(string) or instance($.ampere.transition)');
							
							var transition = this.state.transitions[ transition];
							return transition;
						}
					};
					
					this.transitions[ options.name].options = function( key, _default) {
							var transition = getTransition.call( this);
						
							switch( arguments.length) {
							case 0  : return $.extend( transition ? $.extend( {}, transition.options()) : {}, options);
							case 1  : {
								if( key=='name') {
									return transition ? transition.options( key) : options[key];
								}
								return options.hasOwnProperty( key) ? options[key] : transition ? transition.options( key) : undefined;
							}
							case 2  : {
								if( key=='name') {
									return transition ? transition.options( key) : options[key];
								}
								var value = options.hasOwnProperty( key) ? options[key] : transition ? transition.options( key) : undefined;
								return value || _default;
							}
							default : return $.extend( transition ? $.extend( {}, transition.options()) : {}, options);
						}
					};
					
					this.transitions[ options.name].disabled = function() {
						var transition = getTransition.call( this);
						
						if( !transition) {
							return true;
						}
						
						if( !transition.disabled() && $.isFunction( options.disabled)) {
							this.target = transition.target;
							var v = options.disabled.call( this);
							
							return v;
						}
						
						return false;
					};
				}
			
				return this;
			};
			
			this.views = {};
			
			this.view = function( options) {
				options = options || this.options( 'name'); 
				if( typeof( options)=='string' || $.isFunction( options) || options.nodeType || options.jquery) {
					options = { template : options};
				} else {
					options = options || {};
				}
				
				options.name || (options.name = '');
				$.isFunction( options.pre) || (options.pre = $.noop);
				$.isFunction( options.post) || (options.post = $.noop);
	
				this.views[ options.name] = new $.ampere.view( this, options);
				
				return this;
			};
			
			this.getView = function( name) {
				if( this.views[ name]) {
					return this.views[ name]; 
				} else {
					this.ensure( !name || !name.length, 'no view "', name, '" available');
					
					// if no state is explicitly set - take the first one 
					for( name in this.views) {
						return this.views[ name];
					}
				} 
				
					// if we stay here no view is available (yet) -> create a synthetic view 
				this.view( this.options( 'name'));
				return this.getView(); 
			};
				
				/**
				 * declares an action
				 */
			this.action = function( /*function*/ logic) {
				this.ensure( $.isFunction( logic), 'parameter "logic" expected to be a function');
				
				return new $.ampere.action( logic);
			};
			
				/**
				 * returns 
				 */
			this.hasTransitions = function( type) {
				for( var name in this.transitions) {
					var transition = this.transitions[ name];
					if( type===undefined || transition.options('type', 'primary')=='primary') {
						return true;
					}
				}
				
				return false;
			};
		};
	}
));