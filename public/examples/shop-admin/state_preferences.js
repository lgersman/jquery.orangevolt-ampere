window.shop_admin.STATES.preferences = function preferences( state) {
	state.options({
		'ampere.ui.caption' 	: 'Preferences',
		'ampere.ui.description' : 'Preferences of shop administration.'
	});

	state.module().breadcrumb( state, [ state.module().states.main]);

	state.view( '');
	//state.view.load( state.module().getUrl( 'state_preferences.tmpl'));

	//state.transition( state.module().states.preferences_users).options( 'ampere.ui.type', 'primary');
	//state.transition( state.module().states.preferences_roles).options( 'ampere.ui.type', 'primary');
	//state.transition( state.module().states.preferences_catalogs).options( 'ampere.ui.type', 'primary');
};