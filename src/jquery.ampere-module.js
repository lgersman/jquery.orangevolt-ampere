/* 
 * Copyright (c) 2011 Lars Gersmann (lars.gersmann@gmail.com, http://orangevolt.blogspot.com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 */
((window.$deferRun || function( run ){ run( jQuery); }) (
	function( $, options) {
			// real ampere module constructor
		function init_ampere_module_instance( element) {
			var namespace_suffix = element.id ? '#' + element.id : '<' + element.tagName + '>';
			
			this.log    = $.ampere.util.log( this.ensure.namespace + namespace_suffix);
			this.ensure = $.ampere.util.ensure( this.ensure.namespace + namespace_suffix);
			this.element = element.jquery ? element : $( element);
			this.element.addClass( 'ampere module');
			this.element.data( 'ampere_module', this);

			if( element.tagName=='BODY') {
				$(window.document.documentElement).addClass('ampere').addClass( 'fullscreen');
			}
			
				// create history 
			this.history = this.options( 'history')===undefined || this.options( 'history')==true ? $.ampere.history({
				callback : $.proxy( function( command, action, result, flash) {
					if( command=='undo' || command=='redo') {
						var view = this.getState().getView();
						$.ampere.theme.render( view, /*layout*/undefined, flash);
					}
				}, this)
			}) : false;
				// --
			
			var _state = undefined;
			this.getState = function() {
				return _state;
			};
	
			this.setState = function( state, view, layout, flash) {
				this.ensure( state instanceof $.ampere.state, 'argument state of type state expected');
				this.ensure( state.module===this, state.ensure.namespace, ' is not part of module ', this.ensure.namespace);
				
					// check for first enabled automatic transition : 
					// execute and exit if found
				for( var transition in state.transitions) {
					transition = state.transitions[transition];
					if( transition.options( 'type')=='auto' && !transition.disabled()) {
						this.proceed( transition);
						return this; 
					}
				}
					// --
				
				_state = state;
				
				if( view!==false) {
						// otherwise proceed setting given state as current one				
					view = (view instanceof $.ampere.view) ? view : state.getView( view);
					
					$.ampere.theme.render( view, layout, flash);					
				}
			};
			
			this.flash = function( message, options) {
				var tmplItem = view.state.module.element.find( '.state:first').tmplItem();
				$.ampere.theme.flash( tmplItem.data, message, options);

				if( options && options.error) {
					this.block();
				} 
				
				return this;
			};
			
			this.block = function() {
				var tmplItem = view.state.module.element.find( '.state:first').tmplItem();
				$.ampere.theme.block( tmplItem.data);
				
				return this;
			};
			
			this.unblock = function() {
				var tmplItem = view.state.module.element.find( '.state:first').tmplItem();
				$.ampere.theme.unblock( tmplItem.data);
				
				return this;
			};
			
			this.proceed = function( transition) {
				this.ensure( transition instanceof $.ampere.transition, 'argument transition of type Transition expected');
				this.ensure( transition.state.module===this, transition.log.namespace, ' is not part of module ', this.log.namespace);
				
					// set $transition only if its not already set
					// * to the transition instance
					// * to the transition instance name
				
				if( !transition.options('target') 
					|| (transition.state[ transition.options('target')]!=transition.state.$transition && transition.state[ transition.options('target')].options('name')!==transition.state.$transition.options('name'))) {
					transition.state.$transition = transition.options( 'name');
				}
				var target = transition.target;
					
					// switch on user input blocking
				this.block();
				
				var actionOption = transition.options('action');
				if( actionOption instanceof $.ampere.action) {
					actionOption = actionOption.logic.call( transition);
					actionOption = $.isFunction( actionOption) ? actionOption : $.noop; 
				}
				
				var promise = function( obj) {
					return (obj && $.isFunction( obj.promise) ? obj : $.when());
				};
				
				var reject = function( delegate) {
					return function() {
						args = $.makeArray( arguments).join( '');
						module.flash( args, { error : true});

						delegate && delegate.reject.apply( delegate, arguments);
					};
				};
				
				var module = this;
				promise( actionOption).then( function() {
					if( !module.history || transition.options( 'type')=='auto') {
							// reset history in case an auto transition was executed
						!module.history || module.history.reset();
						var result = actionOption.call( transition);
						$.when( result).then( function() {
							var flash = {};
							if( arguments.length && !$.isFunction( this.xhr)) {
								flash.message = arguments[0];
								flash.options = arguments.length==2 ? arguments[1] : undefined; 
							}
							module.setState( target, true, undefined, flash);
						}, reject());
						
						return result;
					}
					
					var action;
					var undoProperties = $.ampere.util.getOwnProperties( transition.state), properties;
					action = function( deferred) {
						module.block();
						transition.log( 'proceed to state ', target.ensure.namespace);
						
						if( properties) {
							$.extend( transition.state, properties);
						}
						var undoAction = actionOption.call( transition);
						
						promise( undoAction).then( function() {
							if( !properties) {
								properties = $.ampere.util.getOwnProperties( transition.state);
							}
							
							module.setState( target, false);
							
							if( transition.options('action')===$.noop) {
								undoAction = $.noop;
							}
							
							deferred.resolve.apply( deferred, arguments.length && !$.isFunction( this.xhr) ? [$.makeArray( arguments).join( '')] : undefined);
						}, reject( deferred));
						
						if( $.isFunction( undoAction)) {
							return function( deferred) {
								module.block();
								$.extend( transition.state, undoProperties);
								
								promise( undoAction.call( transition)).then( function() {
									module.setState( transition.state, false);
									
									deferred.resolve.apply( deferred, arguments.length && !$.isFunction( this.xhr) ? [$.makeArray( arguments).join( '')] : undefined);
								}, reject( deferred));
								
								return action;
							};
						} else {
							module.history.reset();
							//transition.state.module.ensure( !undoAction, 'dont know how to handle undo return value of transition ', transition.log.namespace);
						}							
					};
					
					module.history.redo( action);
				}, reject());
			};
			
			
			this.openModule = function( url, options) {
				this.ensure( typeof( url)=='string', 'argument url expected to be a string');
				
				url = url + '#'
				
				options || (options={ mode : 'dialog', 'resizable':true});
				switch( options.mode) {
					case 'dialog' : {
						url += 'm-d$'
							
						if( options.resizable)	
							url += 'r$'
							
						break;
					}
					case 'fullscreen' : {
						break;
					}
					default 	  : {
						this.ensure( false, 'openModule() : option "mode" expected to be "dialog"(default) or "fullscreen"');
					} 
				}
				
				var iframe = $('<iframe class=".ui-helper-hidden-accessible ampere module" src="' + url + '"></iframe>');
				iframe.appendTo( 'body');
				
				return {
					show : function() {
						iframe.removeClass( 'ui-helper-hidden-accessible');
					},
					hide : function() {
						iframe.addClass( 'ui-helper-hidden-accessible');
					}
				};
			}

			
			// set initial state
			var state = this.options( 'state');
			var view  = '';
			if( typeof( state)=='string') {
				var matches = state.match( /([^:]*)(:([^:]+))?/);
				state = matches[1];
				view  = matches[3];
			} else if( state) {
				state = state.state;
				view  = state.view; 
			} else {
					// if no state is explicitly set - take the first one 
				for( state in this.states) {
					break;
				}
			}

			this.ensure( this.states[ state], 'could not set initial state "', state, '" - state not found');
			state = this.states[ state];
			
			view = state.getView( view);
			state.ensure( view instanceof $.ampere.view, 'could not set initial state\'s view "', view, '". no view with this name known.');
			
			this.setState( state, view);
		};
		
		$.ampere.module = function module( /*function (=register app) || name (=instantiate app)*/ constructor, /*object*/options) {
			if( this instanceof $.ampere.module) {
				this.log    = $.ampere.util.log( $.ampere.ensure.namespace + '(' + constructor + ')');
				this.ensure = $.ampere.util.ensure( $.ampere.ensure.namespace + '(' + constructor + ')');

				//this.ensure( options.name===undefined, 'option "name" cannot be redefined when instantiating a module');				
				this._options = $.extend( {}, $.ampere.modules[ constructor].defaults, options);
				typeof( this._options.label)=='string' || this._options.label===false || (this._options.label=$.ampere.util.ucwords( this._options.name));
				this.options = function( key, _default) {
					switch( arguments.length) {
						case 0  : return this._options;
						case 1  : return this._options[ key];
						case 2  : return Object.hasOwnProperty( this._options, key) ? this._options[ key] : _default;
						default : return this._options;
					}
				};
				
				this.states = {};
				this.state = function( fn, options) {
					this.ensure( $.isFunction( fn), 'argument fn expected to be a function');
					
					options || (options = {});
					options.name  || (options.name=fn.name) || (options.name=(options.label ? options.label.toLowerCase() : undefined));
					this.ensure( options.name && options.name.length, 'argument fn expected to be a named function (function foo() { ... }) or option name/label must be given');
					typeof( options.label)=='string' || options.label===false || (options.label=$.ampere.util.ucwords( options.name));  
					
					this.ensure( !this.states[ options.name], 'state named "', options.name + '" already defined module "', this.options( 'label'), '"');
					
					options.disabled = $.isFunction( options.disabled) ? options.disabled : (function( disabled) { return function() { return disabled; }; })( options.disabled); 
					
					var state = function() {
						this.constructor();				
					};
					state.prototype   			 = new $.ampere.state( this, options);
					state.prototype.constructor = fn;
					
					this.states[ options.name] = new state();
					
					return this;
				};
				
				var deferreds = [ $.ampere.modules[ constructor]];
				if( options.resources) {
					var styles = $.makeArray( options.resources.styles);
					for( var i=0; i<styles.length; i++) {
						$.ampere.util.loadStyles( '', styles[i]);
					}
					var scripts = $.makeArray( options.resources.scripts);
					for( var i=0; i<scripts.length; i++) {
						if( $.isFunction( scripts[i])) {
							this.log( 'load script function', scripts[i].name);
							var result = scripts[i].call( $.ampere.modules[ constructor]);
							if( result!==undefined) {
								deferreds.push( result);
							} 
						} else {
							this.log( 'load script ', JSON.stringify( scripts[i]));
							deferreds.push( 
								$.defer.call( this, typeof( scripts[i])=='string' ? scripts[i] : scripts[i].url, scripts[i])
							);
						}
					}
					
					var templates = $.makeArray( options.resources.templates);
					for( var i=0; i<templates.length; i++) {
						if( $.isFunction( templates[i])) {
							this.log( 'load template function', templates[i].name);
							var result = templates[i].call( $.ampere.modules[ constructor]);
							if( result!==undefined) {
								deferreds.push( result);
							} 
						} else {
							this.log( 'load template ', templates[i]);
							var deferred = $.ajax({
								url 	 : templates[i],
								dataType : 'html',
								cache 	 : !$.ampere.options.debug,
								success  : function( data, textStatus, XMLHttpRequest) {
									var e = $( data);
									this.ensure( e.length, 'could not transform data to html : ', data);
									e.appendTo( 'head');
								}
							});
							deferreds.push( deferred);
						}
					}
				}
				var deferred = $.when.apply( this, deferreds);
				
				this.promise = function() { 
					return deferred.promise();
				};
				return this;
			} else {
				$.ampere.ensure( $.isFunction( constructor), 'argument constructor expected to be a function');

				options = $.extend( true, {}, $.ampere.options.module, options || {});
				if( !options.name) {
					options.name=constructor.name || (options.label ? options.label.toLowerCase() : false);
				}
				$.ampere.ensure( options.name && options.name.length, 'argument constructor expected to be a named function (function foo() { ... }) or option name/label must be given');
				$.ampere.ensure( !$.ampere.modules[ options.name], 'module named "', options.name + '" already defined');
				
				$.ampere.modules[ constructor.name] = constructor;
				$.ampere.modules[ constructor.name].defaults = options;
				$.ampere.modules[ constructor.name].getDeferUrl = function( resource) {
					return $.ampere.util.getDeferUrl( options.name, resource);
				};
				$.ampere.modules[ constructor.name].deferreds = [];

				if( options.resources) {
					var styles = $.makeArray( options.resources.styles);
					for( var i=0; i<styles.length; i++) {
						$.ampere.util.loadStyles( '', styles[i]);
					}
					
					var scripts = $.makeArray( options.resources.scripts);
					var log = $.ampere.util.log( $.ampere.ensure.namespace + '(' + options.name + ')');
					var ensure = $.ampere.util.ensure( $.ampere.ensure.namespace + '(' + options.name + ')');
					for( var i=0; i<scripts.length; i++) {
						if( $.isFunction( scripts[i])) {
							log( 'load script function', scripts[i].name);
							var result = scripts[i].call( $.ampere.modules[ constructor.name]);
							if( result!==undefined) {
								$.ampere.modules[ constructor.name].deferreds.push( result);
							} 
						} else {
							log( 'load script ', JSON.stringify( scripts[i]));
							$.ampere.modules[ constructor.name].deferreds.push( 
								$.defer.call( this, typeof( scripts[i])=='string' ? scripts[i] : scripts[i].url, scripts[i])
							);
						}
					}
					
					var templates = $.makeArray( options.resources.templates);
					var ensure = $.ampere.util.ensure( $.ampere.ensure.namespace + '(' + options.name + ')');
					for( var i=0; i<templates.length; i++) {
						if( $.isFunction( templates[i])) {
							log( 'load template function', templates[i].name);
							var result = templates[i].call( $.ampere.modules[ constructor.name]);
							if( result!==undefined) {
								$.ampere.modules[ constructor.name].deferreds.push( result);
							} 
						} else {
							log( 'load template ', templates[i]);
							var deferred = $.ajax({
								url 	 : templates[i],
								dataType : 'html',
								cache 	 : !$.ampere.options.debug,
								success  : function( data, textStatus, XMLHttpRequest) {
									var e = $( data);
									ensure( e.length, 'could not transform data to html : ', data);
									e.appendTo( 'head');
								}
							});
							$.ampere.modules[ constructor.name].deferreds.push( deferred);
						}
					}
					
					var deferred = $.when.apply( this, $.ampere.modules[ constructor.name].deferreds);
					$.ampere.modules[ constructor.name].promise = function() { 
						return deferred.promise();
					};
					return $.ampere.modules[ constructor.name];
				}
			}
		};
		
		$.ampere.module.state = function() {
			console.log( '$.ampere.module.state called');
			this.states = true;
		};
		
		$.fn.module = function( name, options) {
			if( arguments.length) {
				$.ampere.ensure( $.ampere.modules[ name], 'no ampere model named "', name , '" available');
	
				//options = $.extend( {}, $.ampere.modules[ name].defaults, options || {});
				
				var prototype =	new $.ampere.module( name, options || {});
				this.each( function() {
					$.data( this, 'ampere_module', prototype);
				});
	
				var self = this;
				$.when( prototype)
				.done( function() {
					$.ampere.modules[ name].prototype = prototype;
					
					self.each( function() {
						var instance = new $.ampere.modules[ name]();
						init_ampere_module_instance.call( instance, this); 
					});				
				})
				.fail( function() {
					var args = $.makeArray( arguments);
					//args.shift();
					args.unshift( false, 'failed to initialize module "', name, '" : ');
					$.ampere.ensure.apply( $.ampere.ensure, args);
				});
			} else {
				$.ampere.ensure( this.length==1, 'single dom element expected');
				var instance = this.closest( '.ampere.module').data( 'ampere_module');
				$.ampere.ensure( instance, 'no module attached to dom element/parents');
				
				return instance;
			}
		};
	}
));