describe( 'Ampere', function() {
	it( "should create an instance", function() {
	    var ampere = new window.ov.ampere().options( 'foo', 'bar');
	    expect( ampere).toBeDefined();
	    
	    var ampere2 = new window.ov.ampere().options( 'fooz', 'baaz');
	    expect( ampere.options( 'foo')).toBeDefined();
	    
	    expect( ampere2.options( 'fooz')).toBeDefined();
	    expect( ampere2.options( 'foo')).not.toBeDefined();
	});
	
	it( "should create 2 independent instances", function() {
	    var ampere = window.ov.ampere();
	    var hello = ampere.module( 'hello', $.noop);
	    
	    var ampere2 = window.ov.ampere();
	    
	    expect( ampere).not.toBe( ampere2);
	});
	
	describe( 'Module', function() {
		it( 'creates an module without any states', function() {
			var ampere = window.ov.ampere();
		    var hello = ampere.module( 'hello', $.noop);
		    
		    expect( function() { 
		    	new hello(); 
		    }).toThrow();
		});
		
		describe( 'Transitions', function() {
			it( 'should have options', function() {
				var m = window.ov.ampere().module( function m() {
					this.state( 'main');
					
					this.transition( this.states.main)
						.options( 'foo', 'bar')
						.options( { 'rum' : 'kugel'})
					;
				});
				
				m = new m();
				expect( m.transitions.main.options( 'foo')).toEqual( 'bar');
				expect( m.transitions.main.options()).toEqual( { foo:'bar', rum:'kugel'});
			});
			
			it( 'should take a enabled function', function() {
				var m = window.ov.ampere().module( function m() {
					this.state( 'main');
					
					this.transition( this.states.main)
						.enabled( function() { return 'I am enabled'; })
						.options( 'foo', 'bar')
						.options( { 'rum' : 'kugel'})
					;
				});
				
				m = new m();
				
				expect( m.transitions.main.enabled()).toEqual( 'I am enabled');
				
				m.transitions.main.enabled( function() { return "hey!"; });
				expect( m.transitions.main.enabled()).toEqual( 'hey!');
			});
		});
	});
	
	describe( 'States', function() {
		it( 'should have options', function() {
			var m = window.ov.ampere().module( function m() {
				this.state( 'main')
				.options( 'foo', 'bar')
				.options( { 'rum' : 'kugel'});
			});
			
			m = new m();
			
			expect( m.states.main.options( 'foo')).toEqual( 'bar');
		});
	});
	
	describe( 'Transitions', function() {
		it( 'should have options', function() {
			var m = window.ov.ampere().module( function m() {
				this.state( 'main')
					.transition( this.states.main)
					.options( 'foo', 'bar')
					.options( { 'rum' : 'kugel'})
				;
			});
			
			m = new m();
			
			expect( m.states.main.transitions.main.options( 'foo')).toEqual( 'bar');
			expect( m.states.main.transitions.main.options()).toEqual( { foo:'bar', rum:'kugel'});
		});
		
		it( 'should take a enabled function', function() {
			var m = window.ov.ampere().module( function m() {
				this.state( 'main')
					.transition( this.states.main)
					.enabled( function() { return 'i am enabled'; })
					.options( 'foo', 'bar')
					.options( { 'rum' : 'kugel'})
				;
			});
			
			m = new m();
			
			expect( m.states.main.transitions.main.enabled()).toEqual( 'i am enabled');
			
			m.states.main.transitions.main.enabled( function() { return "hey!"; });
			expect( m.states.main.transitions.main.enabled()).toEqual( 'hey!');
		});
		
		it( 'should take a action function', function() {
			function myaction() { };
			
			var m = window.ov.ampere().module( function m() {
				this.state( 'main')
					.transition( this.states.main)
					.action( myaction)
				;
			});
			
			m = new m();
			
			expect( m.states.main.transitions.main.action()).toEqual( myaction);
			
			m.states.main.transitions.main.enabled( function() { return "hey!"; });
			expect( m.states.main.transitions.main.enabled()).toEqual( 'hey!');
		});
	});
	
	describe( 'Views', function() {
		it( 'should be accessible', function() {
			var m = window.ov.ampere().module( function m() {
				this.state( 'main')
					.view( 'main', function() {
						return $('<div>').text( 'hello world !');
					}).options( { mee : 'too'})
				.state()
					.view( function intro() {
						return $('<div>').text( 'hello world !');
					})
				.state()
					.view( 'quit', function() {
						return $('<div>').text( 'hello world !');
					})
				;
			});	
			m = new m();
			expect( Object.keys( m.states.main.views)).toEqual( [ 'main', 'intro', 'quit']);
			
			expect( m.states.main.views.main.options('mee')).toEqual( 'too');
		});
	});
	
	describe( 'UiController', function() {
		it( 'default state', function() {
			var m = window.ov.ampere().module( function m() {
				this.state( 'main');
			});	
			m = new m();
			
			var div = $( '<div>').ampere( m);
			expect( div.ampere().module.current().state).toEqual( m.states.main);
			
			div.remove();
		});
		
		it( 'state configured as string', function() {	
				// default state configured at ampere instance
			var m = window.ov.ampere()
			.options( { 'ampere.state':'b' })
			.module( function m() {
				this.state( 'a');
				this.state( 'b');
				this.state( 'c');
				this.state( 'd');
				this.state( 'e');
			});	
			var div = $( '<div>').ampere( new m());
			expect( div.ampere().module.current().state).toEqual( div.ampere().module.states.b);
			
			m.defaults({ 'ampere.state' : 'c'});
			
			var div = $( '<div>').ampere( new m());
			
			expect( div.ampere().module.current().state).toEqual( div.ampere().module.states.c);
			
			var div = $( '<div>').ampere( new m( { 'ampere.state' : 'd'}));
			expect( div.ampere().module.current().state).toEqual( div.ampere().module.states.d);
			
			expect( function() {
				var div = $( '<div>').ampere( new m( { 'ampere.state' : 'k'}));
			}).toThrow();
		});
		
		it( 'state unconfigured', function() {	
			var m = window.ov.ampere()
			.module( function m() {
				this.state( 'a');
				this.state( 'b');
			});	

			var _m = new m();
			var div = $( '<div>').ampere( _m, { 'ampere.state' : _m.states.b});
			expect( div.ampere().module.current().state).toEqual( _m.states.b);
		});
	});
});