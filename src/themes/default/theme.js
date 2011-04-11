/* 
 * Copyright (c) 2011 Lars Gersmann (lars.gersmann@gmail.com, http://orangevolt.blogspot.com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 */
((window.$deferRun || function( run ){ run( jQuery); }) (
	function( $, options) {
		// default theme

		var datalinking = {
			checkbox : function( equals) {
				$.isFunction( equals) || (equals = $.ampere.util.equals);
				
				return {
					convert     : function( value, source, target) {
						var value = undefined;
						if( source.checked) {
							var data = $.tmplItem( source).data;  
							value = data.value!==undefined ? data.value : true;
						}
						
						target[ source.name] = value;
						$.ampere.getViewTmplItem( $.tmplItem( source)).data.log(
							'set "', source.name, '"(', typeof( value) ,') in state "', target.options( 'label'), '" to ', value, ' : ', target
						);						
					},
					convertBack : function( value, source, target) {
						var data = $.tmplItem( target).data;  
						value = data.value!==undefined ? data.value : true;

						if( equals.call( target, source[ target.name], value)) {
							$.ampere.getViewTmplItem( $.tmplItem( target)).data.log(
								'set "', target, ' checked'
							);
							target.checked=true;
						}
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
								value = data.value!==undefined ? data.value : (data.label || 'on').toLowerCase();
								$(target).setField( source.name, value);
								
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
							var value= data.value!==undefined ? data.value : (data.label || 'on').toLowerCase();
							
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
						$(target).setField( source.name, !isNaN( parseFloat( source.value)) ? parseFloat( source.value) : 0);
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
							$( target).setField( source.name, value);
						} else {
							var option = source.options[ source.selectedIndex];
							$(target).setField( source.name, $( option).data( 'value'));
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

		/*'jquery-ui/themes/base/jquery-ui.css',*/
		/*'//ajax.googleapis.com/ajax/libs/jqueryui/1.8.11/themes/redmond/jquery.ui.all.css',*/	
		var styles = $.makeArray( $.ampere.options['jquery-ui-theme']).slice( 0);
		styles.push( 
			'multiselect/jquery.multiselect.css', 
			'multiselect/jquery.multiselect.filter.css',
			'theme.css'
		);
		styles.unshift( 'templates', 'jquery-ui/themes/base/jquery-ui.css');
		$.ampere.util.loadStyles.apply( this, styles);
		
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
		};
		
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
									//debugger
									if( view.state[ element.name]!=undefined && view.state[ element.name]!=null) {
										link[ element.name].convertBack( view.state[ element.name], view.state, element);
									}
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
											
											if( view.state[ element.name]!=undefined && view.state[ element.name]!=null) {
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
											
											if( view.state[ element.name]!=undefined && view.state[ element.name]!=null) {
												link[ element.name].convertBack( view.state[ element.name], view.state, element);
											}
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
												if( view.state.hasOwnProperty( element.name)) {
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
			
			$( '.group', view.state.module.element).buttonset();
			
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
			
				// adjust footer position
			var height = $( '>.header:first', view.state.module.element).outerHeight();
			height && view.state.module.element.find( '>.body').css( 'top', height + 'px');
			height = $( '>.footer:first', view.state.module.element).outerHeight();
			height && view.state.module.element.find( '>.body').css( 'bottom', height + 'px');
		};
		$.ampere.theme.loadTemplates( $.ampere.util.getDeferUrl( 'templates', 'theme.tmpl'));
		
			// update state views whenever a change occures 
		$('body').live( 'change input', function( event) {
			console.log( '(theme) i was changed : ', event.target);
			var e = $( event.target).closest( '.ampere.module');
			if( e.length) {
				//$( 'button.ui-button', e).button( 'refresh');
			
				notify( e);
			}
		});
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