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
				
				expect( m.transitions[0].options( 'foo')).toEqual( 'bar');
				expect( m.transitions[0].options()).toEqual( { foo:'bar', rum:'kugel'});
			});
			
			it( 'should take a isDisabled function', function() {
				var m = window.ov.ampere().module( function m() {
					this.state( 'main');
					
					this.transition( this.states.main)
						.isDisabled( function() { return 'i am disabled'; })
						.options( 'foo', 'bar')
						.options( { 'rum' : 'kugel'})
					;
				});
				
				m = new m();
				
				expect( m.transitions[0].isDisabled()).toEqual( 'i am disabled');
				
				expect( function() {
					m.transitions[0].isDisabled( "rumps");
				}).toThrow();
				
				m.transitions[0].isDisabled( function() { return "hey!"; });
				expect( m.transitions[0].isDisabled()).toEqual( 'hey!');
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
			
			expect( m.states.main.transitions[0].options( 'foo')).toEqual( 'bar');
			expect( m.states.main.transitions[0].options()).toEqual( { foo:'bar', rum:'kugel'});
		});
		
		it( 'should take a isDisabled function', function() {
			var m = window.ov.ampere().module( function m() {
				this.state( 'main')
					.transition( this.states.main)
					.isDisabled( function() { return 'i am disabled'; })
					.options( 'foo', 'bar')
					.options( { 'rum' : 'kugel'})
				;
			});
			
			m = new m();
			
			expect( m.states.main.transitions[0].isDisabled()).toEqual( 'i am disabled');
			
			expect( function() {
				m.states.main.transitions[0].isDisabled( "rumps");
			}).toThrow();
			
			m.states.main.transitions[0].isDisabled( function() { return "hey!"; });
			expect( m.states.main.transitions[0].isDisabled()).toEqual( 'hey!');
		});
		
		it( 'should take a action function', function() {
			var m = window.ov.ampere().module( function m() {
				this.state( 'main')
					.transition( this.states.main)
					.action( function() { return 'foo';})
				;
			});
			
			m = new m();
			
			expect( m.states.main.transitions[0].action()).toEqual( 'foo');
			
			expect( function() {
				m.states.main.transitions[0].isDisabled( "rumps");
			}).toThrow();
			
			m.states.main.transitions[0].isDisabled( function() { return "hey!"; });
			expect( m.states.main.transitions[0].isDisabled()).toEqual( 'hey!');
		});
	});
	
	describe( 'Views', function() {
		it( 'should be accessible', function() {
			var m = window.ov.ampere().module( function m() {
				this.state( 'main')
					.view( function() {
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
			expect( Object.keys( m.states.main.views)).toEqual( [ '', 'intro', 'quit']);
			
			expect( m.states.main.views[''].options('mee')).toEqual( 'too');
		});
	});
	
	describe( 'UIController', function() {
		it( 'default state', function() {
			var m = window.ov.ampere().module( function m() {
				this.state( 'main');
			});	
			m = new m();
			
			var div = $( '<div>').ampere( m);
			expect( div.ampere().getState()).toEqual( m.states.main);
		});
		
		it( 'state configured as string', function() {	
				// default state configured at ampere instance
			var m = window.ov.ampere()
			.options( { state:'b' })
			.module( function m() {
				this.state( 'a');
				this.state( 'b');
				this.state( 'c');
				this.state( 'd');
				this.state( 'e');
			});	
			var div = $( '<div>').ampere( new m());
			expect( div.ampere().getState()).toEqual( div.ampere().states.b);
				
				// default state configured at module instance
			m.defaults( {
				state : 'c'
			});
			var div = $( '<div>').ampere( new m());
			expect( div.ampere().getState()).toEqual( div.ampere().states.c);
			
			var div = $( '<div>').ampere( new m( { state : 'd'}));
			expect( div.ampere().getState()).toEqual( div.ampere().states.d);
			
			expect( function() {
				var div = $( '<div>').ampere( new m( { state : 'k'}));
			}).toThrow();
		});
		
		it( 'state unconfigured', function() {	
			var m = window.ov.ampere()
			.module( function m() {
				this.state( 'a');
				this.state( 'b');
			});	

			var _m = new m();
			var div = $( '<div>').ampere( _m, { state : _m.states.b});
			expect( div.ampere().getState()).toEqual( div.ampere().states.b);
		});
	});
});