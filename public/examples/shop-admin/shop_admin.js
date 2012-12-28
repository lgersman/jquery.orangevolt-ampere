window.shop_admin = ov.ampere().module( function shop_admin( module) {
	module.data = {
		items : [],
		shipping : []
	};

	module.preferences = {
		shipping : {
			types : [ 'envelope', 'parcel']
		}
	}

	module.getUrl = function getUrl( path) {
		return module.options( 'shop_admin.baseurl') + '/' + path;
	};

	/*
		 * creates the breadcrumb transitions
		 *
		 * @param state the current state
		 * @param parents the array of parents
		 */
	module.breadcrumb = function breadcrumb( state, parents) {
		for( var i in (parents||[])) {
			var transition;

			if( $.isFunction( parents[i])) {
				transition = parents[i].call( state, state);
			} else {
				transition = state.transition( parents[i]);
			}	 

			transition.options({
				'ampere.ui.type' : 'breadcrumb'
			});
		}
		state.transition().options({
			'ampere.ui.type' 	: 'breadcrumb',
			'ampere.ui.caption' : state.options( 'ampere.ui.caption'),
			'ampere.ui.icon' 	: state.options( 'ampere.ui.icon')
		}).enabled( false);
	};

		/*
		 * creates a cancel transition
		 *
		 * @param state current state
		 * @param target target state of the cancel transition
		 */
	module.cancelTransition = function cancelTransition( state, target) {
		return state.transition( 'cancel', target)
		.options({
		//	'ampere.ui.hotkey' 	: 'esc',
			'ampere.ui.caption' : 'Cancel',
			'ampere.ui.icon' 	: null
		});
	};

	module.state( window.shop_admin.STATES);

	module.transition( module.states.item_list)
	.active( function() {
		var current = module.current().state.name();
		return !/^preferences/.test( current) && !/^main/.test( current);
	})
	.options({
		'ampere.ui.type' 	: 'global'
	});

	module.transition( module.states.preferences)
	.active( function() {
		var current = module.current().state.name();
		return /^preferences/.test( current) && !/^main/.test( current);
	})
	.options({
		'ampere.ui.type' : 'global'
	});

	module.transition( module.history().undo.target)
	.action( module.history().undo)
	.enabled( module.history().canUndo)
	.options({
		'ampere.ui.caption' : 'Undo',
		'ampere.ui.hotkey'  : 'ctrl+Z',
		'ampere.ui.icon' 	: 'icon-undo',
		'ampere.ui.type' 	: null
	});

	module.transition( module.history().redo.target)
	.action( module.history().redo)
	.enabled( module.history().canRedo)
	.options({
		'ampere.ui.caption' : 'Redo',
		'ampere.ui.hotkey'  : 'ctrl+Y',
		'ampere.ui.icon' 	: 'icon-repeat',
		'ampere.ui.type' 	: null
	});

	/*
		 * this transition is exclusively used as
		 * value for option 'ampere.ui.about.url'
		 */
	var aboutUrl = module.transition( 'about', module.states.main)
	.enabled( function( transition) {
		return module.current().state!=module.states.main;
	})
	.options({
		'ampere.ui.caption'			: function() {
			return 'admin@demostore';
		},
		'ampere.ui.description'		: 'Go to dashboard.',
		'ampere.ui.type'			: null,			// null prevents this state from being rendering somewhere automatically
		'ampere.ui.icon'			: null			// no icon for this state (overrides the icon of the state)
	});
	module.options({
		'ampere.ui.caption'		: 'Shop administration',
		'ampere.ui.about' 		: 'This is a sample <a target="_blank" href="https://github.com/lgersman/jquery.orangevolt-ampere">Ampere</a> application.',
		'ampere.ui.about.url'	: aboutUrl
	});

	return $.getJSON( 'googledocs.json')
	.done( function( data) {
		$.extend( module.data, data);
	});
});

window.shop_admin.STATES = {

};
