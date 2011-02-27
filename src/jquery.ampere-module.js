/* 
 * Copyright (c) 2011 Lars Gersmann (lars.gersmann@gmail.com, http://orangevolt.blogspot.com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 */
((window.$deferRun || function( run ){ run( jQuery); }) (
	function( $, options) {
			// real ampere module constructor
		function init_ampere_module_instance( element) {
			var namespace_suffix = element.id ? '#' + element.id : element.tagName + (element.tagName ? '/' + element.name : '');
			
			this.log    = $.ampere.util.log( this.ensure.namespace + namespace_suffix);
			this.ensure = $.ampere.util.log( this.ensure.namespace + namespace_suffix);
		}
		
		$.ampere.module = function module( /*function (=register app) || name (=instantiate app)*/ constructor, /*object*/options) {
			if( this instanceof $.ampere.module) {
				this.log    = $.ampere.util.log( $.ampere.ensure.namespace + '(' + constructor + ')');
				this.ensure = $.ampere.util.ensure( $.ampere.ensure.namespace + '(' + constructor + ')');

				this.ensure( options.name===undefined, 'option "name" cannot be redefined when instantiating a module');
				
				typeof( options.title)=='string' || (options.title=$.ampere.util.ucwords( options.name));
				
				this._options = $.extend( {}, $.ampere.modules[ constructor].defaults, options);
				this.options = function( key, _default) {
					switch( arguments.length) {
						case 0  : return this._options;
						case 1  : return this._options[ key];
						case 2  : return Object.hasOwnProperty( this._options, key) ? this._options[ key] : _default;
						default : return this._options;
					}
				};
				
				var deferreds = $.ampere.modules[ constructor].deferreds.slice(0);
				if( options.resources) {
					var styles = $.makeArray( options.resources.styles);
					for( var i=0; i<styles.length; i++) {
						$.ampere.util.loadStyles( '', styles[i]);
					}
					
					var scripts = $.makeArray( options.resources.scripts);
					for( var i=0; i<scripts.length; i++) {
						this.log( 'load script ', JSON.stringify( scripts[i]));
						deferreds.push( 
							$.defer.apply( this, $.makeArray( scripts[i]))
						);
					}
				}
				
				var deferred = $.Deferred();
				
				$.when.apply( this, deferreds)
				.done( function() {
					deferred.resolve( $.makeArray( arguments));
				})
				.fail( function() {
					deferred.reject( $.makeArray( arguments));
				});
				
				$.extend( this, deferred.promise());
				return this;
			} else {
				$.ampere.ensure( $.isFunction( constructor), 'argument constructor expected to be a function');
				
				options = options || {};
				if( !options.name) {
					options.name=constructor.name || (options.title ? options.title.toLowerCase() : false);
				}
				$.ampere.ensure( options.name && options.name.length, 'argument constructor expected to be a named function (function foo() { ... }) or option name/title must be given');
				$.ampere.ensure( !$.ampere.modules[ options.name], 'module named "', options.name + '" already defined');
				
				$.ampere.modules[ constructor.name] = constructor;
				$.ampere.modules[ constructor.name].defaults = options;
				$.ampere.modules[ constructor.name].deferreds = [];
				
				if( options.resources) {
					var styles = $.makeArray( options.resources.styles);
					for( var i=0; i<styles.length; i++) {
						$.ampere.util.loadStyles( '', styles[i]);
					}
					
					var scripts = $.makeArray( options.resources.scripts);
					var log = $.ampere.util.log( $.ampere.ensure.namespace + '(' + options.name + ')');
					for( var i=0; i<scripts.length; i++) {
						log( 'load script ', JSON.stringify( scripts[i]));
						$.ampere.modules[ constructor.name].deferreds.push( 
							$.defer.apply( this, $.makeArray( scripts[i]))
						);
					}
				}
			}
		};
		$.ampere.module.state = function() {
			console.log( '$.ampere.module.state called');
			this.states = true;
		};
		
		$.fn.module = function( name, options) {
			$.ampere.ensure( $.ampere.modules[ name], 'no ampere model named "', name , '" available');

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
					$.data( this, 'ampere_module', instance);
				});				
			})
			.fail( function() {
				var args = $.makeArray( arguments);
				args.unshift( 'failed to initialize module "', name, '" : ');
				args.unshift( false);
				$.ampere.ensure.apply( $.ampere.ensure, args);
			});
		};
	}
));