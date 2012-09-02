<script>
crud = ov.ampere().module( function CRUD( module) {
	module.state( function list( state) {
		this.view.load( '/examples/ampere-crud/list.fragment');

		return $.getJSON( '/examples/ampere-crud/data.json').done( function( data) {
			state.entries = data;
			state.entry   = state.entries[0];	
		});
	});

	module.state( function edit( state) {
		this.view.load( '/examples/ampere-crud/edit.fragment');
	});
	
	module.state( function create( state) {
		this.view.load( '/examples/ampere-crud/edit.fragment');
	});

	module.state( function remove( state) {
		this.view( 
			'<dl><dt>Are you really sure to remove entry <strong>{{entry.name}} {{entry.familyname}}</strong> ?</dt>'
			+'<dd><button type="reset" ng-ampere-transition="$ampere.view.state().transitions.cancel"></button> '
			+'<button type="submit" ng-ampere-transition="$ampere.view.state().transitions.remove"></button><dd></dl>'
		);
	});

	module.states.list.transition( module.states.edit)
	.enabled( function( transition) {
		return !!transition.state().entry;
	})
	.action( function( transition) {
		return function redo( list, edit, view) {
			edit.entry = angular.copy( list.entry);

			return function undo( edit, list, view) {
				return redo;
			};
		};
	})
	.options( {
		'ampere.ui.hotkey'  : 'return',
		'ampere.ui.icon'	: 'icon-pencil'
	}); 

	module.states.list.transition( module.states.remove)
	.enabled( function( transition) {
		return transition.state().entry!=undefined;
	})
	.action( function( transition) {
		return function redo( state, target, view) {
			target.entry = state.entry;

			function undo( state, target, view) {
				return redo;
			};

			return undo;
		};
	})
	.options( {
		'ampere.ui.hotkey'  : 'del'
	});
	
	module.states.list.transition( module.states.create)
	.action( function( transition) {
		return function redo( state, target, view) {
			target.entry = { name : '', familyname : '', email : ''};
			
			return function undo( state, target, view) {
				return redo;
			};
		};
	})
	.options( {
		'ampere.ui.hotkey'  	: 'Alt+Shift+N',
		'ampere.ui.type' 		: 'primary',
		'ampere.ui.icon' 		: 'icon-magic',
		'ampere.ui.description'	: 'Create a new entry.'
	}); 
	
	module.states.edit.transition( 'cancel', module.states.list).options( {'ampere.ui.hotkey' : 'esc'});
	module.states.edit.transition( 'save', module.states.list)
	.enabled( function( transition) {
		return !angular.equals( transition.target().module().states.list.entry, transition.state().entry) 
		&& $('form')[0].checkValidity();
	})
	.action( function( transition) {
		var orig  = angular.copy( transition.target().entry);
		var entry = angular.copy( transition.state().entry);
		
		return function redo( edit, list, view) {
			angular.extend( list.entry, entry);

			function undo( list, edit, view) {
				angular.extend( list.entry, orig);
				edit.entry = entry;
				
				return $.Deferred().resolve( 'Entry update undoed.').promise( redo);
			};
			return $.Deferred().resolve( 'Entry updated.').promise( undo);
		};
	})
	.options( {
		'ampere.ui.hotkey'  	: 'Ctrl+S'
	});
	
	module.states.edit.transition( 'reset')
	.enabled( function( transition) {
		return !angular.equals( transition.target().module().states.list.entry, transition.state().entry);
	})
	.action( module.current.reset);

	module.states.create.transition( 'cancel', module.states.list).options( {'ampere.ui.hotkey' : 'esc'});
	module.states.create.transition( 'create', module.states.list)
	.enabled( function( transition) {
		return !angular.equals( transition.target().module().states.list.entry, transition.state().entry) 
		&& $('form')[0].checkValidity();
	})
	.action( function( transition) {
		var orig  = transition.target().entry;
		var entry = angular.copy( transition.state().entry);
		
		return function redo( create, list, view) {
			list.entries.push( list.entry = entry); 
				
			function undo( list, create, view) {
				list.entries.pop();
				list.entry = orig;
					
				return $.Deferred().resolve( 'Entry create undoed.').promise( redo);
			};
			return $.Deferred().resolve( 'Entry created.').promise( undo);
		};		 
	});	
	module.states.create.transition( 'reset', module.states.create)
	.enabled( function( transition) {
		return !angular.equals( transition.target().module().states.list.entry, transition.state().entry);
	})
	.action( module.current.reset);
	
	module.states.remove.transition( 'cancel', module.states.list).options( {'ampere.ui.hotkey' : 'esc'});
	module.states.remove.transition( 'remove', module.states.list)
	.action( function( transition) {
		var entry = transition.target().entry;
		var index = $.inArray( entry, transition.target().entries);
		var orig  = transition.target().entry; 
			
		return function redo( remove, list, view) {
			list.entries.splice( index, 1); 
			delete list.entry;
				
			return function undo( list, remove, view) {
				list.entries.splice( index, 0, entry);
				list.entry = orig;
				
				return redo;
			};
		};
	});

	this.transition( module.history().undo.target)
	.action( module.history().undo)
	.enabled( module.history().canUndo)
	.options({
		'ampere.ui.caption' : 'Undo',
		'ampere.ui.hotkey'  : 'ctrl+Z',
		'ampere.ui.icon' 	: 'icon-undo'
	});

	this.transition( module.history().redo.target)
	.action( module.history().redo)
	.enabled( module.history().canRedo)
	.options({
		'ampere.ui.caption' : 'Redo',
		'ampere.ui.hotkey'  : 'ctrl+Y',
		'ampere.ui.icon' 	: 'icon-repeat'
	});	

	this.transition( module.history().reset.target)
	.action( module.history().reset)
	.enabled( module.history().canReset)
	.options({
		'ampere.ui.caption' : function() {
			return 'Reset history (undo:' + module.history().canUndo() + ', redo:' + module.history().canRedo() + ')';
		}
	});	
});  

$( 'body').ampere( crud, { 'ampere.baseurl' : '/lib/ampere', 'ampere.state' : 'list', 'ampere.history.limit' : Number.MAX_VALUE});
</script>
