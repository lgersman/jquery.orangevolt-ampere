<script type="text/coffeescript">
moo = ov.ampere().module 'moo', (module) -> 
	main = @state 'main', (main) ->
		console.log 'main initialized' 
	
	one = @state 'one', (one) ->
		@view '''
	<p>Hello world !!</p>
'''

	two = @state 'two'
	three = @state 'three'

	main.transition( one)
		.options 'ampere.ui.type': 'primary'
	main.transition( two)
		.options 'ampere.ui.type': 'primary'
	main.transition( three)
		.options 'ampere.ui.type': 'primary'

	one.transition two
	one.transition three
	one.transition main

	two.transition three
	two.transition main
	two.transition one

	three.transition main
	three.transition one
	three.transition two

	@transition( main)
$( 'body').ampere( new moo(), 'ampere.baseurl': '/lib/ampere')
</script>