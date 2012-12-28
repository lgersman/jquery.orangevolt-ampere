window.shop_admin.STATES.item_edit = function item_edit( state) {
	var m = state.module();

	state.options({
		'ampere.ui.caption' : function() {
			return 'Edit ' + m.states.item_list.list.selection().caption;
		},
		'ampere-ui-icon' 	: 'icon-pencil'
	});

	state.module().breadcrumb( state, [ m.states.main, m.states.item_list]);

	state.view.load( m.getUrl( 'state_item_edit.tmpl'));

	m.cancelTransition( state, m.states.item_list)
	.action( function( transition) {
		var item = m.states.item_list.list.selection();

		return function redo() {
			m.states.item_list.list.selection( item);

			return function  undo() {
				m.states.item_list.list.selection( item);

				return redo;
			};
		};
	})
	.options({
		'ampere.ui.caption' : 'Back',
		'ampere.ui.icon' 	: 'icon-chevron-left'
	});

	state.transition( 'reset')
	.enabled( function( transition) {
		return !angular.equals( m.states.item_list.list.selection(), state.item);
	})
	.action( function( transition) {
		var item = state.item;

		return function redo() {
			state.item = angular.copy( m.states.item_list.list.selection());

			return function undo() {
				state.item = item;

				return redo;
			};
		};
	});

	var byName = window.ov.entity.lambda( '(item, index, out, $1) => item.name==$1');
	state.validateName = function( eInput) {
		if( eInput.checkValidity()) {
			//var hits = window.ov.entity.where( state.list.get(), byName, state.list.addable().item.name)
			//if( hits.length) {
			//	eInput.setCustomValidity( 'Name is already in use by another item');
			//}
		}
	};

	var byCaption = window.ov.entity.lambda( '(item, index, out, $1) => item.caption==$1');
	state.validateCaption = function( eInput) {
		if( eInput.checkValidity()) {
			//var hits = window.ov.entity.where( state.list.get(), byCaption, state.list.addable().item.caption)
			//if( hits.length) {
			//	eInput.setCustomValidity( 'Caption is already in use by another item');
			//}					
		}
	};

	state.validatePrice = function( eInput) {
		if( eInput.checkValidity()) {
			var n = parseFloat( state.item.price);
			if( !$.isNumeric( n) || n<=0) {
				eInput.setCustomValidity( 'Price must be a positive floating number');
			}
		}	
	};

	state.transition( 'update', m.states.item_list)
	.enabled( function( transition) {
		return !angular.equals( m.states.item_list.list.selection(), state.item) &&	$('form').checkValidity();
	})
	.action( function( transition) {
		var item = angular.copy( state.item);

		var selection = transition.target().list.selection();
		var index = $.inArray( selection, m.states.item_list.list.get());

		return function redo( update, list, view) {
			m.states.item_list.list.get().splice( index, 1, item);
			transition.target().list.selection( item);

			function undo( list, update, view) {
				m.states.item_list.list.get().splice( index, 1, selection);
				transition.target().list.selection( item);

				return $.Deferred().resolve( 'Item update undoed.').promise( redo);
			};
			return $.Deferred().resolve( 'Item updated.').promise( undo);
		};
	})
	.options( {
		'ampere.ui.caption' : 'Apply',
		'ampere.ui.icon'	: 'icon-save'
	});
};