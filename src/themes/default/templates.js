((window.$deferRun || function( run ){ run( jQuery); }) (
	function( $, options) {
			/**
			 * adds disabled capabilites to rendered control 
			 */
		function initDisabled( tmplItem) {
			tmplItem.rendered = function() {
				if( $.isFunction( this.data.disabled)) {
					var data = this.data;
					var handler = function() {
						var disabled = data.disabled.call( this);
						return disabled;
					};
					$.data( this.nodes[0], 'notify', handler);
				} else {
					$( this.nodes[0]).attr( 'disabled', 'disabled'); 
				}
			};
		}
		
			// select 
		$.ampere.theme.setTemplate( 'fragments', 'select', function( jQuery, $item, selector) {
			var $=jQuery, call, _=[], $data=$item.data;

			var id = jQuery.ampere.getViewTmplItem( $item).data.id( $item, null, 'select');
			
			/*
			var label = $data.label!==false ? $data.label || $.ampere.util.ucwords( $data.name) : false;
			if( label) {
				_.push( '<label for="', $.encode( id), '">', label || '&nbsp;', '</label>');
			}
			*/
			_.push( '<select id="', id, '"');
			!$data.name || (_.push( ' name="', $data.name, '"'));		

			$data.disabled && initDisabled( $item); 
			
			!$data.link || (_.push( ' data-link="', $data.link, '"')); 
			
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
			$.ampere.util.ensure( $.ampere.theme.ensure.namespace + '.fragments.select')( $.isPlainObject( values), 'values expected to be a array, object or function returning array or object');
	
			for( var i in values) {
				_.push( '<option value="', $.encode( values[i]), '" data-value="', $.encode( typeof(values[i])!='string' ? JSON.stringify( values[i]): values[i]), '">', i, '</option>');
			}
			
			_.push( '</select>');
			
			return _;
		});
		
			// transition
		$.ampere.theme.setTemplate( 'fragments', 'transition', function( jQuery, $item, selector) {
			var $=jQuery, call, _=[], $data=$item.data;
			
			$.ampere.util.ensure( $.ampere.theme.ensure.namespace + '.fragments.transition')( 
				$data instanceof $.ampere.transition, 'argument expected to be a transition'
			);
	
			switch( $data.options('layout')) {
				case 'button' : 
				default 	  : {
					//debugger;
					_.push( '<button class="transition" transition="' + $.encode( $data.options('name')) + '" type="button" data-options="');
					
					var options = {
						text : $data.options('label') ? $data.options('label') : false
					};
					$data.options('icon') && (options.icons = { primary : $data.options('icon')});
					_.push( $.encode( JSON.stringify( options)), '"'); 
					
					$item.rendered = function() {
						$.data( this.nodes[0], 'notify', $.proxy( $data.disabled, $data));
					};
					
					_.push( '> ');
					_.push( $.encode( $data.options('label'))); 
					_.push( '</button>');
				} 
			}
			return _;
		});
		
			// transition
		$.ampere.theme.setTemplate( 'fragments', 'button', function( jQuery, $item, selector) {
			var $=jQuery, call, _=[], $data=$item.data || {};
			
			_.push( '<button type="button" data-options="');
			
			var options = {
				text : $data.label ? $data.label : false
			};
			$data.icon && (options.icons = { primary : $data.icon});
			_.push( $.encode( JSON.stringify( options)), '"'); 
			
			$data.disabled && initDisabled( $item);
			
			if( $.isFunction( $data.onclick)) {
				var view = jQuery.ampere.getViewTmplItem( $item).data;
				var onclick = $.proxy( $data.onclick, view.state);
				var _rendered = $item.rendered;
				$item.rendered = function() {
					$.isFunction( _rendered) && _rendered.call( this);
					$( this.nodes[0]).click( onclick);
				};
			} 
			
			_.push( '> ');
			_.push( $.encode( $data.label)); 
			_.push( '</button>');
			
			return _;
		});
		
			// radio
		$.ampere.theme.setTemplate( 'fragments', 'radio', function( jQuery, $item, selector) {
			var $=jQuery, call, _=[], $data=$item.data;
	
			var id = jQuery.ampere.getViewTmplItem( $item).data.id( $item, null, 'radio');
			_.push( '<label for="', $.encode( id), '">', $data.label!==undefined && $data.label!==null ? $data.label : $.ampere.util.ucwords( $data.value!==undefined && $data.value!==null ? $data.value : '&nbsp;'), '</label>');
			_.push( '<input type="radio"');
			!$data.name || (_.push( ' name="', $.encode( $data.name), '"'));
			
			$data.disabled && initDisabled( $item);
			
			_.push( ' id="', $.encode( id), '" data-options="');
			
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
		$.ampere.theme.setTemplate( 'fragments', 'checkbox', function( jQuery, $item, selector) {
			var $=jQuery, call, _=[], $data=$item.data;
	
			var id = jQuery.ampere.getViewTmplItem( $item).data.id( $item, null, 'checkbox');
			_.push( '<label for="', $.encode( id), '">', $data.label!==false ? $data.label||$.ampere.util.ucwords( $data.name) : '&nbsp;', '</label>');
			_.push( '<input type="checkbox"');
			!$data.name || (_.push( ' name="', $.encode( $data.name), '"'));
			
			$data.disabled && initDisabled( $item);
			
			_.push( ' id="', $.encode( id), '" data-options="');
			
			var options = {
				text : ($data.label!==false) || false
			};
			($data.icon===undefined || $data.icon) && (options.icons = { primary : $data.icon || 'ui-icon-check'});
			_.push( $.encode( JSON.stringify( options)), '" ');
	
			!$data.link || (_.push( ' data-link="', $data.link,'"')); 
			
			_.push( ' value="',  $.encode( ('' + ($data.value || true)).toLowerCase()), '"/>');
	
			return _;
		});
		
			// text
		$.ampere.theme.setTemplate( 'fragments', 'text', function( jQuery, $item, selector) {
			var $=jQuery, call, _=[], $data=$item.data;

			var id = jQuery.ampere.getViewTmplItem( $item).data.id( $item, null, $data.multiple ? 'textarea' : 'text');
			/*
			var label = $data.label!==false ? $data.label || $.ampere.util.ucwords( $data.name) : false;
			if( label) {
				_.push( '<label for="', $.encode( id), '">', label || '&nbsp;', '</label>');
			}
			*/
			if( $data.multiple) {
					// space is needed(!) otherwise tmpl engine doesnt assign tmplitem to element
				_.push( '<textarea ');
			} else {
				_.push( '<input type="text"');
			}
			$data.disabled && initDisabled( $item);
			
			$data.required && (_.push( ' required="required"'));
						
			!$data.name || (_.push( ' name="', $.encode( $data.name), '"'));
			_.push( ' id="', $.encode( id), '" data-options="');
			
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
				!$data.value || (_.push( ' value="',  $.encode( $data.value.toLowerCase())));
				_.push( '"/>');
			}
	
			return _;
		});
		
			// password
		$.ampere.theme.setTemplate( 'fragments', 'password', function( jQuery, $item, selector) {
			var $=jQuery, call, _=[], $data=$item.data;
	
			var id = jQuery.ampere.getViewTmplItem( $item).data.id( $item, null, 'password');
			/*
			var label = $data.label!==false ? $data.label || $.ampere.util.ucwords( $data.name) : false;
			if( label) {
				_.push( '<label for="', $.encode( id), '">', label || '&nbsp;', '</label>');
			}
			*/
			_.push( '<input type="password"');
			!$data.name || (_.push( ' name="', $.encode( $data.name), '"'));
			
			$data.disabled && initDisabled( $item);
			
			_.push( ' id="', $.encode( id), '" data-options="');
			
			var options = {
				required : $data.required
			};
			_.push( $.encode( JSON.stringify( options)), '" ');
	
			!$data.link   || (_.push( ' data-link="', $data.link,'"'));
			!$data.style  || (_.push( ' style="', $data.style,'"'));
			
			_.push( ' value="',  $.encode( ('' + ($data.value || '')).toLowerCase()), '"/>');
	
			return _;
		});
		
			// number
		$.ampere.theme.setTemplate( 'fragments', 'number', function( jQuery, $item, selector) {
			var $=jQuery, call, _=[], $data=$item.data;
	
			var id = jQuery.ampere.getViewTmplItem( $item).data.id( $item, null, 'number');
			/*
			var label = $data.label!==false ? $data.label || $.ampere.util.ucwords( $data.name) : false;
			if( label) {
				_.push( '<label for="', $.encode( id), '">', label || '&nbsp;', '</label>');
			}
			*/
			_.push( '<input type="', Modernizr.inputtypes.number ? 'number' : 'text', '"');
			
			$data.disabled && initDisabled( $item);
			
			!$data.name || (_.push( ' name="', $.encode( $data.name), '"'));					
			_.push( ' id="', $.encode( id), '" data-options="');
			
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
		
		$.ampere.theme.setTemplate( 'fragments', 'group', $.noop,
			$.extend( {}, $.tmpl.tag.wrap, {
				'open'	: '__.push(\'<div class="group">\');',
				'close' : '__.push(\'</div>\');'
			})
		);
		
		$.ampere.theme.setTemplate( 'fragments', 'field', function( $item, __) {

			var call=$item.calls();
			
				// find first "control"
			for( var i=0; i<__.length; i++) {
					// check for first template occurrence having an id attribute (->which is already set by the id function)
				if( typeof( __[i])!='string') {
					var _ = [ '<dt>'];
					var $data = __[i].data;
					var label = $item.args.label 
						? $item.args.label 
						: $item.args.label!==false && $data.label!==false ? $data.label || $.ampere.util.ucwords( $data.name) : false;
					if( label) {
						//var id = __[i].id || '';
						
						_.push( '<label for="'/*, id */, '" class="', $data.required ? 'required' : '', '" onclick="$( this).parent().next().children().focus()">', label, '</label>');
					}
					_.push( '</dt><dd');
					
					if( $item.args.tooltip) {
						_.push( ' title="', $.encode( $item.args.tooltip), '"');
					}
					_.push( '>');
					
					__ = _.concat( __);
					__.push( '</dd>');

					break;
				}
			}
			
			$item.rendered = function() {
				//debugger;
			};
			
			__=call._.concat( __);
			return __;
		}, {
			_default: { $2: "null" },
			open: "$item.calls(__,$1,$item.args=$2||{});__=[];",
			close: "__ = $.ampere.theme.templates.fragments.field( $item, __);"
		});
	}
));