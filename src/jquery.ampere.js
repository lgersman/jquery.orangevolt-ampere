/* 
 * Copyright (c) 2011 Lars Gersmann (lars.gersmann@gmail.com, http://orangevolt.blogspot.com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 */
((window.$deferRun || function( run ){ run( jQuery); }) (
	function( $, options) {
		$.ampere.ensure = $.ampere.util.ensure( 'ampere'); 
		$.ampere.log = $.ampere.util.log( 'ampere');
		
		$.ampere.util.loadStyles( 'ampere', 'jquery.ampere.css');
		
		var styles = ($.ampere.options.resources && $.ampere.options.resources.styles) ? $.makeArray( $.ampere.options.resources.styles) : [];
		styles.unshift( '');
		styles.length==1 || $.ampere.util.loadStyles.apply( this, styles);
	},
	{
		depends : [ 'ampere_core', 'ampere_util', 'ampere_module', 'ampere_action', 'ampere_history', 'ampere_state', 'ampere_transition', 'ampere_view', 'ampere_theme'],
		
		def : {
			ampere_core : 'jquery.ampere-core.js',
			ampere_util : {
				url 	: 'jquery.ampere-util.js',
				depends : 'ampere_core'
			},
			ampere_history		: {
				url 	: 'jquery.ampere-history.js',
				depends : 'ampere_core'
			}, 
			ampere_action		: {
				url 	: 'jquery.ampere-action.js',
				depends : 'ampere_core'
			}, 
			ampere_module		: {
				url 	: 'jquery.ampere-module.js',
				depends : 'ampere_core'
			}, 
			ampere_state		: {
				url 	: 'jquery.ampere-state.js',
				depends : 'ampere_core'
			}, 
			ampere_view		: {
				url 	: 'jquery.ampere-view.js',
				depends : 'ampere_core'
			},
			ampere_transition		: {
				url 	: 'jquery.ampere-transition.js',
				depends : 'ampere_core'
			},
			ampere_theme		: {
				url 	: 'jquery.ampere-theme.js',
				depends : [ 'ampere_core', 'ampere_util']
			}
		}
	}
));