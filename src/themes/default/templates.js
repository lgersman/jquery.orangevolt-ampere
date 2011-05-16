((window.$deferRun || function( run ){ run( jQuery); }) (
	function( $, options) {
			/**
			 * adds a handler to the $items rendered event
			 */
		function onRendered( tmplItem, callback) {
			if( !$.isFunction( tmplItem.rendered)) {
				tmplItem.rendered = function() {
					for( var i=0; i<this.rendered.handlers.length; i++) {
						this.rendered.handlers[i].call( this);
					}
				};
				tmplItem.rendered.handlers = [ callback];
			} else {
				tmplItem.rendered.handlers.push( callback);
			}
		}

		function disabledTrait() {
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
		}
		
		function linkTrait() {
			$( this.nodes).data( 'link', this.data.link);
		}
		
		function optionsTrait( options) {
			return function() {
				$( this.nodes).data( 'options', options);
			};
		}
		
		function valueTrait() {
			$( this.nodes).data( 'value', this.data.value);
		}
		
			// select 
		$.ampere.theme.setTemplate( 'fragments', 'select', function( jQuery, $item, selector) {
			var $=jQuery, call, _=[], $data=$item.data;

			var id = jQuery.ampere.getViewTmplItem( $item).data.id( $item, null, 'select');
			
			_.push( '<select id="', id, '"');
			!$data.name || (_.push( ' name="', $data.name, '"'));		

			$data.disabled && onRendered( $item, disabledTrait); 
			$data.link     && onRendered( $item, linkTrait);
			
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
				_.push( '<option value="', $.encode( values[i]), '" >', i, '</option>');
			}
			onRendered( $item, function() {
				var i=0;
				var options = this.nodes[0].options;
				for( var k in values) {
					$.data( options[i++], 'value', values[k]);
				}
			});
			
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
					_.push( '<button class="transition" transition="' + $.encode( $data.options('name')) + '" type="button"');
					
					var options = {
						text : $data.options('label') || false
					};
					$data.options('icon') && (options.icons = { primary : $data.options('icon')});
					onRendered( $item, optionsTrait( options));
					
					onRendered( $item, function() {
						$.data( this.nodes[0], 'notify', $.proxy( this.data.disabled, this.data));
					});
					
					_.push( 'title="', $.encode( $data.options('tooltip') || $data.options('label') || $data.options('name')), '"');
					
					_.push( '> ');
					_.push( $.encode( $data.options('label') || '&nbsp;')); 
					_.push( '</button>');
				} 
			}
			return _;
		});
		
			// transition
		$.ampere.theme.setTemplate( 'fragments', 'button', function( jQuery, $item, selector) {
			var $=jQuery, call, _=[], $data=$item.data || {};
			
			_.push( '<button type="button"');
			
			('id' in $data) && _.push( ' id="', $.encode( $data.id), '"');
			('name' in $data) && _.push( ' name="', $.encode( $data.name), '"');
			
			var options = {
				text : $data.label ? $data.label : false
			};
			$data.icon && (options.icons = { primary : $data.icon});
			onRendered( $item, optionsTrait( options)); 
			
			$data.disabled && onRendered( $item, disabledTrait);
			
			if( $.isFunction( $data.onclick)) {
				var view = jQuery.ampere.getViewTmplItem( $item).data;
				var onclick = $.proxy( $data.onclick, view.state);
				
				onRendered( $item, function() {
					$( this.nodes[0]).click( onclick);
				});
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
			//_.push( '<label for="', $.encode( id), '">', $data.label!==false ? $data.label||$.ampere.util.ucwords( $data.name) : '&nbsp;', '</label>');
			_.push( '<label for="', $.encode( id), '">', $data.label!==false && $data.label!==undefined && $data.label!==null ? $data.label : $.ampere.util.ucwords( $data.label!==false && $data.value!==undefined && $data.value!==null ? $data.value : '&nbsp;'), '</label>');
			_.push( '<input type="radio"');
			!$data.name || (_.push( ' name="', $.encode( $data.name), '"'));
			
			$data.disabled && onRendered( $item, disabledTrait);
			$data.link     && onRendered( $item, linkTrait);
			
			_.push( ' id="', $.encode( id), '"');
			if( $data.selected) {
				_.push( ' checked="checked"');	
			}
			
			var options = {
				text : $data.label!==false ? $data.label : false
			};
			//$data.icon && (options.icons = { primary : $data.icon});
			($data.icon===undefined || $data.icon) && (options.icons = { primary : $data.icon || 'ui-icon-check'});
			onRendered( $item, optionsTrait( options));			 
			('value' in $data) || ($data.value=($data.label || 'on').toLowerCase()); 
			onRendered( $item, valueTrait);
			
			_.push( 'value="',  $.encode( $data.value), '"/>');
	
			return _;
		});
		
			// checkbox
		$.ampere.theme.setTemplate( 'fragments', 'checkbox', function( jQuery, $item, selector) {
			var $=jQuery, call, _=[], $data=$item.data;
	
			var id = jQuery.ampere.getViewTmplItem( $item).data.id( $item, null, 'checkbox');
			_.push( '<label for="', $.encode( id), '">', $data.label!==false ? $data.label||$.ampere.util.ucwords( $data.name) : '&nbsp;', '</label>');
			_.push( '<input type="checkbox"');
			!$data.name || (_.push( ' name="', $.encode( $data.name), '"'));
			
			$data.disabled && onRendered( $item, disabledTrait);
			$data.link     && onRendered( $item, linkTrait);
			
			_.push( ' id="', $.encode( id), '" data-options="');
			
			var options = {
				text : ($data.label!==false) || false
			};
			($data.icon===undefined || $data.icon) && (options.icons = { primary : $data.icon || 'ui-icon-check'});
			onRendered( $item, optionsTrait( options));
	
			('value' in $data) || ($data.value=true);
			_.push( ' value="',  $.encode( ''+$data.value), '"/>');
			onRendered( $item, valueTrait);
	
			return _;
		});
		
			// text
		$.ampere.theme.setTemplate( 'fragments', 'text', function( jQuery, $item, selector) {
			var $=jQuery, call, _=[], $data=$item.data;

			var id = jQuery.ampere.getViewTmplItem( $item).data.id( $item, null, $data.multiple ? 'textarea' : 'text');

			if( $data.multiple) {
					// space is needed(!) otherwise tmpl engine doesnt assign tmplitem to element
				_.push( '<textarea ');
			} else {
				_.push( '<input type="text"');
			}
			$data.disabled && onRendered( $item, disabledTrait);
			$data.link     && onRendered( $item, linkTrait);
			typeof( $data.value)=='string' && onRendered( $item, valueTrait);
			
			$data.required && (_.push( ' required="required"'));
						
			!$data.name || (_.push( ' name="', $.encode( $data.name), '"'));
			_.push( ' id="', $.encode( id), '"');
			
			var options = {
				required : $data.required,
				pattern  : $data.pattern
			};
			onRendered( $item, optionsTrait( options));
	
			!$data.style  || (_.push( ' style="', $data.style,'"'));
			
			if( $data.multiple) {
				_.push( '>', $.encode( '' + ($data.value || '')), '</textarea>');
			} else {
				!$data.value || (_.push( ' value="',  $.encode( $data.value || '')));
				_.push( '"/>');
			}
	
			return _;
		});
		
			// password
		$.ampere.theme.setTemplate( 'fragments', 'password', function( jQuery, $item, selector) {
			var $=jQuery, call, _=[], $data=$item.data;
	
			var id = jQuery.ampere.getViewTmplItem( $item).data.id( $item, null, 'password');
			
			_.push( '<input type="password"');
			!$data.name || (_.push( ' name="', $.encode( $data.name), '"'));
			
			$data.disabled && onRendered( $item, disabledTrait);
			$data.link     && onRendered( $item, linkTrait);
			
			_.push( ' id="', $.encode( id), '"');
			
			var options = {
				required : $data.required
			};
			onRendered( $item, optionsTrait( options));
			typeof( $data.value)=='string' && onRendered( $item, valueTrait);
			
			!$data.style  || (_.push( ' style="', $data.style,'"'));
			
			_.push( ' value="',  $.encode( '' + $data.value || ''), '"/>');
	
			return _;
		});
		
			// number
		$.ampere.theme.setTemplate( 'fragments', 'number', function( jQuery, $item, selector) {
			var $=jQuery, call, _=[], $data=$item.data;
	
			var id = jQuery.ampere.getViewTmplItem( $item).data.id( $item, null, 'number');
			_.push( '<input type="', Modernizr.inputtypes.number ? 'number' : 'text', '"');
			
			$data.disabled && onRendered( $item, disabledTrait);
			$data.link     && onRendered( $item, linkTrait);
			
			!$data.name || (_.push( ' name="', $.encode( $data.name), '"'));					
			_.push( ' id="', $.encode( id), '"');
			
			var options = {
				required : $data.required,
				step     : $data.step || 1
			};
			('min' in $data) && (options.min=$data.min);
			('max' in $data) && (options.max=$data.max);
			onRendered( $item, optionsTrait( options));
	
			!$data.style  || (_.push( ' style="', $data.style,'"'));
			
			if( !Modernizr.inputtypes.number) {
				_.push( ' class="compat number"');
			} else {
				//debugger
				_.push( ' step="', options.step, '"');
				('min' in $data) && _.push( ' min="', options.min, '"');
				('max' in $data) && _.push( ' max="', options.max, '"');
			}
			
			('value' in $data) || ($data.value=('min' in options) && options.min>0 ? options.min : 0);
			_.push( ' value="',  $.encode( $data.value), '"/>');
			return _;
		});
		
		$.ampere.theme.setTemplate( 'fragments', 'group', function( $item, __) {

			var call=$item.calls();

			__.unshift( '<div class="group ', call.data.orientation=='vertical' ? 'vertical' : 'horizontal','">');
			__.push( '</div>');
			
			return call._.concat( __);
		}, {
			_default: { $2: "null" },
			open: "$item.calls(__,$1,$2||{});__=[];",
			close: "__ = $.ampere.theme.templates.fragments.group( $item, __);"
		});
		
		$.ampere.theme.setTemplate( 'fragments', 'field', function( $item, __) {

			var call=$item.calls();
			
				// find first "control"
			for( var i=0; i<__.length; i++) {
					// check for first template occurrence having an id attribute (->which is already set by the id function)
				if( typeof( __[i])!='string') {
					var _ = [ '<dt>'];
					var $data = __[i].data;
					
					/*
					var label = $item.args.label 
						? $item.args.label 
						: $item.args.label!==false && $data.label!==false ? $data.label || $.ampere.util.ucwords( 'name' in $data ? $data.name : '') : false;
					*/

					var label = call.data.label 
						? call.data.label 
								: call.data.label!==false && $data.label!==false ? $data.label || $.ampere.util.ucwords( 'name' in $data ? $data.name : '') : false;

					if( label) {
						//var id = __[i].id || '';
						
						_.push( '<label for="'/*, id */, '" class="', $data.required || call.data.required ? 'required' : '', '" onclick="$( this).parent().next().children().focus()">', label, '</label>');
					}
					_.push( '</dt><dd');
					
					if( call.data.tooltip) {
						_.push( ' title="', $.encode( call.data.tooltip), '"');
					}
					_.push( '>');
					
					__ = _.concat( __);
					__.push( '</dd>');

					return call._.concat( __);
				}
			}
			
			var _ = [ '<dt>'];
			var label = call.data.label ;
			if( label) {
				_.push( '<label class="', call.data.required ? 'required' : '', '" onclick="$( this).parent().next().children().focus()">', label, '</label>');
			}
			_.push( '</dt><dd');
			
			if( call.data.tooltip) {
				_.push( ' title="', $.encode( call.data.tooltip), '"');
			}
			_.push( '>');
			
			__ = _.concat( __);
			__.push( '</dd>');
			
			return call._.concat( __);
		}, {
			_default: { $2: "null" },
			open: "$item.calls(__,$1,$2||{});__=[];",
			close: "__ = $.ampere.theme.templates.fragments.field( $item, __);"
		});
	}
));