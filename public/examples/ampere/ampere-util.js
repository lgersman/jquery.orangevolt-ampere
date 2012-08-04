;(window.ov && window.ov.ampere && window.ov.ampere.util) || (function( $) {
	window.ov.ampere.util = {
		ucwords : function ucwords( s) {
			typeof( s)=='string' || (s=''+s);
			return s ? s.replace( 
				/^(.)|\s(.)/g, 
				function($1) { 
					return $1.toUpperCase( ); 
				}
			) : s;
		}	
	}; 
})( jQuery);