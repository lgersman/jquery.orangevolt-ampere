<script id="calculator-intro" type="text/my-template">
<div>
	<center>This application represents a simple calculator implementation using <a href="#ampere">Ampere</a>.</center>
	<br>
	<center>It's kind of useless but shows the power of <a href="#ampere">Ampere</a>.</center> 
</div>
<p>
	<center>
		<button 
			class="btn-primary btn-large " 
			ng-ampere-transition="$ampere.view.state().transitions.main" 
			xtitle="Click to start">
			Start
		</button>
	</center>
</p>
</script>

<script>
	var undoredo = window.ov.ampere().module( function undoredo( module) {
		this.state( 'main', function() {
			this.value = 0;
		});
		
		this.state( 'inc')
			.transition( this.states.main)
			.action( function( transition) {
				var value = transition.target().value;

				return function inc( source, target) {
					target.value = target.value+1;
					//console.warn( 'inc called');

					return function dec( source, target) {
						source.value = value;
						//console.warn( 'dec called');

						return inc; 
					}; 
				};
			}); 
		;

		this.states.main.transition( this.states.inc);

		this.transition( module.history().undo.target)
		.action( module.history().undo)
		.enabled( module.history().canUndo)
		.options({
			'ampere.ui.caption' : function() {
				return 'Undo ' + (module.history().canUndo() ? 'enabled' : 'disabled') + ' target=' + (module.history().undo.target() && module.history().undo.target().fullName() || 'undefined');
			},
			'ampere.ui.hotkey'  : 'Ctrl+Z'
		});

		this.transition( module.history().redo.target)
		.action( module.history().redo)
		.enabled( module.history().canRedo)
		.options({
			'ampere.ui.caption' : function() {
				return 'Redo ' + (module.history().canRedo() ? 'enabled' : 'disabled') + ' target=' + (module.history().redo.target() && module.history().redo.target().fullName() || 'undefined');
			},
			'ampere.ui.hotkey'  : 'Ctrl+Y'
		});

		this.transition( module.history().reset.target)
		.action( module.history().reset)
		.enabled( module.history().canReset)
		.options({
			'ampere.ui.caption' : function() {
				return 'Reset history (undo:' + module.history().canUndo() + ', redo:' + module.history().canRedo() + ')';
			}
		});	
	}).defaults( {
		'ampere.baseurl' 		: '/lib/ampere',
		'ampere.history.limit'	: Number.MAX_VALUE
	});
	
	$( 'body').ampere( undoredo);
</script>