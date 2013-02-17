window.shop_admin = ov.ampere().module( function shop_admin( module) {
	module.data = {
		items : [],
		shipping : [],
		"preferences" : {
			"shipping" : {
				"size" : [
					/*
					{ 
						"name"		: "free",
						"weight"	: 0
					}
					*/
				]
			},
			"status" : {
				"running-out-of-stock" : {
					"caption" : "Running out of stock", 
					"image" : "images/badges/running-out-of-stock.png"
				},
				"new" : {
					"caption" : "New", 
					"image" : "images/badges/new.png"
				},
				"on-sale" : {
					"caption" : "On sale", 
					"image" : "images/badges/on-sale.png"
				},
				"again-available" : {
					"caption" : "Again available", 
					"image" : "images/badges/again-available.png"
				},
				"no-more-available" : {
					"caption" : "No more available", 
					"image" : "images/badges/no-more-available.png"
				}
			},
			"careinstructions" : {
				"bleach" : {
					"caption" : "Bleach"
				},
				"ironing_110" : {
					"caption" : "Ironing 110°C"
				},
				"ironing_150" : {
					"caption" : "Ironing 150°C"
				},
				"ironing_200" : {
					"caption" : "Ironing 200°C"
				},
				"handwash" : {
					"caption" : "Handwash"
				},
				"nobleaching" : {
					"caption" : "No bleaching"
				},
				"noironing" : {
					"caption" : "No ironing"
				},
				"nodrycleaning" : {
					"caption" : "No dry cleaning"
				},
				"nowetcleaning" : {
					"caption" : "No wet cleaning"
				},
				"nowash" : {
					"caption" : "No wash"
				},
				"profcleaningpce" : {
					"caption" : "Prof cleaning PCE"
				},
				"softcleaningpce" : {
					"caption" : "Soft cleaning PCE"
				},
				"oxygenbleach" : {
					"caption" : "Oxygen bleach"
				},
				"dry" : {
					"caption" : "Dry"
				},
				"dryshady" : {
					"caption" : "Dry shady"
				},
				"tumbledrying" : {
					"caption" : "Tumble drying"
				},
				"wash" : {
					"caption" : "Wash"
				},
				"wash_30" : {
					"caption" : "Wash 30°C"
				},
				"wash_30s" : {
					"caption" : "Wash 30°C soft"
				},
				"wash_30ss" : {
					"caption" : "Wash 30°C super soft"
				}
			}
		}
	};

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
			'ampere.ui.icon' 	: 'icon-chevron-left',	
			'ampere.ui.caption' : 'Back'
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
		module.data.items.push.apply( module.data.items, data.items);
		module.data.shipping.push.apply( module.data.shipping, data.shipping);
		module.data.preferences.shipping.size.push.apply( module.data.preferences.shipping.size, data.preferences.shipping.size);
	});
});

window.shop_admin.STATES = {

};
