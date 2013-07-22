window.shop_admin.STATES.item_show = function item_show( state) {
	var m = state.module();

	state.options({
		'ampere.ui.caption' : function( obj, ui) {
			return m.states.item_list.list.selection().caption;
		}
	});

	state.module().breadcrumb( state, [ m.states.main, m.states.item_list]);

	state.view.load( m.getUrl( 'state_item_show.tmpl'));

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
	});

	state.transition( 'edit', m.states.item_edit)
	.action( function( transition) {
		var item = angular.copy( state.item);

		return function redo( show, edit, view) {
			edit.item = item;
			m.states.item_list.list.selection( state.item);

			return function  undo( edit, show, view) {
				m.states.item_list.list.selection( state.item);

				return redo;
			};
		};
	})
	.options({
		'ampere.ui.caption' : 'Edit'
	});
};