/* 
 * Copyright (c) 2011 Lars Gersmann (lars.gersmann@gmail.com, http://orangevolt.blogspot.com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 */
((window.$deferRun || function( run ){ run( jQuery); }) (
	function( $, options) {
		// default theme
		
		$.ampere.util.loadStyles( 'templates',
			'jquery-ui/themes/base/jquery-ui.css',
			'multiselect/jquery.multiselect.css', 
			'multiselect/jquery.multiselect.filter.css',
			'theme.css'
		);
		
		$.ampere.theme.preRender = function( view) {
				// remove old linked data
			var viewTmplItem = view.state.module.element.find( '.state:first').tmplItem();
			if( viewTmplItem) {
				view.state.module.element.unlink( viewTmplItem.data.state);
			}
		};
		
		$.ampere.theme.postRender = function( view) {
				// link form elements to state variables
			var link = view.options( 'link');
			if( !link) {
				link = {};
				var form = view.state.module.element.find( '>form');
	
				if( form.length) {
					form = form[0];
					for ( var i = 0; i < form.elements.length; i++) {
						var element = form.elements[i];
						!$.isArray( element) || (element = element[0]);
						if( element.name && !link[ element.name]) {
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
										link[ element.name] = $.ampere.link.select.call( element, dataLink);
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
												link[ element.name] = $.ampere.link.radio.call( element, dataLink);
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
												link[ element.name] = $.ampere.link.checkbox.call( element, dataLink);
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
												link[ element.name] = $.ampere.link.number();
												if( view.state[ element.name]!=undefined && view.state[ element.name]!=null) {
													link[ element.name].convertBack( view.state[ element.name], view.state, element);
												}
												break;
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
				//debugger;
				e.button( e.data( 'options'));
			});
			
			$( 'select').each( function() {
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
			
			$( '.compat').each( function() {
				var e = $(this);
				
				if( e.hasClass( 'number')) {
					e.spinner( $.extend( e.data( 'options'), {
						'change' : function() { e.change(); }
					}));
				}
			});
			
			$( '.buttonset').buttonset();
		};
		
		$.ampere.theme.loadTemplates( $.ampere.util.getDeferUrl( 'templates', 'theme.tmpl'));
		
			// update state views whenever a change occures 
		$('body').live( 'change input', function( event) {
			var e = $( event.target).closest( '.ampere.module');
			if( e.length) {
				$( 'button', e).button( 'refresh');
			}
		});
	}, {
		depends : [ 'modernizr', 'jquery_ui_i18n', 'multiselect_filter', 'templates'],
		
		def : {
			jquery_ui : {
				url	 	: 'jquery-ui/ui/jquery-ui.js',
				bare : true
			},
			jquery_ui_i18n : {
				url	 	: 'jquery-ui/ui/i18n/jquery-ui-i18n.js',
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