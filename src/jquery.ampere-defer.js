/* 
 * Copyright (c) 2011 Lars Gersmann (lars.gersmann@gmail.com, http://orangevolt.blogspot.com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 */

jQuery.deferDef({
	ampere 			: {
		url 	: 'jquery.ampere.js',
		depends : [ 'json', 'tmplplus', 'globalization_data', 'datalink']
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
		url 	: '../lib/jquery/plugins/jquery.global.js',
		bare 	: true
	},
	
	globalization_data 	: {
		url 	: '../lib/jquery/plugins/globalization.all.js',
		bare 	: true,
		depends : [ 'globalization']
	},
	
	datalink	 	: {
		url		: '../lib/jquery/plugins/jquery.datalink.js',
		bare 	: true
	}
});

$.ampere = function( callback, options) {
	window.console && console.log && console.log( 'fake ampere invoked');
	$.when( jQuery.defer.ampere( options || {})).done( function() {
		$.when( jQuery.ampere.theme).done( function() { 
			$.ampere( callback);
		})
		.fail( function() {
			var args = $.makeArray( arguments);
			args.unshift( false);
			jQuery.ampere.ensure.apply( jQuery.ampere.ensure, args);
		});
	})
	.fail( function() {
		var ensure = $.ampere.util.ensure( 'ampere');
		var args = $.makeArray( arguments);
		args.unshift( false);
		ensure.apply( ensure, args);
	});
};