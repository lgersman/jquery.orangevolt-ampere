/* 
 * Copyright (c) 2011 Lars Gersmann (lars.gersmann@gmail.com, http://orangevolt.blogspot.com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 */
((window.$deferRun || function( run ){ run( jQuery); }) (
	function( $, options) {
		options = $.extend( true, { }, $.ampere.options, (options || {}).ampere);
				
		var log = $.ampere.util.log( 'ampere.theme');
		var ensure = $.ampere.util.ensure( 'ampere.theme');

		var deferreds = [];
		var deferred = $.Deferred();
		
			// theme
		$.ampere.theme = {
			promise 		: function() {
				return deferred.promise();
			},
			log    			: log,
			ensure 			: ensure,
				/**
				 *	wraps the original template call by providing the additional selector argument
				 *  to the template  
				 */
			fragment  		: function( $item, selector, data, name) {
				var wrapper = function(  jQuery, $item) {
					$.ampere.theme.ensure( $.isFunction( $.ampere.theme.templates.fragments[ name]), 'could not find fragment "', name , '"'); 
					return $.ampere.theme.templates.fragments[ name](  jQuery, $item, selector);
				};
					// we set data=false i data is undefined to prevent
					// tmpl plugin toset data to parent.data (which is the case for undefined)
				return $item.nest( wrapper, data!==undefined ? data : false); 
			},
			setTemplate 	: function( category, name, template, tagDefinition) {
				$.ampere.theme.ensure( 
					!$.ampere.theme.templates[ category] || !$.ampere.theme.templates[ category][ name], 
					'setTemplate( "', category,'", "', name,'") : a theme ', category.substring( 0, category.length-1), ' named "', name, '" is already defined.'
				);
				$.ampere.theme.templates[ category][ name] = $.isFunction( template) ? template : $(template).template();
	
				if( category=='fragments') {
					this.ensure( !$.tmpl.tag[ name], 'theme fragment "', name, '" : ', ' template tag is already defined');
					
					if( tagDefinition===undefined) {
						$.tmpl.tag[ name] = $.extend( 
							{}, 
							$.tmpl.tag.tmpl, 
							{ 
								/*
								open : $.tmpl.tag.tmpl.open.replace( '$1', '$.ampere.theme.templates.fragments.' + name)
								*/
								open : $.tmpl.tag.tmpl.open
								.replace( '$item.nest($1,$2', '$.ampere.theme.fragment( $item,$1,$2,"' + name +'"')
							}
						);	
					} else {
						$.tmpl.tag[ name] = tagDefinition;
					}
				}
			},
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
			}/*,
			onready : function( $item, callback) {
				console.log( 'on ready');
				debugger;
			}*/,
			render : function( view, layout, flash) {
				layout || (layout='default');
				var template = this.getTemplate( 'layouts', layout);

				view.state.module.element.css( 'visibility', 'hidden');
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
							
				view.state.module.element.empty().append( $.tmpl( template, view));
				view.options( 'post').call( view);
				$.ampere.theme.postRender( view);
				view.state.module.element.css( 'visibility', 'inherit');
				
				if(flash) {
					this.flash( view, flash.message, flash.options);
				} else{
					this.flash( view);
				}
			},
				/* can be overridden by themes */
			preRender  : $.noop,
			postRender : $.noop,
			flash	   : $.noop,
			block	   : $.noop,
			unblock	   : $.noop
		};
		
		/*
		 * @return the closest TmplItem with the view asociated as data  
		 */
		$.ampere.getViewTmplItem = function( $item) {
			while( !($item.data instanceof $.ampere.view)) {
				$item = $item.parent;
			}
			
			$.ampere.util.ensure( 'getViewTmplItem()')( $item.data instanceof $.ampere.view, 'could not evaluate parent tmpl item having data instanceof View');
			return $item;
		};
		
		$.tmpl.tag.id = {
			_default : {
				$2 : 'undefined'
			},
			open : '__=__.concat( jQuery.ampere.getViewTmplItem( $item).data.id( $item, $1, $2));'
		};
		
		$.tmpl.tag.log = {
			_default : {
				$2 : 'undefined',
				$1 : 'undefined'
			},
			open : '$.ampere.getViewTmplItem( $item).data.log( $.ampere.getViewTmplItem( $item).data.state.options("label") ,$2);'
		};
		
		/*
		var varFn = function( _, $2, $1) {
			Ensure( 'tag{{var( name) [value]}}')( $1!==$.tmpl.tag[ 'var'].varFn, 'required parameter name available');
			
			if( $2!==$.tmpl.tag[ 'var'].varFn) {
				this[ $1] = $2;
			} else if( this[ $1]!==undefined && this[ $1]!==null){
				_.push( this[ $1]);
			}
			// '$item.tag_var=$1; $item.tag_var===$.tmpl.tag[ "var"].UNDEFINED && $item.tag_var!=null && $item.tag_var!==undefined ? (_=_.concat( $item.tag_var)) : ($item[ "".concat( $2)]=$item.tag_var);'	
		};
		$.tmpl.tag[ 'var'] = {
			_default : {
				$1 : "$.tmpl.tag[ 'var'].varFn",
				$2 : "$.tmpl.tag[ 'var'].varFn"
			},
			open : "jQuery.tmpl.tag[ 'var'].varFn.call( $item, _, $1, $2);"
		};
		$.tmpl.tag[ 'var'].varFn = varFn;
		*/
		
		$.tmpl.tag.view = {
			_default : {
				
			},
			open : $.tmpl.tag.tmpl.open
				   .replace( '$1', '$data.render()')
				   .replace( '$2', '$data')
		};
		
			// see {{each}} as reference
		$.tmpl.tag['with'] = {
			_default : {
				$2 : '$value'
			},
			open  : "if($notnull_1){$.each([$1],function(undefined, $2){with(this){",
			close : '}});}'
		};
		
		$.tmpl.tag.ready = $.extend( function( $item, $1, $2) {
			$.ampere.util.ensure( '$.tmpl.tag.ready')( $.isFunction( $1) || typeof($1)=='string' || ($1 && ($1.jquery || $1.nodeType==1)), 'selector argument expected to be a callback function returning a dom element/query collection or a dom element/query collection');
			
			var id = $.ampere.getViewTmplItem( $item).data.id( $item, null, 'ready');
			$item.rendered = function() {
				var container = $( document.getElementById( id));
				if( $.isFunction( $1)) {
					$1.call( this, container, $2);
				} else if( typeof($1)=='string'){
					container.text( $1);
				} else {
					container.append( $1);
				}
			};
			return ['<div id="', $.encode( id), '"/>'];
		},{
			_default : {
				$2: "null"
			},
			open : $.tmpl.tag.tmpl.open
			.replace( '$item.nest($1,$2', '$.tmpl.tag.ready( $item,$1,$2')			
		});
		
		var url = $.ampere.options.theme;
		ensure( url, 'ampere option theme expected to be a non empty string');
		if( !url.match( /.js$/)) {
			url = $.ampere.util.getDeferUrl( 'ampere', 'themes/' + $.ampere.options.theme + '/theme.js');  
		} 
		
		log( 'loading theme => ', url);
		$.defer( url)
		.done( function() {
			log( 'loading theme templates');
			$.when.apply( this, deferreds)
			.done( function() {
				log( 'compile theme templates');
				
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
				
				log( 'loading done');
				
				deferred.resolve();
			})
			.fail( function() {
				log( 'failed');
				deferred.reject( 'failed loading templates');
			});
		})
		.fail( function() {
			log( 'failed');
			deferred.reject( 'failed to load theme "' + $.ampere.options.theme + '"');
		});
		
			// update state views whenever a change occures 
		    // TODO : use delegate instead of live handler
		$( 'body').live( 'change input', function( event) {
			var e = $( event.target).closest( '.ampere.module');
	
			if( e.length) {
				e.module().getState().log( 'i was changed : ', event.target, ':', event.type);
				for( var name in e.module().getState().transitions) {
					var transition = e.module().getState().transitions[ name];
					
					if( transition.options( 'type')=='auto') {
						if( !transition.disabled()) {
							e.module().proceed( transition);
							return;
						}					
					}
				}
			}
		});
		
			// react on clicks to transitions
			// TODO : use delegate instaed of live handler
		$( '.transition').live( 'click', function( event) {
			var tmplItem = $.tmplItem( event.target);
			if( tmplItem) {
				var transition = tmplItem.data;
				if( transition instanceof $.ampere.transition) {
					transition.log( 'i was clicked');
					transition.state.module.proceed( transition);
				}
			}
		});
	}
));