window.shop_admin.STATES.item_list = function item_list( state) {
	var m = state.module();

	state.options({
		'ampere.ui.caption' : 'Items'
	});

	state.module().breadcrumb( state, [ state.module().states.main]);

	state.transition( 'details', m.states.item_list)
	.action( function( transition, ui, data) {
		var item = state.list.selection();

		return function redo( list, show, view) {
			show.item = item;
			state.list.selection( item);

			return function undo( show, list, view) {
				state.list.selection( item);

				return  redo;
			};
		};
	})
	.enabled( function() {
		return state.list.selection()!==undefined;
	})
	.options({
		'ampere.ui.caption' : 'Details'
	});

	state.list = window.ov.ampere.crud.list( 
		function() {
			return m.data.items;
		}, [
		{
			template : '{{item.name}}'
		},
		{
			template : '{{item.caption}}'
		},
		{
			template : '{{item.price}} €'
		},
		{
			template : '{{item.shipping}}'
		},
		{
			template : '{{item.keywords}}'
		}
	])
	.headers([
		{
			template : 'Name',
			orderBy  : 'name'
		},
		{
			template : 'Caption',
			orderBy  : 'caption'
		},
		{
			template : 'Price',
			orderBy  : 'price'
		},
		{
			template : 'Shipping',
			orderBy  : 'shipping'
		},
		{
			template : 'Keywords'
		}	
	])
	.filter( function( item) {
		var search = $.trim( state.filter).toLowerCase();
		return !search.length ||
			[ item.name, item.caption, item.price, item.shipping, item.keywords].join( ' ')
			.toLowerCase().indexOf( search)!=-1;
	})
	.removable( true)
	.draggable( true)
	.editable({
		template : $.noop,	
		callback : function( editable)   {
			editable.transition.target = function() {
				return m.states.item_edit;
			};
			editable.transition.action( function() {
				var item = angular.copy( state.list.selection());

				return function redo( list, edit, view) {
					edit.item = item;

					return function undo( edit, list, view) {
						return redo;
					};
				};
			});
		}
	})
	.addable({
		template : function() {
			return document.getElementById( 'addable');
		},	
		callback : function( addable)   {
			addable.transition.action( (function() {
				var action = addable.transition.action();

				return function( transition, ui, data) {
					var redo = action( transition, ui, data);

					addable.index=0;
					addable.item = {
						caption  		: '',
						price    		: 0,
						name     		: '',
						keywords 		: '',
						shipping 		: m.preferences.shipping.types[0],
						status   		: [],
						description 	: '',
						composition 	: null,
						careinstructions: null,
						options			: [],
						measurements    : [],
						stock			: []
					};
					return redo;
				};
			})())
			.enabled( function() {
				return state.list.editable().item===undefined && m.data.shipping.length;
			});
			
			var byName = window.ov.entity.lambda( '(item, index, out, $1) => item.name==$1');
			addable.validateName = function( eInput) {
				if( eInput.checkValidity()) {
					var hits = window.ov.entity.where( state.list.get(), byName, state.list.addable().item.name)
					if( hits.length) {
						eInput.setCustomValidity( 'Name is already in use by another item');
					}
				}
			};

			var byCaption = window.ov.entity.lambda( '(item, index, out, $1) => item.caption==$1');
			addable.validateCaption = function( eInput) {
				if( eInput.checkValidity()) {
					var hits = window.ov.entity.where( state.list.get(), byCaption, state.list.addable().item.caption)
					if( hits.length) {
						eInput.setCustomValidity( 'Caption is already in use by another item');
					}					
				}
			};

			addable.validatePrice = function( eInput) {
				if( eInput.checkValidity()) {
					var n = parseFloat( state.list.addable().item.price);
					if( !$.isNumeric( n) || n<=0) {
						eInput.setCustomValidity( 'Price must be a positive floating number');
					}
				}	
			};

			addable.commit
			/*
			.action( (function() {
				var action = addable.commit.action();

				return function( transition, ui, data) {
					return action( transition, ui, data);
				};
			})())
			*/
			.enabled( function() {
				return !$( 'input, select textarea').filter( function() {
					return !this.checkValidity();
				}).length;
			});
		}
	});

	state.view.load( m.getUrl( 'state_item_list.tmpl'));
};