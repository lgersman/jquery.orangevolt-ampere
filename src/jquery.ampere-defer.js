/* 
 * Copyright (c) 2011 Lars Gersmann (lars.gersmann@gmail.com, http://orangevolt.blogspot.com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 */

jQuery.deferDef({
	ampere 			: {
		url 	: 'jquery.ampere.js',
		depends : [ 'json', 'tmplplus', 'globalization', 'datalink']
	},
	
	json 			: { 
		url 	: '../lib/json2.js',
		bare	: true
	},	
	tmpl 			: {
		url		: '../lib/jquery/plugins/jquery.tmpl.js',
		bare 	: true
	},
	tmplplus		: {
		url	 	: '../lib/jquery/plugins/jquery.tmplplus.js',
		bare 	: true,
		depends : [ 'tmpl']
	},
	
	globalization 	: {
		url 	: '../lib/jquery/plugins/jquery.globalization.js',
		bare 	: true
	},
	
	datalink	 	: {
		url		: '../lib/jquery/plugins/jquery.datalink.js',
		bare 	: true
	}
});

	// force jquery to delay the ready event
jQuery.ampere = function( callback, options) {
	jQuery.readyWait++;
	console.log( 'fake ampere invoked');
	$.when( jQuery.defer.ampere( options || {}))
	.done( function() {
		$.when( jQuery.ampere.theme())
		.done( function() { 
			jQuery.ampere( callback, options);
			jQuery.ready( true);
		})
		.fail( function() {
			jQuery.ampere.theme.log( 'fail');
		});
	})
	.fail( function() {
		jQuery.ampere.log( 'fail');
	});
};