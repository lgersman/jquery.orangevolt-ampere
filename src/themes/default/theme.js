/* 
 * Copyright (c) 2011 Lars Gersmann (lars.gersmann@gmail.com, http://orangevolt.blogspot.com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 */
((window.$deferRun || function( run ){ run( jQuery); }) (
	function( $, options) {
		/*'jquery-ui/themes/base/jquery-ui.css',*/
		/*'//ajax.googleapis.com/ajax/libs/jqueryui/1.8.11/themes/redmond/jquery.ui.all.css',*/	
		var styles = $.makeArray( $.ampere.options['jquery-ui-theme']).slice( 0);
		styles.push( 
			'multiselect/jquery.multiselect.css', 
			'multiselect/jquery.multiselect.filter.css',
			'theme.css',
			'portal.css',
			'aristo.css'
		);
		styles.unshift( 'templates', 'jquery-ui/themes/base/jquery-ui.css');
		$.ampere.util.loadStyles.apply( this, styles);

		var datalinking = {
			checkbox : function( equals) {
				$.isFunction( equals) || (equals = $.ampere.util.equals);
				
				return {
					convert     : function( value, source, target) {
						var value = undefined;
						if( source.checked) {
							var data = $.tmplItem( source).data;  
							value = ('value' in data) ? data.value : true;
						}
						target[ source.name] = value;
						$.ampere.getViewTmplItem( $.tmplItem( source)).data.log(
							'set "', source.name, '"(', typeof( value) ,') in state "', target.options( 'label'), '" to ', value, ' : ', target
						);
						
							// THIS IS A HACK : if value is undefined datalink plugin doesnt call setField ...
						if( value===undefined) {
							$.setField( target, source.name, value);
						}
						
						return value;
					},
					convertBack : function( value, source, target) {
						var data = $.tmplItem( target).data;  
						value = ('value' in data) ? data.value : true;

						if( equals.call( target, source[ target.name], value)) {
							$.ampere.getViewTmplItem( $.tmplItem( target)).data.log(
								'set "', target, ' checked'
							);
							target.checked=true;
							return true;
						}
						
						return false;
					}
				};
			},
			
			radio : function( equals) {
				$.isFunction( equals) || (equals = $.ampere.util.equals);
				
				return {
					convert     : function( value, source, target) {
						var radios = $.makeArray( source.form[source.name]);
						for( var i=0; i<radios.length; i++) {
							if( radios[i].checked) {
								var data = $.tmplItem( radios[i]).data;  
								value = ('value' in data) ? data.value : (data.label || 'on').toLowerCase();
								$.setField( target, source.name, value);
								
								$.ampere.getViewTmplItem( $.tmplItem( radios[i])).data.log(
									'set "', source.name, '"(', typeof( value) ,') in state "', target.options( 'label'), '" to ', value, ' : ', target
								);
								return;
							} 
						} 
					},
					convertBack : function( value, source, target) {
						var radios = $.makeArray( target.form[ target.name]);
						for( var i=0; i<radios.length; i++) {
							var data = $.tmplItem( radios[i]).data;
							var value= ('value' in data) ? data.value : (data.label || 'on').toLowerCase();
							
							if( equals.call( target, value, source[ target.name])) {
								$.ampere.getViewTmplItem( $.tmplItem( radios[i])).data.log(
									'set "', radios[ i], ' checked'
								);
								radios[ i].checked = true;
								return;
							} 
						}
					}
				};
			},
			
			number : function() {
				return {
					convert     : function( value, source, target) {
						$.setField( target, source.name, !isNaN( parseFloat( source.value)) ? parseFloat( source.value) : 0);
						$.ampere.getViewTmplItem( $.tmplItem( source)).data.log(
							'set "', source.name, '"(', typeof( target[ source.name]) ,') in state "', target.options( 'label'), '" to ', target[ source.name], ' : ', target
						);
					},
					convertBack : function( value, source, target) {
						target.value = '' + source[ target.name];
						$.ampere.getViewTmplItem( $.tmplItem( target)).data.log(
							'set "', target, ' value to ', target.value, ' (', typeof( target.value) ,')'
						);
					}
				};
			},
			
			select : function( equals) {
				$.isFunction( equals) || (equals = $.ampere.util.equals);
				
				return {
					convert     : function( value, source, target) {
						if( source.multiple) {
							var value = [];
							for( var i=0; i<source.options.length; i++) {
								var option = source.options[i];
								if( option.selected) {
									value.push( $( option).data( 'value'));
								}
							}
							$.setField( target, source.name, value);
						} else {
							var option = source.options[ source.selectedIndex];
							$.setField( target, source.name, $( option).data( 'value'));
						}
					},
					convertBack : function( value, source, target) {
						if( target.multiple) {
							var values = source[ target.name];
							for( var i=0; i<target.options.length; i++) {
								var option = target.options[i];
								for ( var k = 0; k < values.length; k++) {									
									if( equals.call( target, $( option).data( 'value'), values[k])) {
										option.selected = true;
										break;
									}
								}									
							}
						} else {
							var value = source[ target.name];
							for( var i=0; i<target.options.length; i++) {
								var option = target.options[i];
								if( equals.call( target, $( option).data( 'value'), value)) {
									target.selectedIndex = i;
									break;
								}	
							}
						}
					}
				};
			}
		};

		function changeFieldHandler( event, changed, newvalue) {
			$.ampere.theme.log( 'changeField event : ', event.target);
			notify( event.target.module.element);
		}
		
		function notify( container) {
			var view = container.find( '.body:first').tmplItem().data; 
				// update disabled capability
			container.find( 'a, button, input, select, textarea').each( function() {
				var self  = $(this);
				var handler = self.data( 'notify');
				if( handler) {
					var disabled = handler.call( view.state);
					self[ disabled ? 'attr' : 'removeAttr']( 'disabled', 'disabled');						
						// special case multiselect (shares another namespace ...)
					if( self.data( 'multiselect')) {
						self.multiselect( disabled ? 'disable' : 'enable');
					} else {
						for( var name in $.ui) {
								// if its an widget 
							if( $.ui[ name].prototype && self.data( name)) {
								self[ name]( disabled ? 'disable' : 'enable');
								return;
							}
						} 
						
							// for non widgetized elements : add/remove ui-state-* classes
						self[ disabled ? 'addClass' : 'removeClass']( 'ui-state-disabled');
					}
				}
			});
		}
		
		$.ampere.theme.preRender = function( view) {
				// TODO : remove old linked data should be not necessary in real life 
			var viewTmplItem = view.state.module.element.find( '.state:first').tmplItem();
			if( viewTmplItem) {
				view.state.module.element.unlink( viewTmplItem.data.state);
			}
			
				// TODO : cleanup tooltips. should be not necessary in real life
			$( 'dd[title]').tooltip( 'destroy');
			
			$( view.state).unbind( 'changeField', changeFieldHandler);
		};
		
		$.ampere.theme.block = function( view) {
			var overlay = view.state.module.element.find( '> .overlay');
			overlay.removeClass( 'ui-helper-hidden');
		};
		
		$.ampere.theme.unblock = function( view) {
			var overlay = view.state.module.element.find( '> .overlay');
			overlay.addClass( 'ui-helper-hidden');
		};
		
		$.ampere.theme.flash = (function() {
			var flash = function( view, message, options) {
				if( message) {
					$.ampere.util.log( $.ampere.theme.ensure.namespace + '(flash)')(
						'"' + message + '"', options ? JSON.stringify( options) : ''
					);
				}
				
				options = options || { };
				var flash = view.state.module.element.find( '.flash');
				flash.is( ':visible') && flash.stop(true).fadeOut(0);
				
				if( options.error) {
					$.ampere.theme.block( view);
				} 
				
				flash.removeClass( 'ajax');
				flash.removeClass( 'error');
				if( message) {
					$( '.label', flash).text( message);
					
					if( options.ajax || options.error) {
						flash.addClass( options.ajax ? 'ajax' : 'error'); 
					}
					
					var icon = $( '.icon', flash);
					icon.children().remove();
					if( options.icon) {
						var e = $('<span class="ui-icon"></span>').appendTo( icon);
						options.icon && e.addClass( options.icon);
					} 

					view.state.module.element.css( 'cursor', flash.hasClass( 'ajax') ? 'wait' : 'default');			
					
					flash.show().css( 'opacity', '1.0');

					if( !(options.error || options.ajax)) {
						setTimeout( function() {
							flash.stop(true).fadeOut();
						}, 2000);
					}
				} else {
					view.state.module.element.css( 'cursor', 'default');
				}
			};
			
			flash.wait = function( view, message, options) {
				flash( view, message || 'Please wait ...', $.extend( { ajax : true, icon : 'ui-icon-ajax'}, options));
			};
			
			flash.error = function( view, message, options) {
				flash( view, message || 'An error occured.', $.extend( { error : true}, options));
			};
			
			return flash;
		})();
		
		$.ampere.theme.postRender = function( view) {
				// link form elements to state variables
			var link = view.options( 'link');
			if( !link) {
				link = {};
				var form = view.state.module.element.find( 'form');
	
				if( form.length) {
					form = form[0];
					for ( var i = 0; i < form.elements.length; i++) {
						var element = form.elements[i];
						!$.isArray( element) || (element = element[0]);
						
						if( $(element).attr('name') && !link[ element.name]) {
							switch( element.tagName) {
								case 'SELECT' : {
									var dataLink = $( element).data( 'link'); 
									if( !dataLink || $.isFunction( dataLink) || typeof( dataLink)=='string') {
										if( typeof( dataLink)=='string') {
											var dataLinkOption = jQuery.ampere.getViewTmplItem( $(element).tmplItem()).data.state.module.options( dataLink);
											this.ensure( !dataLinkOption || $.isFunction( dataLinkOption), 'link expected to be a function( l, r)');
											!dataLinkOption || (dataLink=dataLinkOption);
											
											if( !dataLinkOption) {
												var windowDataLink = window[ dataLink];
												this.ensure( !dataLinkOption || $.isFunction( dataLinkOption), 'link expected to be a function( l, r)');
												!windowDataLink || (dataLink=windowDataLink);
											} 
											
											if( !dataLinkOption) {
												dataLink = eval( '(' + dataLink + ')');
											}										
										}
										link[ element.name] = datalinking.select.call( element, dataLink);
									} else if( $.isPlainObject( dataLink)) {
										link[ element.name] = dataLink;
									}
									
									link[ element.name].convertBack( view.state[ element.name], view.state, element);
								
									break;
								} 
								case 'INPUT'  : {
									switch( element.type) {
										case 'radio' 	: {
											var dataLink = $( element).data( 'link'); 
											if( !dataLink || $.isFunction( dataLink)) {
												link[ element.name] = datalinking.radio.call( element, dataLink);
											} else if( $.isPlainObject( dataLink)) {
												link[ element.name] = dataLink;
											}

											if( element.name && element.name.length) {
												link[ element.name].convertBack( view.state[ element.name], view.state, element);
											}
											break;
										}
										case 'checkbox' : {
											var dataLink = $( element).data( 'link'); 
											if( !dataLink || $.isFunction( dataLink)) {
												link[ element.name] = datalinking.checkbox.call( element, dataLink);
											} else if( $.isPlainObject( dataLink)) {
												link[ element.name] = dataLink;
											}
											
											link[ element.name].convertBack( view.state[ element.name], view.state, element);
											break;
										}
										case 'button'  	:
										case 'submit'  	:
										case 'reset'   	: {
												// do nothing
											break;
										}
										case 'text' 	: 
										case 'number' 	: 													
										default 		: {
											if( element.type=='number' || $( element).hasClass( 'number')) {
												link[ element.name] = datalinking.number();
												if( view.state[ element.name]!=undefined && view.state[ element.name]!=null) {
													link[ element.name].convertBack( view.state[ element.name], view.state, element);
												}
												break;
											} else {
												if( $.data( element, 'value')!==undefined) {
													view.state[ element.name]=$.data( element, 'value');	
												} else if( view.state[ element.name]!==undefined) {
													element.value = view.state[ element.name];
												}
											}
											link[ element.name] = element.name;
											break;
										}
									}
								}
							}
						}					
					}
				}
			}
			
			if( link && !$.isEmptyObject( link)) {
				view.state.module.element.link( view.state, link);
			}
				// --
		
			$( ':radio, :checkbox, :button', view.state.module.element).each( function() {
				var e = $(this);
				
				if( e.is( ':checkbox')) {
					e.data( 'checkedIcons', e.data( 'options') && e.data( 'options').icons ? e.data( 'options').icons : { 'primary' : null, 'secondary' : null });
					
					if( e.data( 'checkedIcons').primary) {
						e.data( 'uncheckedIcons', $.extend( {}, e.data( 'checkedIcons')));
						e.data( 'uncheckedIcons').primary = 'ui-icon-empty';
						
						e.change( function() {
							e.button( 'option', 'icons', e.data( this.checked ? 'checkedIcons' : 'uncheckedIcons'));
						});
						e.data( 'options').icons = e.data( this.checked ? 'checkedIcons' : 'uncheckedIcons');
					}
				} else if( e.is( ':radio')) {
					e.data( 'checkedIcons', e.data( 'options') && e.data( 'options').icons ? e.data( 'options').icons : { 'primary' : null, 'secondary' : null });
					
					if( e.data( 'checkedIcons').primary) {
						e.data( 'uncheckedIcons', $.extend( {}, e.data( 'checkedIcons')));
						e.data( 'uncheckedIcons').primary = 'ui-icon-empty';
						
						e.change( function() {
							//e.button( 'option', 'icons', e.data( this.checked ? 'checkedIcons' : 'uncheckedIcons'));
							$( e[0].form).find( ':radio[name="' + e.attr( 'name') + '"]').each( function() {
								var widget = $(this); 
								if( widget.data( 'checkedIcons')) { 
									widget.button( 'option', 'icons', widget.data( this.checked ? 'checkedIcons' : 'uncheckedIcons'));
								}
							});
						});
						e.data( 'options').icons = e.data( this.checked ? 'checkedIcons' : 'uncheckedIcons');
					}
				}
				
				e.button( e.data( 'options'));
				
					// TODO : empty title attribute is created in button label
					// which results in ugly effects when a surrounding element uses jquery ui tooltip
				e.button( 'widget').removeAttr( 'title');
			});
			
			$( 'select', view.state.module.element).each( function() {
				var e = $(this);
				var options = $.extend({ 
						header 	 		: false, 
						multiple 		: this.multiple,
						noneSelectedText: "",
						selectedList	: 4,
						click 	 		: !this.multiple ? function() { $(this).multiselect("close");} : $.noop,
						close			: function() {
							e.change();
						}
					}, 
					e.data('options') || {}
				);
				
				e.multiselect( options);
			});

				// convert input to change events to be compatible with datalinking plugin
			$( 'input[type=text]', view.state.module.element).bind( 'input', function() {
				$(this).change();
				return false;
			});	
			
			$( '.compat', view.state.module.element).each( function() {
				var e = $(this);
				
				if( e.hasClass( 'number')) {
					e.spinner( $.extend( e.data( 'options'), {
						'change' : function() { e.change(); }
					}));
				}
			});
			
			$( '>.header .group, >.body. >.block >.content >.view .group, >.footer .group', view.state.module.element).each( function() {
				var e = $(this);
				//
				e.buttonset();
				if( e.hasClass( 'vertical')) {
					$('.ui-button:first', e).removeClass('ui-corner-left').addClass('ui-corner-top');
					$('.ui-button:last', e).removeClass('ui-corner-right').addClass('ui-corner-bottom');
					/*
					  $('*:last', this).removeClass('ui-corner-right').addClass('ui-corner-bottom');
					  mw = 0; // max witdh
					  $('*', this).each(function(index){
					     w = $(this).width();
					     if (w > mw) mw = w; 
					  });
					  $('*', this).each(function(index){
					    $(this).width(mw);
					  });
					 */
				} 
			});
			
			$( 'dd[title]', view.state.module.element).each( function() {
				var dd = $(this); 
				dd.tooltip({
					position : {
						my		: "left bottom", 
						at		: "right top",
						offset 	: "5 -5",
						of		: dd.find( '>.ui-widget:first, >input:first, >button:first, >textarea:first, fieldset:first, .group:first'),
						collision : "fit fit"
					}
				}).tooltip('widget')/*.addClass("ui-state-highlight")*/;
			});

			notify( view.state.module.element);
			
			$( view.state).bind( 'changeField', changeFieldHandler);
			
				// adjust footer position
			var height = $( '>.header:first', view.state.module.element).outerHeight();
			height && view.state.module.element.find( '>.body').css( 'top', height + 'px');
			height = $( '>.footer:first', view.state.module.element).outerHeight();
			view.state.module.element.find( '>.body').css( 'bottom', (!$.ampere.util.isNaN( height) ? height : 0) + 'px');			
		};
				
		$.ampere.theme.loadTemplates( $.ampere.util.getDeferUrl( 'templates', 'theme.tmpl'));
		
		/*
					// update state views whenever a change occures 
		$('body').live( 'change input', function( event) {
			$.ampere.theme.log( 'i was changed : ', event.target);
			var e = $( event.target).closest( '.ampere.module');
			if( e.length) {
				//$( 'button.ui-button', e).button( 'refresh');
			
				notify( e);
			}
		});
		*/
	}, {
		depends : [ 'modernizr', 'jquery_ui_i18n', 'multiselect_filter', 'templates'],
		
		def : {
			jquery_ui : {
				url	 	: 'jquery-ui/jquery-ui.js',
				bare : true
			},
			jquery_ui_i18n : {
				url	 	: 'jquery-ui/i18n/jquery-ui-i18n.js',
				depends : [ 'jquery_ui'],
				bare : true
			},
			multiselect : {
				url	 : 'multiselect/jquery.multiselect.js',
				depends : [ 'jquery_ui'],
				bare : true
			},
			multiselect_filter : {
				url	 : 'multiselect/jquery.multiselect.filter.js',
				depends : [ 'multiselect', 'jquery_ui'],
				bare : true
			},
			modernizr 		: {
				url 	: 'modernizr-1.6.min.js',
				bare	: true
			},
			templates : {
				url : 'templates.js'
			}
		}
	}
));
