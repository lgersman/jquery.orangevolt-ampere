window.shop_admin.STATES.main = function main( state) {
	state.options({
		'ampere.ui.caption' 	: null,
		'ampere.ui.icon'    	: 'icon-home',
		'ampere.ui.description'	: 'bla bla'
	});

	state.view( '');
	//state.view.load( state.module().getUrl( 'state_preferences.tmpl'));

	//state.transition( state.module().states.preferences_users).options( 'ampere.ui.type', 'primary');
	//state.transition( state.module().states.preferences_roles).options( 'ampere.ui.type', 'primary');
	//state.transition( state.module().states.preferences_catalogs).options( 'ampere.ui.type', 'primary');
};