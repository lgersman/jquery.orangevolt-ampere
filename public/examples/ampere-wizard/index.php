<script id="wizard-main" type="text/template">
	<h4>
		Press <strong>Enter</strong> to continue.
	</h4>

	<div ng-include="'/examples/ampere-wizard/toolbar.fragment'"></div>
</script>
<script id="wizard-firstname" type="text/template">
	<form>
		<dl>
			<dt>
				First name:
			</dt>
			<dd>
				<input ng-model="value" type="text" required>
			</dd>	
		</dl>
	</form>

	<div ng-include="'/examples/ampere-wizard/toolbar.fragment'"></div>
</script>
<script id="wizard-familyname" type="text/template">
	<form>
		<dl>
			<dt>
				Family name:
			</dt>
			<dd>
				<input ng-model="value" type="text" required>
			</dd>	
		</dl>
	</form>

	<div ng-include="'/examples/ampere-wizard/toolbar.fragment'"></div>
</script>
<script id="wizard-email" type="text/template">
	<form>
		<dl>
			<dt>
				Email:
			</dt>
			<dd>
				<input ng-model="value" type="email" required>
			</dd>	
		</dl>
	</form>

	<div ng-include="'/examples/ampere-wizard/toolbar.fragment'"></div>
</script>
<script id="wizard-finish" type="text/template">
	<div>
		<h4>The wizard collected the following data</h4>
		<dl>
			<dt>
				First name:
			</dt>
			<dd>
				{{$ampere.module.states.firstname.value}}
			</dd>	
			<dt>
				Family name:
			</dt>
			<dd>
				{{$ampere.module.states.familyname.value}}
			</dd>	
			<dt>
				Email:
			</dt>
			<dd>
				{{$ampere.module.states.email.value}}
			</dd>	
		</dl>
		<section>
			Click <button class="btn-primary" ng-ampere-transition="$ampere.view.state().transitions.next"></button>
			to create new entry.
		</section>
	</div>

	<div ng-include="'/examples/ampere-wizard/toolbar.fragment'"></div>
</script>
<script id="wizard-finished" type="text/template">
	<div>
		<section>
			{{$ampere.module.states.firstname.value}}
			{{$ampere.module.states.familyname.value}}
			({{$ampere.module.states.email.value}}) 
		</section>
		<h4>Entry successfully created.</h4>
		<section>
			Click <button class="btn-primary" ng-ampere-transition="$ampere.view.state().transitions.next"></button>
			to create another entry.
		</section>
	</div>

	<div ng-include="'/examples/ampere-wizard/toolbar.fragment'"></div>
</script>

<script>
var wizard = ov.ampere().module( function wizard( module) {
	module.state( function main() {
		this.view( document.getElementById( 'wizard-main'));
	})
	.options({
		'ampere.ui.caption' : null
	});
	
	module.state( function firstname() {
		this.view( document.getElementById( 'wizard-firstname'));
	})
	.options({
		'ampere.ui.caption' : 'First name'
	});
	
	module.state( function familyname() {
		this.view( document.getElementById( 'wizard-familyname'));
	})
	.options({
		'ampere.ui.caption' : 'Family name'
	});
	
	module.state( function email() {
		this.view( document.getElementById( 'wizard-email'));
	})
	.options({
		'ampere.ui.caption' : 'Email'
	});
	
	module.state( function finish() {
		this.view( document.getElementById( 'wizard-finish'));
	})
	.options({
		'ampere.ui.caption' : null
	});

	module.state( function finished() {
		this.view( document.getElementById( 'wizard-finished'));
	})
	.options({
		'ampere.ui.caption' : null
	});

	module.states.main.transition( 'next', module.states.firstname)
	.options({
		'ampere.ui.caption' : 'Next',
		'ampere.ui.hotkey'  : 'Return',
		'ampere.ui.icon' 	: 'icon-chevron-right'
	}); 

	module.states.firstname.transition( 'next', module.states.familyname)
	.enabled( function( transition) {
		return $('form')[0].checkValidity();
	})
	.options({
		'ampere.ui.caption' : 'Next',
		'ampere.ui.hotkey'  : 'Return',
		'ampere.ui.icon' 	: 'icon-chevron-right'
	}); 

	module.states.familyname.transition( 'next', module.states.email)
	.enabled( function( transition) {
		return $('form')[0].checkValidity();
	})
	.options({
		'ampere.ui.caption' : 'Next',
		'ampere.ui.hotkey'  : 'Return',
		'ampere.ui.icon' 	: 'icon-chevron-right'
	});

	module.states.email.transition( 'next', module.states.finish)
	.enabled( function( transition) {
		return $('form')[0].checkValidity();
	})
	.options({
		'ampere.ui.caption' : 'Next',
		'ampere.ui.hotkey'  : 'Return',
		'ampere.ui.icon' 	: 'icon-chevron-right'
	});

	module.states.finish.transition( 'next', module.states.finished)
	.action( function( transition) {
		return function redo( finish, finished, view) {
			window.parent.postMessage( {
				name 		: module.states.firstname.value,
				familyname 	: module.states.familyname.value,
				email		: module.states.email.value
			}, window.parent.location.origin);
			return $.Deferred().resolve( 'Entry created.').promise();
		};
	})
	.options({
		'ampere.ui.hotkey'  : 'Return',
		'ampere.ui.icon' 	: 'icon-chevron-right',
		'ampere.ui.caption' : 'Finish'
	});

	module.states.finished.transition( 'next', module.states.firstname)
	.action( function( transition) {
		return function redo( finish, finished, view) {
			delete module.states.firstname.value;
			delete module.states.familyname.value;
			delete module.states.email.value;
			  
			return $.Deferred().resolve( 'Erased previous entries.').promise();
		};
	})
	.options({
		'ampere.ui.hotkey'  : 'Return',
		'ampere.ui.icon' 	: ' icon-magic',
		'ampere.ui.caption' : 'Create another entry'
	});  
	
	this.transition( 'back', module.history().undo.target)
	.action( module.history().undo)
	.enabled( module.history().canUndo)
	.options({
		'ampere.ui.caption'  : 'Back',
		'ampere.ui.hotkey'  : 'left',
		'ampere.ui.icon' 	: 'icon-chevron-left',
		'ampere.ui.type'	: null				// default type for module transitions would be 'global'
	});

		//add cancel transition when called from crud example 
	if( window.top!==window.self) {
			/*
			 * target module.states.main is more or less non sense
			 * because the containing ampere module should close the 
			 * iframe containing this ampere app 
			 */ 
		this.transition( 'cancel', module.states.main)
		.action( function() {
			return function redo() {
				window.parent.postMessage( 'wizard.cancel', '*');
			};
		})
		.options({
			'ampere.ui.caption' : 'Cancel',
			'ampere.ui.hotkey'  : 'Esc',
			'ampere.ui.icon' 	: 'icon-remove',
			'ampere.ui.type'	: undefined				// default type for module transitions would be 'global'
		});
	}
	
	this.options({
		'ampere.ui.caption' 	: 'Entry wizard',
		'ampere.ui.description' : 'This wizard guides you through the creation of a new entry.'
	});
});  

$( 'body')
.ampere( wizard, { 'ampere.baseurl' : '/lib/ampere', 'ampere.history.limit' : Number.MAX_VALUE});

$( 'html, body').css( 'overflow','auto');
</script>
