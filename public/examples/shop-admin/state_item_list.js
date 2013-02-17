window.shop_admin.STATES.item_list = function item_list( state) {
	var m = state.module();

	state.options({
		'ampere.ui.caption' : 'Items'
	});

	state.module().breadcrumb( state, [ state.module().states.main]);

	state.transition( 'details', m.states.item_show)
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

	state.validateShipping = function( eInput) {
		if( eInput.checkValidity() && !state.list.getEditingContext().item.shipping) {
			eInput.setCustomValidity( 'Shipping is required but not set');
		}	
	};

	state.paginator = ov.ampere.crud.paginator( function() {
		return m.data.items;
	}, {
		_itemCountPerPage : 5
	})
	.filter( function( item) {
		var search = $.trim( state.filter).toLowerCase();
		return !search.length ||
			[ item.name, item.caption, item.price, item.shipping, item.keywords].join( ' ')
			.toLowerCase().indexOf( search)!=-1;
	});
		// override getPageItems to make paginator result chacheable
	state.paginator.getPageItems = (function( getPageItemsFn) {
		var pageItems, 
			conditions = {};

		var getPageItems = function() {
			if( 
				conditions.data!==m.data.items ||
				conditions.filter!==state.filter ||
				conditions.orderBy!==state.list.sortable().orderBy ||
				conditions.reverse!==state.list.sortable().reverse
			) {
				conditions.data=m.data.items;
				conditions.filter=state.filter;
				conditions.orderBy=state.list.sortable().orderBy;
				conditions.reverse=state.list.sortable().reverse;

					// get filtered page items
				pageItems = getPageItemsFn.call( this);

					// order page items
				window.ov.entity.sort( pageItems, state.list.sortable().orderBy, state.list.sortable().reverse);
			} else {
					 // adjust currentPageNumber if needed
	 			var pageCount = this.getItemCountPerPage()===Infinity || this.getItemCountPerPage()<1 ? 1 : Math.ceil( pageItems.length / this.getItemCountPerPage());
	 			if( this._currentPageNumber>pageCount) {
	 				this._currentPageNumber = pageCount || 1;
	 			}
			}

			return pageItems;
		};
		getPageItems.reset = function() {
			conditions = {};
		};

		return getPageItems;
	})( state.paginator.getPageItems);

	state.list = window.ov.ampere.crud.list( 
		state.paginator.getCurrentPageItems, [
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
	.sortable( false, true, true)		// tell list that sorting is managed by someone else (-> the paginator in our case)
	.splice( function( ofs) {
		var ofs = state.paginator.getItemCountPerPage()*(state.paginator.currentPageNumber()-1) + ofs;
		state.paginator.getPageItems.reset();
		return Array.prototype.splice.apply( state.paginator.get(), arguments);
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
						shipping 		: '',
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
					if( !$.isNumeric( n) || n<0) {
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