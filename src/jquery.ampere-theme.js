/* 
 * Copyright (c) 2011 Lars Gersmann (lars.gersmann@gmail.com, http://orangevolt.blogspot.com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 */
((window.$deferRun || function( run ){ run( jQuery); }) (
	function( $, options) {
		var deferreds = [];
		
		var log = $.ampere.util.log( 'ampere.theme');
		var ensure = $.ampere.util.ensure( 'ampere.theme');

		var deferred;
		
			// theme
		$.ampere.theme = function() {
			if( deferred) {
				return deferred;
			}
			
			deferred = $.Deferred(); 
			
			var url = $.ampere.options.theme;
			ensure( url, 'ampere option theme expected to be a non empty string');
			if( !url.match( /.js$/)) {
				url = $.ampere.util.getDeferUrl( 'ampere', 'themes/' + $.ampere.options.theme + '/theme.js');  
			} 
			
			log( 'loading theme => ', url);
			$.when( $.defer( url))
			.done( function() {
				$.when.apply( this, deferreds)
				.done( function() {
						// initialize template map
					var filter = new RegExp( 'ampere_theme_(fragment|view|layout)_(.*)');
					var templates = $( "head script[type='text/x-jquery-tmpl']");
					
					for( var i=0; i<templates.length; i++) {
						var template = templates[i];
						
						var matches = (templates[i].id || '').match( filter);
						if( matches) {
							var category = matches[1] + 's';
							 	
							$.ampere.theme.setTemplate( category, matches[2], templates[i]);
						}
					}
					
					log( 'done');
					deferred.resolve();
				})
				.fail( function() {
					log( 'failed');
					deferred.reject( 'failed loading templates');
				});
			})
			.fail( function() {
				deferred.reject( 'failed to load theme "' + $.ampere.options.theme + '"');
			});
			
			return deferred;
		};
		$.extend( $.ampere.theme, {
			log    			: log,
			ensure 			: ensure,
			setTemplate 	: function() {},
			templates 		: { 
				views : {}, 
				fragments : {}, 
				layouts : {}
			},
			loadTemplates : function() {
				for( var i=0; i<arguments.length; i++) {
					deferreds.push( 
						$.ajax({
							url : arguments[i],
							dataType : 'html',
							cache    : !$.ampere.options.debug, 
							success  : function( data, textStatus, XMLHttpRequest) {
								var e = $( data);
								$.ampere.theme.ensure( e.length, 'could not transform data to html : ', data);
								e.appendTo( 'head');	
							} 
						})
					);
				}
			},
			getTemplate : function( category, name) {
				this.log( 'getTemplate( ' + category + ',' + name + ')');
				
				var template = $.ampere.theme.templates[ category][ name];
				
				$.ampere.theme.ensure( template, category.substring( 0, category.length-1), ' template "', name, '" not available');
				
				return template;
			},
			render : function( view, layout) {
				layout || (layout='default');
				
				var template = this.getTemplate( 'layouts', layout);
				
				this.preRender( view);
	
				/*
				view.state.module.element.find( '.transition').css( 'visibility', 'hidden');
				var stateElement = view.state.module.element.find( '.state');
				var f = function() {
					view.state.module.element.empty(); 
					if( view.options( 'layout')!=false) {
						view.state.module.element.append( $.tmpl( template, view));
					} else {
						view.state.module.element.append( $.ampere.theme.render( { data : this}));
					}
					view.state.module.element.find( '.state')
					.show('slide', {direction: 'right'});
					
					view.options( 'post').call( view);
					
					$.ampere.theme.postRender( view);
				};
				
				if( stateElement.length) {
					stateElement.hide('slide', {direction: 'left'}, f);
				} else {
					f();
				}
				*/
				
				view.state.module.element.empty().append(
					view.options( 'layout')!=false 
					? $.tmpl( template, view)
					: $.ampere.theme.render( { data : this})
				);
				view.options( 'post').call( view);
				$.ampere.theme.postRender( view);
			},
				/* can be overridden by themes */
			preRender  : $.noop,
			postRender : $.noop
		});
	}
));