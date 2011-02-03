/* 
 * Copyright (c) 2011 Lars Gersmann (lars.gersmann@gmail.com, http://orangevolt.blogspot.com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 */

/*
 * a theme specific javascript file is expected to contain a single wrapped function
 * 
 * the function is then called with the theme instance as "this" context
 */
(function() {
	this.preRender = function( view) {
			// remove old linked data
		var viewTmplItem = view.state.module.element.find( '.state:first').tmplItem();
		if( viewTmplItem) {
			view.state.module.element.unlink( viewTmplItem.data.state);
		}
	};
	
	this.postRender = function( view) {
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

		// select 
	this.setTemplate( 'fragments', 'select', function( jQuery, $item) {
		var $=jQuery, call, _=[], $data=$item.data;
		
		var id = jQuery.ampere.getViewTmplItem( $item).data.id( $item, null, 'select');
		
		var label = $data.label!==false ? $data.label || $.ampere.ucwords( $data.name) : false;
		if( label) {
			_.push( '<label for="', $.encode( id), '">', label || '&nbsp;', '</label>');
		}
		
		_.push( '<select id="', id, '" name="', $data.name, '"');
		
		!$data.link || (_.push( ' data-link="', $data.link,'"')); 
		
		!$data.multiple || (_.push( ' multiple="multiple"'));  
		_.push( '>');
		
		var values = $data.values;
		if( $.isFunction( values)) {
			values = values.call( $data);
		}
		
		if( $.isArray( values)) {
			values = (function() {
				var obj = {};
				for( var i=0; i<values.length; i++) {
					obj[ ''.concat( values[i])] = values[i];
				}
				return obj;
			})();
		}
		Ensure( $.ampere.theme.ensure.namespace + '.fragments.select')( $.isPlainObject( values), 'values expected to be a array, object or function returning array or object');

		for( var i in values) {
			_.push( '<option value="', $.encode( values[i]), '" data-value="', $.encode( typeof(values[i])!='string' ? JSON.stringify( values[i]): values[i]), '">', i, '</option>');
		}
		
		_.push( '</select>');
		
		return _;
	});
	
		// transition
	this.setTemplate( 'fragments', 'transition', function( jQuery, $item) {
		var $=jQuery, call, _=[], $data=$item.data;

		switch( $data.options('layout')) {
			case 'button' : 
			default 	  : {
				//debugger;
				_.push( '<button class="transition ', $.encode( $data.options('name')), '" type="button" data-options="');
				
				var options = {
					text : $data.options('title') ? $data.options('title') : false
				};
				$data.options('icon') && (options.icons = { primary : $data.options('icon')});
				_.push( $.encode( JSON.stringify( options)), '"'); 
				
				$data.isEnabled() || (_.push( 'disabled="disabled" '));
				
				_.push( '> ');
				_.push( $data.options('title')); 
				_.push( '</button>');
			} 
		}
		return _;
	});
	
		// radio
	this.setTemplate( 'fragments', 'radio', function( jQuery, $item) {
		var $=jQuery, call, _=[], $data=$item.data;

		var id = jQuery.ampere.getViewTmplItem( $item).data.id( $item, null, 'radio');
		_.push( '<label for="', $.encode( id), '">', $data.label || $.ampere.ucwords( $data.value || '&nbsp;'), '</label>');
		_.push( '<input type="radio" name="', $.encode( $data.name), '" id="', $.encode( id), '" data-options="');
		
		var options = {
			text : $data.label ? $data.label : false
		};
		$data.icon && (options.icons = { primary : $data.icon});
		_.push( $.encode( JSON.stringify( options)), '" ');

		!$data.link || (_.push( ' data-link="', $data.link,'"')); 
		
		_.push( 'value="',  $.encode( $data.value || ($data.label || 'on').toLowerCase()), '"/>');

		return _;
	});
	
		// checkbox
	this.setTemplate( 'fragments', 'checkbox', function( jQuery, $item) {
		var $=jQuery, call, _=[], $data=$item.data;

		var id = jQuery.ampere.getViewTmplItem( $item).data.id( $item, null, 'checkbox');
		_.push( '<label for="', $.encode( id), '">', $data.label || '&nbsp;', '</label>');
		_.push( '<input type="checkbox" name="', $.encode( $data.name), '" id="', $.encode( id), '" data-options="');
		
		var options = {
			text : $data.label ? $data.label : false
		};
		($data.icon===undefined || $data.icon) && (options.icons = { primary : $data.icon || 'ui-icon-check'});
		_.push( $.encode( JSON.stringify( options)), '" ');

		!$data.link || (_.push( ' data-link="', $data.link,'"')); 
		
		_.push( ' value="',  $.encode( ('' + ($data.value || true)).toLowerCase()), '"/>');

		return _;
	});
	
		// text
	this.setTemplate( 'fragments', 'text', function( jQuery, $item) {
		var $=jQuery, call, _=[], $data=$item.data;

		var id = jQuery.ampere.getViewTmplItem( $item).data.id( $item, null, $data.multiple ? 'textarea' : 'text');
		var label = $data.label!==false ? $data.label || $.ampere.ucwords( $data.name) : false;
		if( label) {
			_.push( '<label for="', $.encode( id), '">', label || '&nbsp;', '</label>');
		}
		
		if( $data.multiple) {
			_.push( '<textarea name="', $.encode( $data.name), '" id="', $.encode( id), '" data-options="');
		} else {
			_.push( '<input type="text" name="', $.encode( $data.name), '" id="', $.encode( id), '" data-options="');
		}
		
		var options = {
			required : $data.required,
			pattern  : $data.pattern
		};
		_.push( $.encode( JSON.stringify( options)), '" ');

		!$data.link   || (_.push( ' data-link="', $data.link,'"'));
		!$data.style  || (_.push( ' style="', $data.style,'"'));
		
		if( $data.multiple) {
			_.push( '>', $.encode( ('' + ($data.value || '')).toLowerCase()), '</textarea>');
		} else {
			_.push( ' value="',  $.encode( ('' + ($data.value || '')).toLowerCase()), '"/>');
		}

		return _;
	});
	
		// password
	this.setTemplate( 'fragments', 'password', function( jQuery, $item) {
		var $=jQuery, call, _=[], $data=$item.data;

		var id = jQuery.ampere.getViewTmplItem( $item).data.id( $item, null, 'password');
		var label = $data.label!==false ? $data.label || $.ampere.ucwords( $data.name) : false;
		if( label) {
			_.push( '<label for="', $.encode( id), '">', label || '&nbsp;', '</label>');
		}
		_.push( '<input type="password" name="', $.encode( $data.name), '" id="', $.encode( id), '" data-options="');
		
		var options = {
			required : $data.required
		};
		_.push( $.encode( JSON.stringify( options)), '" ');

		!$data.link   || (_.push( ' data-link="', $data.link,'"'));
		!$data.style  || (_.push( ' style="', $data.style,'"'));
		
		_.push( ' value="',  $.encode( ('' + ($data.value || '')).toLowerCase()), '"/>');

		return _;
	});
	
		// password
	this.setTemplate( 'fragments', 'number', function( jQuery, $item) {
		var $=jQuery, call, _=[], $data=$item.data;

		var id = jQuery.ampere.getViewTmplItem( $item).data.id( $item, null, 'number');
		var label = $data.label!==false ? $data.label || $.ampere.ucwords( $data.name) : false;
		if( label) {
			_.push( '<label for="', $.encode( id), '">', label || '&nbsp;', '</label>');
		}
		
		_.push( '<input type="', Modernizr.inputtypes.number ? 'number' : 'text', '" name="', $.encode( $data.name), '" id="', $.encode( id), '" data-options="');
		
		var options = {
			required : $data.required,
			step     : $data.step || 1
		};
		$data.min==undefined || (options.min=$data.min);
		$data.max==undefined || (options.max=$data.max);
		_.push( $.encode( JSON.stringify( options)), '" ');

		!$data.link   || (_.push( ' data-link="', $data.link,'"'));
		!$data.style  || (_.push( ' style="', $data.style,'"'));
		
		
		if( !Modernizr.inputtypes.number) {
			_.push( ' class="compat number"');
		} else {
			_.push( ' step="', options.step, '"');
			options.min==undefined || _.push( ' min="', options.min, '"');
			options.max==undefined || _.push( ' max="', options.max, '"');
		}
		
		_.push( ' value="',  $.encode( $data.value || 0), '"/>');
		return _;
	});
	
		// update state views whenever a change occures 
	$('body').live( 'change', function( event) {
		var e = $( event.target).closest( '.ampere.module');
		if( e.length) {
			$( 'button', e).button( 'refresh');
		}
	});
});
