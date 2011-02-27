((window.$deferRun || function( run ){ run( jQuery); }) (
	function( $, options) {
			// select 
		$.ampere.theme.setTemplate( 'fragments', 'select', function( jQuery, $item) {
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
		$.ampere.theme.setTemplate( 'fragments', 'transition', function( jQuery, $item) {
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
		$.ampere.theme.setTemplate( 'fragments', 'radio', function( jQuery, $item) {
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
		$.ampere.theme.setTemplate( 'fragments', 'checkbox', function( jQuery, $item) {
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
		$.ampere.theme.setTemplate( 'fragments', 'text', function( jQuery, $item) {
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
		$.ampere.theme.setTemplate( 'fragments', 'password', function( jQuery, $item) {
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
		$.ampere.theme.setTemplate( 'fragments', 'number', function( jQuery, $item) {
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
	}
));