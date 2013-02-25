window.shop_admin.STATES.item_edit = function item_edit( state) {
	var m = state.module();

	state.options({
		'ampere.ui.caption' : function() {
			return 'Edit ' + m.states.item_list.list.selection().caption;
		},
		'ampere.ui.icon' 	: 'icon-pencil'
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


	state.transition( 'editCareInstructions')
	.action( function( transition, ui, data) {
		var deferred = $.Deferred();

		transition.options().data = {
			description : "",
			options		: []
		};

		if( state.item.careinstructions) {
			transition.options().data.description = state.item.careinstructions.description;
			transition.options().data.options = state.item.careinstructions.options.slice();
		}

		$( '#careinstructions-dialog')
		.modal( 'show')
		.one( 'hidden', function() {
			deferred.reject();
		});
			// trigger ui to be updated
		ui.update();

		return deferred;
	})
	.options({
		'ampere.ui.caption'		: 'Care instructions',
		'ampere.ui.description'	: 'Edit care instructions',
		'ampere.ui.icon'		: 'icon-pencil',
		'commit'				: function( ui) {
			$( '#careinstructions-dialog').modal( 'hide');
				// if care instructions contains "something"
				// attach it
			var careinstructions = state.transitions.editCareInstructions.options().data;
			if( careinstructions.options.length || careinstructions.description) {
				state.item.careinstructions = careinstructions;
			} else {
				delete state.item.careinstructions;
			}
		},
		'data'					: {
			description : "",
			options		: []
		}
	});

	state.transition( 'editComposition')
	.action( function( transition, ui, data) {
		var deferred = $.Deferred();

		transition.options().data = {
			description : "",
			options		: []
		};

		if( state.item.composition) {
			transition.options().data.description = state.item.composition.description;
			transition.options().data.options = state.item.composition.options.slice();
		}

		$( '#composition-dialog')
		.modal( 'show')
		.one( 'hidden', function() {
			deferred.reject();
		});
			// trigger ui to be updated
		ui.update();

		return deferred;
	})
	.options({
		'ampere.ui.caption'		: 'Composition',
		'ampere.ui.description'	: 'Edit composition',
		'ampere.ui.icon'		: 'icon-pencil',
		'commit'				: function( ui) {
			$( '#composition-dialog').modal( 'hide');
				// if care instructions contains "something"
				// attach it
			var composition = state.transitions.editComposition.options().data;
			if( composition.options.length || composition.description) {
				state.item.composition = composition;
			} else {
				delete state.item.composition;
			}
		},
		'reorder'				: function( transition, ui, data) {
				// data[0] is the event
			var event = data[0],
			eLI = event.data.items[0],
				// adjust newPosition based on addable TR is relevant
			newPosition = event.data.position;

			var oldPosition = $( eLI).data( 'position');

			if( newPosition==oldPosition) {
				return;
			}

			var composition = state.transitions.editComposition.options().data;
				// remove item at index
			var item = composition.options.splice( oldPosition, 1)[0];

				// insert at position
			composition.options.splice( newPosition, 0, item);
		},
		'data'					: {
			description : "",
			options		: []
		}
	});

	var byName = window.ov.entity.lambda( '(item, index, out, $1) => item.name==$1');
	state.validateName = function( eInput) {
		if( eInput.checkValidity()) {
			var hits = window.ov.entity.where( m.states.item_list.list.get(), byName, state.item.name);
			if( hits.length && hits[0]!==m.states.item_list.list.selection()) {
				eInput.setCustomValidity( 'Name is already in use by another item');
			}
		}
	};

	var byCaption = window.ov.entity.lambda( '(item, index, out, $1) => item.caption==$1');
	state.validateCaption = function( eInput) {
		if( eInput.checkValidity()) {
			var hits = window.ov.entity.where( m.states.item_list.list.get(), byCaption, state.item.caption);
			if( hits.length && hits[0]!==m.states.item_list.list.selection()) {
				eInput.setCustomValidity( 'Caption is already in use by another item');
			}				
		}
	};

	state.validatePrice = function( eInput) {
		if( eInput.checkValidity()) {
			var n = parseFloat( state.item.price);
			if( !$.isNumeric( n) || n<0) {
				eInput.setCustomValidity( 'Price must be a positive floating number or 0');
			}
		}	
	};

	state.validateShipping = function( eInput) {
		if( eInput.checkValidity() && !state.item.shipping) {
			eInput.setCustomValidity( 'Shipping is required but not set');
		}	
	};

	state.getAddableStatus = function() {
		return $.grep( Object.keys( m.data.preferences.status), function( key) {
			return $.inArray( key, state.item.status)==-1;
		});		
	};

	state.getAddableCareInstructionOptions = function() {
		return $.grep( Object.keys( m.data.preferences.careinstructions), function( key) {
			return $.inArray( key, state.transitions.editCareInstructions.options().data.options)==-1;
		});		
	};

	state.transition( 'update', m.states.item_list)
	.enabled( function( transition) {
		return !angular.equals( m.states.item_list.list.selection(), state.item) &&	$('form').checkValidity();
	})
	.action( function( transition) {
		var item = angular.copy( state.item);

		var selection = transition.target().list.selection();
		var index = $.inArray( selection, m.data.items);

		return function redo( update, items_list, view) {
			m.data.items.splice( index, 1, item);
			items_list.list.selection( item);
			items_list.paginator.getPageItems.reset();

			function undo( items_list, update, view) {
				m.data.items.splice( index, 1, selection);
				items_list.paginator.getPageItems.reset();
				items_list.list.selection( selection);

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