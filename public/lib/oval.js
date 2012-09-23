/**
 * OrangeVolt Ampere Loader
 * 
 * embed this script in the head of your html page
 * to load all Orangevolt Ampere dependencies automatically 
 */

	// find oval.js 
var scripts = document.getElementsByTagName( 'script');
for( var i=0; i<scripts.length; i++) {
	var url = scripts[i].src;
	if( /oval.js/.test( url)) {
		var matches = url.match( /(.+)oval\.js(\?(.+))?/);
		if( !matches) {
			throw new Error( "failed to eval ampere base url");
		}
		var baseUrl = matches[ 1];
		
		var CSS = [	
			'bootstrap-2.1.1/css/bootstrap.css',
			'Font-Awesome/css/font-awesome.css',
			'bootstrap-2.1.1/css/bootstrap-responsive.css',	
			'ampere/ampere-ui-twitterbootstrap.css',
			'colorpicker/css/colorpicker.css',
			'datepicker/css/datepicker.css',
			
		];
		for( var i in CSS) {
			document.writeln( '<link rel="stylesheet" type="text/css" href="' + baseUrl + CSS[i] + '">');
		}
		
		var LESS = [
			'ampere/ampere-ui-twitterbootstrap.less'
		];
		for( var i in LESS) {
			document.writeln( '<link rel="stylesheet/less" href="' + baseUrl + LESS[i] + '">');
		}
		
		var JS = [
			'coffeescript-1.3.3.js',
			'modernizr-2.6.2.js',
			'lesscss-1.3.0.js',
			'jquery-1.7.2.js',
			'bootstrap-2.1.1/js/bootstrap.js',
			'jquery.sortable.js',
			'datepicker/js/bootstrap-datepicker.js',
			'colorpicker/js/bootstrap-colorpicker.js',
			
			'angular/angular-1.0.1.js',
			'angular/angular-cookies-1.0.1.js',
			'angular/angular-loader-1.0.1.js',
			'angular/angular-resource-1.0.1.js',

			'ampere/compat.js',
			'ampere/json.js',
			'ampere/namespace.js',
			'ampere/jquery.upload.js',
			'ampere/ampere.js',
			'ampere/ampere-util.js',
			'ampere/ampere-ui-twitterbootstrap.js',
			'ampere/ampere-ui-hotkey.js'	
		];
		for( var i in JS) {
			document.writeln( '<script type="text/javascript" src="' + baseUrl + JS[i] + '"></script>');
		}
	}
}