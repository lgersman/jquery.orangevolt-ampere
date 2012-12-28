/**
 * shop_admin bootstrapper
 *
 * embed this script in the head of your html page
 * to load the shopadmin automatically
 */

var scripts = document.getElementsByTagName( 'script');
for( var i=0; i<scripts.length; i++) {
	var url = scripts[i].src;
	if( scripts[i].type=="text/javascript" && /bootstrap\.js/.test( url)) {
		var matches = url.match( /(.+)bootstrap\.js(\?(.+))?/);
		if( !matches) {
			throw new Error( "failed to eval shop_admin base url");
		}
		var baseUrl = matches[ 1];

		var CSS = [
			'css/shop_admin.css'
		];
		for( var i in CSS) {
			document.writeln( '<link rel="stylesheet" type="text/css" href="' + baseUrl + CSS[i] + '">');
		}

		var LESS = [
			'css/shop_admin.less'
		];
		for( var i in LESS) {
			document.writeln( '<link rel="stylesheet/less" href="' + baseUrl + LESS[i] + '">');
		}

		var JS = [
			'../../../src/oval.js',
			//'../../../dist/debug/oval.js',
			//'../../../dist/min/oval.js,
			'shop_admin.js',
			'state_main.js',
			'state_item_list.js',
			'state_item_edit.js',
			'state_preferences.js'
		];
		for( var i in JS) {
			var defer = (/coffeescript/.test( JS[i]) && 'defer') || '';
			document.writeln( '<script type="text/javascript" ' + defer + ' src="' + baseUrl + JS[i] + '"></script>');
		}

		break;
	}
}