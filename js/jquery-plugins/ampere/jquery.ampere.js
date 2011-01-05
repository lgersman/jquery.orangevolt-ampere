/* 
 * Copyright (c) 2011 Lars Gersmann (lars.gersmann@gmail.com, http://orangevolt.blogspot.com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 */

(function($) {
	function ucwords( s) {
		return s.replace( 
			/^(.)|\s(.)/g, 
			function($1) { 
				return $1.toUpperCase( ); 
			}
		);
	}
	
	function Ensure( namespace) {
		var fn = function( /*condition(, message)* */) {
			if( arguments.length==0) {
				return;
			}
			
			var args = $.makeArray( arguments);
			var condition = args.shift();
			if( !condition) {
				for( var i in args) {
					args[i] = args[i];
				}
				args = args.join( '');
				
				console && console.error( 'ENSURE ' + namespace + ' : ' + args);
				throw new Error( args);
			}
		};
		fn.namespace = namespace;
		
		return fn;
	}
	
	function Log( namespace) {
		var fn = function( /*message, (, message)* */) {
			if( !$.ampere.options.debug) {
				return;
			}
			
			var args = $.makeArray( arguments);
			for( var i in args) {
				args[i] = args[i];
			}
			args = args.join( '');
			
			console && console.log( 'LOG ' + namespace + ' : ' + args);
		};
		fn.namespace = namespace;
		
		return fn;
	}
	
	var DEFAULTS = {
		theme 	 	: 'default',		// default theme 
		template 	: 'default', 		// default template to apply
		debug		: false,			// set to true for debugging				
		base		: undefined			// (required) base url to ampere 
	};

		// load resources and callback() when finished
	function load( options, callback) {
		this.ensure( options.base!==undefined, 'load() argument options expected to have property "base" providing the base url');
		
		var context = this;
		
		// normalize theme
		options.tmpl = typeof( options.tmpl)=='string' ? [ options.tmpl] : ($.isArray( options.tmpl) ? options.tmpl : []);
		options.css  = typeof( options.css)=='string' ? [ options.css] : ($.isArray( options.css) ? options.css : []);
		options.js   = typeof( options.js)=='string' ? [ options.js] : ($.isArray( options.js) ? options.js : []);
		
		for( var i=0; i<options.css.length; i++) {
			$( 'head').append( 
				$( '<link href="' + options.base + options.css[i] + '" rel="stylesheet" type="text/css" />')
			);
		}
		
		var resources = [].concat( options.tmpl, options.js);
		
		if( resources.length) { 
			var tracker = function( resource) {
				return function( XMLHttpRequest, textStatus) {
					resources.splice( $.inArray( resource, 1));
					context.log( resource, ' (', options.base + resource, ') ', (textStatus=='success' ? 'loaded' : 'skipped (' + XMLHttpRequest.status + ')'));
					resources.length || callback.call( context); 
				};
			};
			for( var i=0; i<options.js.length; i++) {
				$.ajax({
					url 	: options.base + options.js[i],
					dataType: 'script',
					cache   : !$.ampere.options.debug,
					complete: tracker( options.js[i]),
					success  : function( data, textStatus, XMLHttpRequest) {
						var fn = eval( data);
						fn.call( context);
					}
				});
			}
			for( var i=0; i<options.tmpl.length; i++) {
				$.ajax({
					url : options.base + options.tmpl[i],
					dataType : 'html',
					cache    : !$.ampere.options.debug, 
					success  : function( data, textStatus, XMLHttpRequest) {
						var e = $( data);
						$.ampere.theme.ensure( e.length, 'could not transform data to html : ', data);
						e.appendTo( 'head');	
					},
					complete : tracker( options.tmpl[i]) 
				});
			}
		} else {
			callback.call( context);
		}
	} 
	
	function Theme( callback) {
		if( $.ampere.theme) {
			callback.call( $.ampere);
			return $.ampere.theme;
		}

		if( !(this instanceof Theme)) {
			return new Theme( callback);
		}

		if( !$.ampere.options.base) {
			throw new Error( 'required option jQuery.ampere.options.base is undefined.');
		}

		this.ensure = Ensure( $.ampere.ensure.namespace + '.Theme(' + $.ampere.options.theme + ')');
		this.log    = Log   ( $.ampere.ensure.namespace + '.Theme(' + $.ampere.options.theme + ')');
		this.templates = { views : {}, fragments : {}, layouts : {}};
		
		$.ampere.theme = this;
		
		this.getTemplate = function( category, name) {
			this.log( 'getTemplate( ' + category + ',' + name + ')');
			
			var template = $.ampere.theme.templates[ category][ name];
			
			$.ampere.theme.ensure( template, category.substring( 0, category.length-1), ' template "', name, '" not available');
			
			return template;
		};
		
			// load theme description
		var proxy = function() {

				// initialize template map
			var filter = new RegExp( 'ampere_theme_' + $.ampere.options.theme + '_(fragment|view|layout)_(.*)');
			var templates = $( "head script[type=text/x-jquery-tmpl]");
			
			for( var i=0; i<templates.length; i++) {
				var template = templates[i];
				
				var matches = (templates[i].id || '').match( filter);
				if( matches) {
					var category = matches[1] + 's';
					 	
					$.ampere.theme.ensure( 
						!$.ampere.theme.templates[ category] || !$.ampere.theme.templates[ category][ matches[2]], 
						'template( "#', matches[0], '") : a theme "', matches[1], '" named "', matches[2], '" is already defined.'
					);
					$.ampere.theme.templates[ category][ matches[2]] = $(template).template();
					
						// add fragment as template tag
					if( category=='fragments') {
						this.ensure( !$.tmpl.tag[ matches[2]], 'theme fragment "', matches[2], '" : ', ' template tag is already defined');
						
						$.tmpl.tag[ matches[2]] = $.extend( 
							{}, 
							$.tmpl.tag.tmpl, 
							{ 
								open : $.tmpl.tag.tmpl.open.replace( '$1', '$.ampere.theme.templates.fragments.' + matches[2])
							}
						);
					}
						// --
				}
			}
			
			callback.call( $.ampere);
		};
		var base = $.ampere.options.base + '/themes/' + $.ampere.options.theme + '/';
		$.ajax({
			url   		: base + 'theme.json',
			dataType 	: 'json', 
			error 		: function( XMLHttpRequest, textStatus, errorThrown) {
				if( XMLHttpRequest.status==404) {
					load.call( 
						$.ampere.theme,	
							{ 
								base : base, 
								tmpl : [ 'theme.tmpl'], 
								css  : [ 'theme.css'], 
								js   : [ 'theme.js']
							}, 
							proxy
						);
				} else {
					throw errorThrown;
				}
			},
			success : function(data, textStatus, XMLHttpRequest) {
				load.call( 
					$.ampere.theme, 
					$.extend( { base : base }, data), 
					proxy
				);
			}
		});
		
		this.render = function( view, layout) {
			layout || (layout='default');
			
			var template = this.getTemplate( 'layouts', layout);
			
			this.preRender( view);
			
			if( view.options( 'layout')!=false) {
				view.state.module.element.empty().append( $.tmpl( template, view));
			} else {
				view.state.module.element.empty().append( this.render( { data : this}));
			}

			view.options( 'post').call( view);
			
			this.postRender( view);
		};
		
			/* can be overridden by themes */
		this.preRender  = $.noop;
		this.postRender = $.noop;
		
		/*
		this.transition = function( transition, layout) {
			debugger;
			layout || (layout='transition');
			
			var template = $( '#ampere_theme_' + $.ampere.options.theme + '_fragment_' + layout);
			this.ensure( template.length==1, 'layout template "' + template.selector + '" not found in theme');
			
			return template.tmpl( transition);
		};
		*/
		return this;
	};
	
	$.ampere = function( callback) {
		$( document).ready( function() {
			Theme( callback);
		});
	};

	function View( state, options) {
		this.state   = state;

		this.ensure = Ensure( state.ensure.namespace + '.View(' + options.name + ')');
		this.log    = Log   ( state.ensure.namespace + '.View(' + options.name + ')');
		
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
			// if $item.id is undefined a new id will be generated using the (optional) prefix  
		this.id = (function() {
			var ids = {};
			var id = function( $item, $1, $2) {
				if( $item.id) {
					return $item.id;
				} else {
					var prefix = $2!==undefined && $2!==null ? $2 : '';
				
					ids[ prefix]!==undefined || (ids[prefix] = 0);
				
					$item.id = prefix + ids[ prefix]++;
					return $item.id;
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
			view.options( 'pre').call( view);
			
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
			return $.template( null, result);
		};
	}
	
	var trueFn = function() {
		return true;
	};
	
	function Transition( state, target, options) {
		this.state   = state;
		this.target  = target;
		
		this.ensure = Ensure( state.ensure.namespace + '.Transition(' + options.name + ')');
		this.log    = Log   ( state.ensure.namespace + '.Transition(' + options.name + ')');
		
		options.condition = options.condition || trueFn;  
		this.ensure( $.isFunction( options.condition), 'option "condition" expected to be a function');
		
		this.options = function( key, _default) {
			switch( arguments.length) {
				case 0  : return options;
				case 1  : return options[ key];
				case 2  : return options[ key]!==undefined ? options[ key] : _default;
				default : return options;
			}
		};
		
		this.isEnabled = function() {
			var condition = this.options( 'condition', trueFn);
			var v = condition.call( this);
			
			return v;
		};
	}
	
	function State( module, options) {
		this.module  = module;
		
		this.ensure = Ensure( module.ensure.namespace + '.State(' + options.name + ')');
		this.log    = Log   ( module.log.namespace + '.State(' + options.name + ')');
		
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
			options || (options = {});			

			var action = options.action;
			if( !$.isFunction( options.action)) {
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
				} else {
					options.name = target.options( 'name');
				}
			}
			
			options.title || (options.title=ucwords( options.name));  
			options.type || (options.type='primary'); 
			
			this.ensure( !this.transitions[ options.name], 'transition named "', options.name + '" already defined state "', this.options( 'title'), '"');
			
			var transition = function() { };
			transition.prototype   			 = new Transition( this, target, options);
			transition.prototype.constructor = options.action;
			
			this.transitions[ options.name] = new transition();
			
			return this;
		};
		
		this.views = {};
		
		this.view = function( options) {
			options = options || {};
			
			options.name || (options.name = '');
			$.isFunction( options.pre) || (options.pre = $.noop);
			$.isFunction( options.post) || (options.post = $.noop);

			this.views[ options.name] = new View( this, options);
			
			return this;
		};
		
		this.getView = function( name) {
			if( this.views[ name]) {
				return this.views[ name]; 
			} else {
				// if no state is explicitly set - take the first one 
				for( name in this.views) {
					return this.views[ name];
				}
			} 
			
				// if we stay here no view is availale (yet) -> create a synthetic view 
			this.view({ });
			return this.getView(); 
		};
	}
	
	function Module( callback, options) {
		this.ensure = Ensure( $.ampere.ensure.namespace + '.Module(' + options.name + ')');
		this.log    = Log   ( $.ampere.log.namespace + '.Module(' + options.name + ')');
		
		options = options || {};
		this.options = function( key, _default) {
			switch( arguments.length) {
				case 0  : return options;
				case 1  : return options[ key];
				case 2  : return Object.hasOwnProperty( options, key) ? options[ key] : _default;
				default : return options;
			}
		};

		this.states = {};
		
		this.state = function( fn, options) {
			this.ensure( $.isFunction( fn), 'argument fn expected to be a function');
			
			options || (options = {});
			options.name  || (options.name=fn.name);
			this.ensure( options.name && options.name.length, 'argument fn expected to be a named function (function foo() { ... }) or option name must be given');
			options.title || (options.title=ucwords( options.name));  
			
			this.ensure( !this.states[ options.name], 'state named "', options.name + '" already defined module "', this.options( 'title'), '"');
			
			var state = function() {
				this.constructor();				
			};
			state.prototype   			 = new State( this, options);
			state.prototype.constructor = fn;
			
			this.states[ options.name] = new state();
			
			return this;
		};
		
		var _state = undefined;
		this.getState = function() {
			return _state;
		};
		
		this.setState = function( state, view) {
			this.ensure( state instanceof State, 'argument state of type State expected');
			this.ensure( state.module===this, state.log.namespace, ' is not part of module ', this.log.namespace);
			
				// check for first enabled automatic transition : 
				// execute and exit if found
			for( var transition in state.transitions) {
				transition = state.transitions[transition];
				if( transition.options( 'type')=='auto' && transition.isEnabled()) {
					this.proceed( transition);
					return this; 
				}
			}
				// --
			
				// otherwise proceed setting given state as current one
			_state = state;
			view = (view instanceof View) ? view : state.getView( view);
			
			$.ampere.theme.render( view);
		};
		
		this.proceed = function( transition) {
			this.ensure( transition instanceof Transition, 'argument transition of type Transition expected');
			this.ensure( transition.state.module===this, transition.log.namespace, ' is not part of module ', this.log.namespace);

			transition.log( 'proceed to state ', transition.target.log.namespace);
			
			transition.options('action').call( transition);
			
			this.setState( transition.target);
		};  
	}
	
	$.extend( $.ampere, {
		options : DEFAULTS,
		theme   : undefined,
		modules : {},
		module  : function( fn, options) {
			$.ampere.ensure( $.isFunction( fn), 'argument fn expected to be a function');
			
			options || (options = {});
			options.name  || (options.name=fn.name);
			$.ampere.ensure( options.name && options.name.length, 'argument fn expected to be a named function (function foo() { ... }) or option name must be given');			
			options.title || (options.title=ucwords( options.name));  
			
			$.ampere.ensure( !$.ampere.modules[ options.name], 'module named "', options.name + '" already defined');
			
			var module = function( element, options) {
				this.element = element;
				$.extend( this.options(), options);
				
				load.call(
					this,
					$.extend( { base : options.base || ''}, this.options().resources || {}),
					function() {
						this.constructor();

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

						this.ensure( this.states[ state], 'could not set state "', state, '". no state with this name known.');
						state = this.states[ state];
						
						view = state.getView( view);
						state.ensure( view instanceof View, 'could not set initial state\'s view "', view, '". no view with this name known.');
						
						this.setState( state, view);
							// --
					}
				);
			};
			module.prototype   			 = new Module( fn, options);
			module.prototype.constructor = fn;
			
			$.ampere.modules[ options.name]   = module;
			
			return $.ampere;		
		},
		ensure 		: Ensure( 'ampere'),
		log    	 	: Log( 'ampere'),
		link 		: {
			checkbox2boolean : function() {
				return {
					convert     : function( value, source, target) {
						$( target).data( source.name, source.checked);
					},
					convertBack : function( value, source, target) {
						target.checked = source[ target.name];
					}
				};
			},
			
			radio : function() {
				return {
					convert     : function( value, source, target) {
						var radios = $.makeArray( source.form[source.name]);
						for( var i=0; i<radios.length; i++) {
							if( radios[i].checked) {
								$( target).data(source.name, value);
								break;
							} 
						} 
					},
					convertBack : function( value, source, target) {
						var radios = $.makeArray( target.form[ target.name]);
						for( var i=0; i<radios.length; i++) {
							if( radios[ i].value==source[ target.name]) {
								radios[ i].checked = true;
								break;
							} 
						}
					}
				};
			},
			
			multipleSelect2array : function() {
				return {
					convert     : function( value, source, target) {
						$( target).data( source.name, $.makeArray( $( source).val()));
					},
					convertBack : function( value, source, target) {
						$( target).val( source[ target.name]);
					}
				};
			}
		} 
	});
	
	$.fn.module = function( name, options) {
		if( name) {
			var module = $.ampere.modules[ name]; 
			$.ampere.ensure( module, 'module named "', name, '" is not defined');
			
			this.each( function() {
				var e = $( this);
				
				var instance = e.data( 'ampere_module');
				if( !instance) {
					instance        = new module( e, options || {});
										
					e.data( 'ampere_module', instance);
					e.addClass( 'ampere module');
				} else {
					$.ampere.ensure( instance.constructor!==module, 'Element ', this.tagName, ' has another ampere application "', instance.constructor.name, '" attached');
				}
			});
		} else {
			$.ampere.ensure( this.length==1, 'single dom element expected');
			
			var instance = this.data( 'ampere_module');
			$.ampere.ensure( instance, 'no module attached to dom element');
			return instance;
		}
		
		return this;
	};
	
	$.ampere.getViewTmplItem = function( $item) {
		while( !($item.data instanceof View)) {
			$item = $item.parent;
		}
		
		Ensure( 'getViewTmplItem()')( $item.data instanceof View, 'could not evaluate parent tmpl item having data instanceof View');
		return $item;
	};
	
	$.tmpl.tag.id = {
		_default : {
			$2 : 'undefined'
		},
		open : '_=_.concat( /*$.ampere.theme.view.id*/$.ampere.getViewTmplItem( $item).data.id( $item, $1, $2));'
	};
	
	$.tmpl.tag.view = {
		_default : {
			
		},
		open : $.tmpl.tag.tmpl.open
			   .replace( '$1', '$data.render()')
			   .replace( '$2', '$data')
			//$.tmpl.tag.tmpl.open.replace( '$2', '{ wrapped : $.ampere.theme.content}')
	};
	
		// update state views whenever a change occures 
	    // TODO : use delegate instaed of live handler
	$('body').live( 'change', function( event) {
		var e = $( event.target).closest( '.ampere.module');
		if( e.length) {
			e.module().getState().log( 'i was changed : ', e.module().getState().operand);
			for( var name in e.module().getState().transitions) {
				var transition = e.module().getState().transitions[ name];
				
				if( transition.options( 'type')=='auto') {
					if( transition.isEnabled()) {
						e.module().proceed( transition);
						return;
					}					
				} else {
					var eTransition = e
					.find( '.transition.' + transition.options( 'name'));
									
					eTransition[ transition.isEnabled() ? 'removeAttr' : 'attr']( 'disabled', 'disabled');
				}
			}
		}
	});
	
		// react on clicks to transitions
		// TODO : use delegate instaed of live handler
	$( 'body .transition').live( 'click', function() {
		var tmplItem = $.tmplItem( this);
		if( tmplItem) {
			var transition = $.tmplItem( this).data;
			if( transition instanceof Transition) {
				transition.log( 'i was clicked');
				transition.state.module.proceed( transition);
			}
		}
	});
	
})( jQuery);