/**
 * ampere core
 */
;(window.ov && window.ov.ampere) || (function( $) {
	function object_values( arr) {
		var values = [];
		for( key in arr) {
	        values.push( arr[ key]);
	    }
		
		return values;
	}
	
	function Options( defaults) {
		var _ = defaults || {};
		
		return function options() {
			if( arguments.length==2) {
				_[ arguments[0]] = arguments[1];
				return this;
			} else if( arguments.length==1) {
				var arg = arguments[0];
				if( $.isPlainObject( arg)) {
					$.extend( _, arg);
					return this;
				} else {
					return _[ arg];
				}
			}
			return _;
		};
	}
	
	function Transition( state, targetState, transitionName, module) {
		if( !(this instanceof Transition)) {
			return new Transition( state, targetState, transitionName, module);
		}
		
		var transition = this;
		
		this.options = Options();
			// automagically add type:'global' for this transaction if its an module transaction
		!state && this.options( 'ampere.ui.type')==undefined && this.options( 'ampere.ui.type','global'); 
		
		this.state = function () {
			return state;
		};
		
		//this.transitionName = transitionName;
		this.name = function () {
			return transitionName;
		};

		this.fullName = function () {
			return (state || module).fullName() + '.transitions.' + transitionName;
		};
		
		this.target = function () {
			return $.isFunction( targetState) ? targetState.call( this) : targetState;
		};

		this.action = (function() {
			var delegate = $.noop;
			
			return function action() {
				if( arguments.length) {
					$.ov.namespace(	this.fullName() + '.action()').assert( 
						arguments.length==1 && $.isFunction( arguments[0]), 
						'function expected as argument'
					);
					delegate = arguments[0];
					return this;
				} else {
					return delegate;
				}
			};
		})();
		
		this.isEnabled = (function() {
			var delegate = $.noop;
			
			return function isEnabled() {
				if( arguments.length) {
					$.ov.namespace(	this.fullName() + '.isEnabled()').assert( 
						arguments.length==1 && $.isFunction( arguments[0]), 
						'function expected as argument'
					);
					delegate = arguments[0];
					return this;
				} else {
					var enabled = delegate.call( this);
						// return true for undefined, otherwise return enabled as is
					return enabled===undefined || enabled;
				}
			};
		})();
	}
	
	function View( state, viewName, template) {
		if( !(this instanceof View)) {
			return new View( state, viewName, template);
		}
		
		var view = this;
		
		this.options = Options();
		
		this.state = function() {
			return state;
		};
		
		this.name = function() {
			return viewName;
		};
		
		this.fullName = function () {
			return state.fullName() + '.views.' + viewName;
		};
		
		this.template = function() {
			return template;
		};
	}
	
	function State( module, stateName) {
		if( !(this instanceof State)) {
			return new State( module, stateName);
		}
		
		var state = this;
		
		this.options = Options(); 
		
		this.module = function() {
			return module;
		};
		
		this.name = function() {
			return stateName;
		};
		
		this.fullName = function () {
			return module.fullName() + '.states.' + stateName;
		};
		
		this.transitions = {};
		/**
		 * <state>.transition( myState) 
		 * 	registers a new transition targeting myState without any action 
		* <module>.transition( name, myState) 
		 * 	registers a new transition targeting myState with name "name" 
		 */
		this.transition = function() {
			var _ns = $.ov.namespace( this.fullName() + '.transition()')
			.assert( arguments.length, 'no arguments given');
			
			var targetState = arguments[ 0];
			_ns.assert( $.inArray( targetState, object_values( module.states))!=-1, 'argument targetState expected to be a state of same module');
			
			var transitionName = arguments.length>1 ? arguments[ 1] : /*this.name() + '->' + */targetState.name();
			_ns.assert( !this.transitions[ transitionName], 'transition "', transitionName, '" already exists');
			
			this.transitions[ transitionName] = Transition( this, targetState, transitionName);
			return this.transitions[ transitionName];
		};
		
		this.views = {};
		/**
		 * <state>.view( 'foo') 
		 * 	registers a new view foo
		 * <state>.view( function foo() { ...}) 
		 * 	registers function as new view 'foo'
		 * <state>.view( 'foo', function() { ...}) 
		 * 	registers function as new view foo
		 */
		this.view = function() {
			var _ns = $.ov.namespace( this.fullName() + '.view()')
			.assert( arguments.length, 'no arguments given');

			var viewName = arguments.length>1 ? arguments[0] : undefined;
			var template = arguments[ arguments.length>1 ? 1 : 0];
			
			if( !viewName) {
				if( $.isFunction( template)) {
					viewName = template.name;
				} else if( (template||{}).jquery) {
					viewName = template.selector;
				}
			}
			
			_ns.assert( !this.views[ viewName], 'view "' + viewName + '" already exists');
			_ns.assert( template || template==null, 'view "' + viewName + '" : template argument missing');

			return this.views[ viewName] = new View( this, viewName, template);
		};
		this.view.load = function( name , url) {
			return state.view( name || url, $.get( url)); 
		};
	}
	
	function Module( ampere, moduleName) {
		if( !(this instanceof Module)) {
			return new Module( ampere, moduleName);
		}
		
		this.ampere = function() {
			return ampere;
		}; 
		
		this.name = function() {
			return moduleName;
		};
		
		this.fullName = function() {
			return 'ampere.modules.' + moduleName;
		};
		
		this._super = function() {
			var module = this;
			
			this.options = Options();
			
			var current = { state : undefined, view : undefined};
			this.current = function( state, view) {
				if( arguments.length==2) {
					$.ov.namespace( module.fullName() + '.current()').assert(
						$.inArray( state, object_values( module.states))!=-1,
						'argument expected to be state of same module'  
					);
					
					$.ov.namespace( module.fullName() + '.current()').assert(
						!view || $.inArray( view, object_values( state.views))!=-1,
						'argument expected to be view of state "', state.name(),'"'  
					);
					
					current.state = state;
					current.view  = view;
				} else if( !arguments.length) {
					return current;
				} else {
					$.ov.namespace( module.fullName() + '.current()').raise(
						'2 or no arguments expected but ', arguments, ' given'  
					);
				}
			};
			
			this.states = {};
			/**
			 * <module>.state( 'foo') 
			 * 	registers a new state foo
			 * <module>.state( function foo() { ...}) 
			 * 	registers function as new state 'foo'
			 * <module>.state( 'foo', function() { ...}) 
			 * 	registers function as new state foo
			 */
			this.state = function() {
				var _ns = $.ov.namespace( this.fullName() + '.state()').assert( arguments.length, 'no arguments given');
				var args = $.makeArray( arguments);
				var name = args.shift();
				
				var fn   = $.isFunction( name) ? name : args.shift() || $.noop;
				var name = typeof( name)=='string' ? name : name.name;
				_ns.assert( !this.states[ name], 'state "' + name + '" already exists');
				
				function state() {
					if( this instanceof State) {
							/*
							 * make state a deferred
							 */
						var dependencies = []; 
						
						$.isFunction( this.promise) && dependencies.push( this.promise());
						dependencies.push( fn.call( this, this));
						
						this.promise = $.when.apply( $.when, dependencies).promise;
					} else {
						return new state[ name];
					}
				};
				state.prototype = State( this, name);
				this.states[name] = new state();
				
				return this.states[ name];
			};
			
			this.transitions = {};
			/**
			 * <module>.transition( myState) 
			 * 	registers a new transition targeting myState 
			 * <module>.transition( name, myState) 
			 * 	registers a new transition targeting myState with name "name" 
			 */
			this.transition = function() {
				var _ns = $.ov.namespace( this.fullName + '.transition()').assert( arguments.length, 'no arguments given');
	
				var targetState = arguments[ 0];
				_ns.assert( $.isFunction( targetState) || $.inArray( targetState, object_values( module.states))!=-1, 'argument targetState expected to be a state of same module');
				
				var transitionName = arguments.length>1 
					? arguments[ 1] 
					: ($.isFunction( targetState) ? targetState.name || /*this.name() + '->' + */ 'function()' : /* this.name() + '->'+ */ targetState.name());
				_ns.assert( !this.transitions[ transitionName], 'transition "', transitionName, '" already exists');
					
				this.transitions[ transitionName] = Transition( null, targetState, transitionName, this);
				
				return this.transitions[ transitionName];
			};
		};
	};
	
	/**
	 * window.ampere() 
	 *  create new ampere instance
	 */
	function Ampere( options) {
		if( !(this instanceof Ampere)) {
			return new Ampere( options);
		}
		
		var ampere = this;
		this.options = Options( $.extend( {}, Ampere.defaults, options));
		this.modules = {};
		/**
		 * window.ov.ampere( 'foo') 
		 * 	returns module foo
		 * window.ov.ampere( function foo() { ...}) 
		 * 	registers function as new module foo
		 * window.ov.ampere( 'foo', function() { ...}) 
		 * 	registers function as new module foo
		 */
		this.module = function module() {
			var _ns = $.ov.namespace( 'ampere.module()').assert( arguments.length, 'no arguments given');
			
			var args = $.makeArray( arguments);
			var name = args.shift();
			
			if( typeof( name)=='string' && !args.length) {
				_ns.assert( false, 'not enough arguments : ', arguments);
			}

			var fn   = $.isFunction( name) ? name : args.shift();
			var name = typeof( name)=='string' ? name : fn.name;
			_ns.assert( name && name!='', 'module name not given (module constructor function seems also anonymous)');
			_ns.assert( !this.modules[ name], 'module "' + name + '" already exists');
			
			var _defaults = {};
			this.modules[ name] = function( options) {
				if( this instanceof Module) {
					this._super();
					this.options( $.extend( {}, this.ampere().options(), _defaults, options));

					// module function may return a deferred
					var deferred = fn.call( this, this);
					_ns.assert( !$.isEmptyObject( this.states), 'cannot instantiate module without any states');

						/*
						 * prepare a deferred representing the whole module 
						 */
					var dependencies = object_values( this.states);
					dependencies.push( deferred);
					$.isFunction( this.promise) && dependencies.push( this.promise());
					
					var module = this;
					this.promise = $.when.apply( $.when, dependencies)
					.done( function() {
						/*
						 * ensure all states have a view 
						 * otherwise create a default view for the state 
						 */
						for( var name in module.states) {
							var state = module.states[name];
							if( $.isEmptyObject( state.views)) {
								state.view( '', null).options({
									'ampere.ui.caption' : 'default view for state "' + state.name() + '"',
									'ampere.ui.description' : "<em>(This view was generated automatically : state has no view applied.)</em>"
								});
							}
						}
					})
					.fail( function() {
						_ns.error( 'failed to load module "', module.name(), '" : ', arguments);
					});
				} else {
					return new this.modules[ name]();
				}
			};
			this.modules[ name].defaults = function( defaults) {
				_defaults = defaults;
				return ampere.modules[ name];
			};

			this.modules[ name].prototype = Module( ampere, name);
			
			return this.modules[ name];
		};
	};
	Ampere.defaults = {
			/* default state name */
		'ampere.state' 		: 'main',  		
		'ampere.state.view' : '',
		/* 'ui' : controller: foobarUI, */ 
		'ampere.ui.options' : {}
	};
	
	/**
	 * ampere ui prototype.
	 * each renderer must derive from this  
	 */
	Ampere.ui = function Ui() {
		if( !(this instanceof Ui)) {
			return new Ui();
		}
		
		this._super = function( controller, options) {
			this.options = Options( $.extend( {}, Ampere.defaults.ui, options));
			this.controller = controller;
			this._ns = $.ov.namespace( controller.module.fullName() + '::UI');
		};

			/**
			 * init should be overridden by implementations to  
			 *  
			 * * install event handlers
			 */ 
		this.init = function() {};
		
			/**
			 * destroy should be overridden by implementations to  
			 *  
			 * * uninstall event handlers
			 */ 
		this.destroy = function() {};
		
			/**
			 * block user input
			 */
		this.block = function() {};
		
			/**
			 * unblock user input
			 */
		this.unblock = function() {};
		
			/**
			 * filter may be an object (filter by example, like { type : 'global'}) or function argument
			 */
		this.getTransitions = function( filter) {
			var filterFn = filter || $.noop;
			if( !$.isFunction( filterFn)) {
				this._ns.assert( $.isPlainObject( filter), 'argument "filter" expected to be a function or plain object');
				filterFn = function() {
					for( var option in filter) {
						var filterValue = filter[ option];
						var value = this.options( option);
						if( filterValue instanceof RegExp) {
							return filterValue.test( value);
						} else {
							return filterValue===value;
						}
					}
				};
			}
			
			var transitions = [];
			var names = Object.keys( this.controller.module.transitions);
			for( var index in names) {
				var transition = this.controller.module.transitions[ names[index]]; 
				filterFn.call( transition) && transitions.push( transition);
			}
			
			var names = Object.keys( this.controller.module.current().state.transitions);
			for( var index in names) {
				var transition = this.controller.module.current().state.transitions[ names[index]]; 
				filterFn.call( transition) && transitions.push( transition);
			}
			
			return transitions;
		};
		
		this.render = function( event) {
			if( $.isFunction( this['render' + event])) {
				var args = $.makeArray( arguments);
				args.shift();

				this['render' + event].apply( this, args);
			} else {
				$.ov.namespace( 'ampere.ui').debug( 'skip rendering event "' + event + '" for module "' + this.controller.module.fullName() + '" - no matching function "render' + event + '" defined in renderer');
			}
		};
		
		/**
		 * GENERIC INTERNAL FUNCTION  
		 * @returns the generic ui property for an type 
		 */
		this._get = function( property, object, /* (optional)array<string> */ allowedParentTraversalTypes) {
			if( !object) {
				debugger
				return;
			}
			
			var value;
			if( $.isFunction( this.options( property))) {
				value = this.options( property).call( this, object);
			}  
			
			if( value===undefined) {
				if( $.isFunction( object.options)) {
					if( object instanceof Transition) {
						value = object.options( property);
						
						var targetState = object.target();
						if( value===undefined && $.inArray( 'target', allowedParentTraversalTypes)!=-1 && targetState) {
							object = targetState;
						}
					}
					
					if( object instanceof View) {
						value = object.options( property);
						if( value===undefined && $.inArray( 'state', allowedParentTraversalTypes)!=-1) {
							object = object.state();
						}
					}
					
					if( object instanceof State) {
						value = object.options( property);
						
						if( value===undefined && $.inArray( 'module', allowedParentTraversalTypes)!=-1) {
							object = object.module();
						}
					} 

					if( object instanceof Module) {	
						value = object.options( property);
					} 
				} 
			};
			
			return $.isFunction( value) ? value.call( object, object) : value;
		};
		
		this.getCaption = function( object) {
			var caption = this._get( 'ampere.ui.caption', object, ['transition', 'view', 'target', 'state', 'module']);
			if( caption===undefined) {
				if( object instanceof View) {
					caption = window.ov.ampere.util.ucwords( object.name());
				} else if( object instanceof Transition) {
					caption = window.ov.ampere.util.ucwords( object.name());
				} else if( object instanceof State) {
					caption = window.ov.ampere.util.ucwords( object.name());
				} else if( object instanceof Module) {	
					caption = window.ov.ampere.util.ucwords( object.name());
				} else if ( typeof( object)=='string') {
					caption = window.ov.ampere.util.ucwords( object);
				} 
			}
			
			return caption!==undefined ? caption : object;
		};
		
		this.getDescription = function( object) {
			return this._get( 'ampere.ui.description', object, ['transition', 'view', 'target', 'state']);
		};
		
		this.getAbout = function( object) {
			return this._get( 'ampere.ui.about', object);
		};
		
		this.getIcon = function( object) {
			return this._get( 'ampere.ui.icon', object, ['transition', 'view', 'module']);
		};
	}; 
	
	/**
	 * the ampere "engine" implementation
	 */
	function UIController( element, module, options) {
		if( !(this instanceof UIController)) {
			return new UIController( element, module, options);
		}
		
		var controller = this;
		
		var _ns = $.ov.namespace( module.fullName() + '::UIController');
		
		this.options = Options( options);		
		this.module = module;
		this.element = element;
		
			/*
			 * initialize module
			 */ 
		
		this.element.addClass( 'ampere-app');
		
			// (1) state
		var state = this.options( 'ampere.state') || this.module.current().state || module.options( 'ampere.state');
		if( typeof( state)=='string') {
			var _state = module.states[ state];
			_ns.assert( _state instanceof State, 'configured default state "', state, '" not found in ', module.fullName(), '.states');
			
			state = _state;
		} else if( !state) {
			for( var key in module.states) {
				state = module.states[ key];
				break;
			}
		}
		_ns.assert( state instanceof State, 'could not evaluate initial state');
		
			// (2) view
		var view = this.options( 'ampere.view') || this.module.current().view || module.options( 'ampere.view');
		if( typeof( view)=='string') {
			var _view = state.views[ view];
			_ns.assert( _view instanceof View, 'configured default view "', view, '" not found in ', state.fullName() + '.views');
			
			view = _view;
		} else if( !view) {
			for( var key in state.views) {
				view = state.views[ key];
				break;
			}
		}
		_ns.assert( view instanceof View, 'no default view "', view, '" not found in ', state.fullName(), '.views');
		
			// (3) ui
		this.ui = this.options( 'ampere.ui') || module.options( 'ampere.ui');
		_ns.assert( !(this.ui instanceof Ampere.ui), "this.options( 'ui') expected to be a ampere ui constructor function but is an object ", this.ui);
		this.ui = new this.ui( this, $.extend( {}, module.options(), this.options()));
				
		$.when( this.ui.init(), module).done( function() {
			module.current( state, view);
			
			var template = controller.ui.getTemplate( view); 
			template.done( function( data) {
				template = data.jquery ? data.text() : template.responseText || data;
					/* 
					 * TODO : this is a dirty hack to transport the initial template into
					 * the ampere structure of angularjs
					 */ 
				controller._initial_template = template;
				
				controller.ui.render( 'Bootstrap');
			});
		});			
		
			/*
			 * --
			 */
		
		this.proceed = function( transition) {
				// if transistion is enabled und target state defined
			var target; 
			if( transition.isEnabled() && (target=transition.target())) {
				this.ui.block();
				var action = transition.action();
				
				try {
					var result = action.call( transition, transition);
				} catch( ex) {
					result = $.Deferred();
					result.fail( ex);
				}
				
					// render "transaction in progress" overlay
				if( result && $.isFunction( result.promise) && result.promise().state()!='pending') {
					this.ui.render( 'Transition', transition, result);
				}
				
				var self = this; 
				
				$.when( result)
				.done( function() {
					
						// compute target view
					var view = transition.options( 'ampere.state.view') || target.options( 'ampere.state.view');
					if( typeof( view)=='string') {
						var _view = target.views[ view];
						_ns.assert( _view instanceof View, 'target view "', view, '" not found in ', target.fullName(), '.views');
						
						view = _view;
					} else if( !view) {
						for( var key in target.views) {
							view = target.views[ key];
							break;
						}
					}
					_ns.assert( view instanceof View, 'no default view "', view, '" found in ', target.fullName(), '.views');
					
					module.current( target, view);
					
					var template = self.ui.getTemplate( view); 
					template.done( function( data) {
						self.ui.unblock();
						template = data.jquery ? data.text() : template.responseText || data;
						self.ui.render( 'State', view, template);
					});
				})
				.fail( function() {
					console.error( this, arguments);
					alert( arguments);
					self.ui.unblock();
				});
			}
		};
		
		this.destroy = function() {
			this.element.removeClass( 'ampere-app');
			this.ui.destroy();
		};
				
		this.getView = function( transition) {
			/*
			var view = undefined;
			if( transition.options( 'ampere.state.view')) {
				view = transition.options( 'ampere.state.view');
			} else if( transition.target() && transition.target().options( 'ampere.state.view')) {
				
			}
			
			// 
			*/
			var view = this.module.current().state.options( 'ampere.state.view') || this.module.options( 'ampere.state.view');
			
			if( $.isFunction( view)) {
				view = view.call( state);
			}
			
			if( this.module.current().state.views[ view]) {
				return this.module.current().state.views[ view];
			} else {
				var viewNames=Object.keys( this.module.current().state.views);
				if( viewNames.length==1) {
					return this.module.current().state.views[ viewNames[0]];
				} else if( this.module.current().state.views[ '']) {
					return this.module.current().state.views[ ''];
				} else {
					return this.module.current().state.views[ viewNames[0]];
				}
			}
		};
	};

	window.ov = window.ov || {};
	window.ov.ampere = Ampere;
		
	$.fn.ampere = function( module, options) {
		if( arguments.length) {
			var _ns = $.ov.namespace( 'jQuery.fn.ampere()')
			.assert( module instanceof Module, 'argument expected to be a ampere module')
			.assert( this.length==1, 'context expected to reference a single dom element but was ', this.get());
			var controller = UIController( this, module, options);
			return this.data( 'ampere.controller', controller);
		} else {
			return this.data( 'ampere.controller'); 
		}
	};
})( jQuery);