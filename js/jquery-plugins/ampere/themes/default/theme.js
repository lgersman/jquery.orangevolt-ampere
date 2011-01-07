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
		view.state.module.element.unlink( view.state);
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
										link[ element.name] = $.ampere.link.checkbox2boolean();
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
		
		$( view.state.module.element).link( view.state, link);
			// --
		
		$( ':radio, :checkbox, :button', view.state.module.element).button();
	};
	
		// update state views whenever a change occures 
	$('body').live( 'change', function( event) {
		var e = $( event.target).closest( '.ampere.module');
		if( e.length) {
			$( 'button', e).button( 'refresh');
		}
	});
});