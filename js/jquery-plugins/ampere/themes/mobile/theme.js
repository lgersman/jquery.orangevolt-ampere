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
							case 'INPUT'  : {
								switch( $(element).attr( 'type')) {
									case 'radio' 	: {
										link[ element.name] = $.ampere.link.radio();
										
										if( view.state[ element.name]!=undefined && view.state[ element.name]!=null) {
											link[ element.name].convertBack( view.state[ element.name], view.state, element);
										}
										break;
									}
									case 'checkbox' : {
										link[ element.name] = $.ampere.link.checkbox();
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
									default 		: 
									case 'text' 	: {
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
		//debugger;
		view.state.module.element.link( view.state, link);
			// --
		/*
		$( ':radio, :checkbox, :button', view.state.module.element).each( function() {
			var e = $(this);
			e.button( e.data( 'options'));
		});
		
		$( 'select').each( function() {
			var e = $(this);
			var options = $.extend({ 
					header 	 		: false, 
					multiple 		: this.multiple,
					noneSelectedText: "",
					selectedList	: 4,
					click 	 		: !this.multiple ? function() { $(this).multiselect("close");} : $.noop
				}, 
				e.data('options') || {}
			);
			
			e.multiselect( options);
		});
		
		$( '.buttonset').buttonset();
		*/
		
		$( '#app_container').page();
		$( '#app_container').addClass( $.mobile.activePageClass);
		$.mobile.activePage = $( '#app_container');
	};
	
	$.ampere.theme.templates.fragments.myselect = function( jQuery, $item) {
		var $=jQuery, call, _=[], $data=$item.data;
		with( $data) {
			/*
			_.push('<p> ');
		
			if(true) { 
				_=_.concat(
					$item.nest(
						$.ampere.theme.templates.fragments.select,
						{ label : 'House pet:', name : 'accepted'}
					)
				);
			}
			_.push(' </p>');*/
			
			// $item.nest($.ampere.theme.templates.fragments.history, state.module)
			
			var id = jQuery.ampere.getViewTmplItem( $item).data.id( $item, null, 'select');
			
			if( label!==undefined) {
				_.push( '<label for="', id, '">', label, '</label>');
			}
			
			_.push( '<select id="', id, '", name="', name);
			!$data.multiple || (_.push( ' multiple="multiple"'));  
			_.push( '">');
			_.push( '<option>Dog</option>', '<option>Cat</option>', '<option>Bird</option>'); 
			_.push( '</select>');
			
		}
		return _;
	};
	
	$.tmpl.tag[ 'myselect'] = $.extend( 
		{}, 
		$.tmpl.tag.tmpl, 
		{ 
			open : $.tmpl.tag.tmpl.open.replace( '$1', '$.ampere.theme.templates.fragments.myselect')
		}
	);
	
		// update state views whenever a change occures 
	$('body').live( 'change', function( event) {
		var e = $( event.target).closest( '.ampere.module');
		if( e.length) {
			//$( 'button', e).button( 'refresh');
		}
	});
});