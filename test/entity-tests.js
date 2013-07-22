(function( $) {
	var persons = [
		{ id : '000', name : 'lars', country : 'de', zipcode : '99084'},
		{ id : '001', name : 'stanislav', country : 'ru', zipcode : '107207'},
		{ id : '002', name : 'marta', country : 'nl', zipcode : '1100 AA'},
		{ id : '003', name : 'nico', country : 'de', zipcode : '2600 AA'}
	];

	var countries = [
		{ code : 'de', name : 'Germany'},
		{ code : 'ru', name : 'Russia'},
		{ code : 'nl', name : 'Netherlands'}
	];

	var zipcodes = [
		{ id : '99084',		city : 'Erfurt'},
		{ id : '107207',	city : 'Moscow'},
		{ id : '1100 AA',	city : 'Amsterdam'},
		{ id : '2600 AA',	city : 'Den Haag'}
	];


	describe( 'Entity', function() {
		describe( "entity object", function() {
			var e = window.ov.entity( persons);

			it( "get", function() {
				expect( e.get()).toEqual( persons);
			});
		});

		describe( "static find", function() {
			it( "by id", function() {
				var r = window.ov.entity.find( persons, '000');
				expect( r).toBeDefined();
				expect( r.name).toEqual( 'lars');
			});

			it( "by custom property", function() {
				var r = window.ov.entity.find( persons, 'lars', 'name');
				expect( r).toBeDefined();
				expect( r.name).toEqual( 'lars');
			});

			it( "by custom property with regexp value", function() {
				var r = window.ov.entity.find( persons, /ars/, 'name');
				expect( r).toBeDefined();
				expect( r.name).toEqual( 'lars');
			});

			it( "by function", function() {
				var r = window.ov.entity.find( persons, function( item, index, property) {
					return item.name=='lars';
				});
				expect( r).toBeDefined();
				expect( r.name).toEqual( 'lars');
			});

			it( "by function and property", function() {
				var r = window.ov.entity.find( persons, function( item, index, property) {
					return item.name==property;
				}, 'lars');
				expect( r).toBeDefined();
				expect( r.name).toEqual( 'lars');
			});

			it( "by object", function() {
				var r = window.ov.entity.find( persons, {
					name	: 'lars',
					country : 'de'
				});
				expect( r).toBeDefined();
				expect( r.name).toEqual( 'lars');
			});
		});

		describe( "find", function() {
			var e = window.ov.entity( persons);

			it( "by id", function() {
				var r = e.find( '000');
				expect( r).toBeDefined();
				expect( r.name).toEqual( 'lars');
			});

			it( "by custom property", function() {
				var r = e.find( 'lars', 'name');
				expect( r).toBeDefined();
				expect( r.name).toEqual( 'lars');
			});

			it( "by custom property with regexp value", function() {
				var r = e.find( /ars/, 'name');
				expect( r).toBeDefined();
				expect( r.name).toEqual( 'lars');
			});

			it( "by function", function() {
				var r = e.find( function( item, index, property) {
					return item.name=='lars';
				});
				expect( r).toBeDefined();
				expect( r.name).toEqual( 'lars');
			});

			it( "by function and property", function() {
				var r = e.find( function( item, index, property) {
					return item.name==property;
				}, 'lars');
				expect( r).toBeDefined();
				expect( r.name).toEqual( 'lars');
			});

			it( "by object", function() {
				var r = e.find({
					name	: 'lars',
					country : 'de'
				});
				expect( r).toBeDefined();
				expect( r.name).toEqual( 'lars');
			});
		});

		describe( "find with array property", function() {
			var a = [
				{ "id" : "lg", "name" : "lars", "locales" : [ "en_GB", "en_US", "de_DE"]}
			];

			expect( window.ov.entity.find( a, 'de_DE', 'locales')).toBeDefined();
			expect( window.ov.entity.find( a, 'es_ES', 'locales')).toBeUndefined();

			expect( window.ov.entity.find( a, /de/, 'locales')).toBeDefined();
			expect( window.ov.entity.find( a, /es/, 'locales')).toBeUndefined();
		});

		describe( "static filter", function() {
			it( "by id", function() {
				var r = window.ov.entity.filter( persons, /00(1|2)/);
				expect( r).toBeDefined();
				expect( r).toEqual( [ persons[1], persons[2]]);
			});

			it( "by custom property", function() {
				var r = window.ov.entity.filter( persons, 'de', 'country');
				expect( r).toBeDefined();
				expect( r).toEqual( [ persons[0], persons[3]]);
			});

			it( "by custom property with regexp value", function() {
				var r = window.ov.entity.filter( persons, /lars|stanislav/, 'name');
				expect( r).toBeDefined();
				expect( r).toEqual( [ persons[0], persons[1]]);
			});

			it( "by function", function() {
				var r = window.ov.entity.filter( persons, function( item, index, property) {
					return item.name=='lars' || item.name=='nico';
				});
				expect( r).toBeDefined();
				expect( r).toEqual( [ persons[0], persons[3]]);
			});

			it( "by function and property", function() {
				var r = window.ov.entity.filter( persons, function( item, index, property) {
					return item.country==property;
				}, 'de');
				expect( r).toBeDefined();
				expect( r).toEqual( [ persons[0], persons[3]]);
			});

			it( "by object", function() {
				var r = window.ov.entity.filter( persons, {
					name	: 'lars',
					country : 'de'
				});
				expect( r).toBeDefined();
				expect( r).toEqual( [ persons[0]]);
			});
		});

		describe( "filter", function() {
			var e = window.ov.entity( persons);

			it( "by id", function() {
				var r = e.filter( /00(1|2)/);
				expect( r).toBeDefined();
				expect( r).toEqual( [ persons[1], persons[2]]);
			});

			it( "by custom property", function() {
				var r = e.filter( 'de', 'country');
				expect( r).toBeDefined();
				expect( r).toEqual( [ persons[0], persons[3]]);
			});

			it( "by custom property with regexp value", function() {
				var r = e.filter( /lars|stanislav/, 'name');
				expect( r).toBeDefined();
				expect( r).toEqual( [ persons[0], persons[1]]);
			});

			it( "by function", function() {
				var r = e.filter( function( item, index, property) {
					return item.name=='lars' || item.name=='nico';
				});
				expect( r).toBeDefined();
				expect( r).toEqual( [ persons[0], persons[3]]);
			});

			it( "by function and property", function() {
				var r = e.filter( function( item, index, property) {
					return item.country==property;
				}, 'de');
				expect( r).toBeDefined();
				expect( r).toEqual( [ persons[0], persons[3]]);
			});

			it( "by object", function() {
				var r = e.filter({
					name	: 'lars',
					country : 'de'
				});
				expect( r).toBeDefined();
				expect( r).toEqual( [ persons[0]]);
			});
		});

		describe( "static next", function() {
			it( "item expected", function() {
				var n = window.ov.entity.next( persons, persons[0]);
				expect( n).toEqual( persons[1]);
			});

			it( "no item expected", function() {
				var n = window.ov.entity.next( persons, persons[ persons.length-1]);
				expect( n).toBeUndefined();
			});
		});

		describe( "next", function() {
			var e = window.ov.entity( persons);

			it( "item expected", function() {
				var n = e.next( persons[0]);
				expect( n).toEqual( persons[1]);
			});

			it( "no item expected", function() {
				var n = e.next( persons[ persons.length-1]);
				expect( n).toBeUndefined();
			});
		});

		describe( "static prev", function() {
			it( "item expected", function() {
				var p = window.ov.entity.prev( persons, persons[1]);
				expect( p).toEqual( persons[0]);
			});

			it( "no item expected", function() {
				var p = window.ov.entity.prev( persons, persons[0]);
				expect( p).toBeUndefined();
			});
		});

		describe( "static first", function() {
			it( "item expected", function() {
				var p = window.ov.entity.first( persons);
				expect( p).toEqual( persons[0]);
			});

			it( "no item expected", function() {
				var p = window.ov.entity.prev( []);
				expect( p).toBeUndefined();
			});
		});

		describe( "first", function() {
			it( "item expected", function() {
				var e = window.ov.entity( persons);
				var p = e.first();
				expect( p).toEqual( persons[0]);
			});

			it( "no item expected", function() {
				var e = window.ov.entity( []);
				var p = e.prev();
				expect( p).toBeUndefined();
			});
		});

		describe( "static last", function() {
			it( "item expected", function() {
				var p = window.ov.entity.last( persons);
				expect( p).toEqual( persons[ persons.length-1]);
			});

			it( "no item expected", function() {
				var p = window.ov.entity.last( []);
				expect( p).toBeUndefined();
			});
		});

		describe( "last", function() {
			it( "item expected", function() {
				var e = window.ov.entity( persons);
				var p = e.last();
				expect( p).toEqual( persons[ persons.length-1]);
			});

			it( "no item expected", function() {
				var e = window.ov.entity( []);
				var p = e.last();
				expect( p).toBeUndefined();
			});
		});

		describe( "prev", function() {
			var e = window.ov.entity( persons);

			it( "item expected", function() {
				var p = e.prev( persons[1]);
				expect( p).toEqual( persons[0]);
			});

			it( "no item expected", function() {
				var p = e.prev( persons[0]);
				expect( p).toBeUndefined();
			});
		});

		describe( "projection", function() {
			var e = window.ov.entity( persons, {
				'zipcode'		: zipcodes,
				'country'		: {
					'id'		: 'code',
					'values'	: countries
				},
				'description'	: function( item) {
					return 'lives in ' + this.getZipcode( item)['city'];
				}
			});

			it( "hasProjection", function() {
				var person = e.find( '000');
				var projection = e.projection();

				expect( projection.has( person, 'zipcode')).toEqual( true);
				expect( projection.has( person, 'name')).toEqual( false);

				expect( projection.has( person.valueOf(), 'zipcode')).toEqual( true);
				expect( projection.has( person.valueOf(), 'name')).toEqual( false);
			});

			it( "getProjection", function() {
				var person = e.find( '000');
				var projection = e.projection();

				expect( projection.get( person, 'zipcode').city).toEqual( 'Erfurt');
				expect( projection.get( person, 'name')).toEqual( 'lars');
			});

			it( "static array", function() {
				var person = e.find( '000');

				expect( person.zipcode).toEqual( '99084');

				var zipcode = e.projection().getZipcode( person);
				expect( zipcode).toEqual( window.ov.entity.find( zipcodes, '99084'));
				expect( zipcode.city).toEqual( 'Erfurt');
			});

			it( "array", function() {
				var person = e.find( '000');

				expect( person.zipcode).toEqual( '99084');

				var projection = e.projection( person);
				expect( projection.zipcode).toEqual( '99084');

				var zipcode = projection.getZipcode();
				expect( zipcode).toEqual( window.ov.entity.find( zipcodes, '99084'));
				expect( zipcode.city).toEqual( 'Erfurt');
			});

			it( "static object", function() {
				var person = e.find( '000');

				expect( person.country).toEqual( 'de');

				var country = e.projection().getCountry( person);
				expect( country).toEqual( window.ov.entity.find( countries, 'de', 'code'));
				expect( country.name).toEqual( 'Germany');
			});

			it( "object", function() {
				var person = e.find( '000');

				expect( person.country).toEqual( 'de');

				var projection = e.projection( person);
				expect( projection.country).toEqual( 'de');

				var country = projection.getCountry();
				expect( country).toEqual( window.ov.entity.find( countries, 'de', 'code'));
				expect( country.name).toEqual( 'Germany');
			});

			it( "static function", function() {
				var person = e.find( '000');
				expect( person).toBeDefined();

				expect( e.projection().getDescription( person)).toEqual( 'lives in Erfurt');
			});

			it( "function", function() {
				var person = e.find( '000');

				expect( person).toBeDefined();

				var projection = e.projection( person);
				expect( projection.getDescription()).toEqual( 'lives in Erfurt');
			});
		});

		describe( "match", function() {
			it( "without projection (value)", function() {
				var e = window.ov.entity( persons);

				var hits = e.match( 'ars');
				expect( hits.length).toEqual( 1);
				expect( hits[0].name).toEqual( 'lars');

				hits = e.match( /ar/);
				expect( hits.length).toEqual( 2);
				expect( hits[1].name).toEqual( 'marta');
			});

			it( "without projection (array)", function() {
				var e = window.ov.entity([
					{ name : 'foo', value : ['bar', 'i', 'ton']},
					{ name : 'bits', value : ['bitte', 'ein', 'bit']},
					{ name : 'batz', value : ['camp', 'side', 'ton']}
				]);

				var hits = e.match( 'bar');
				expect( hits.length).toEqual( 1);
				expect( hits[0].name).toEqual( 'foo');

				hits = e.match( /ton/);
				expect( hits.length).toEqual( 2);
				expect( hits[1].name).toEqual( 'batz');
			});

			it( "without projection (object)", function() {
				var e = window.ov.entity([
					{ name : 'foo', value : { name : 'alpha', value:'eins'}},
					{ name : 'bits', value : { name : 'beta', value:'zwei'}},
					{ name : 'batz', value : { name : 'gamma', value:'eins'}}
				]);

				var hits = e.match( 'zwei');
				expect( hits.length).toEqual( 1);
				expect( hits[0].name).toEqual( 'bits');

				hits = e.match( /ein/);
				expect( hits.length).toEqual( 2);
				expect( hits[1].name).toEqual( 'batz');
			});

			var e = window.ov.entity( persons, {
				'zipcode'		: zipcodes,
				'country'		: {
					'id'		: 'code',
					'values'	: countries
				},
				'description'	: function( item) {
					return 'lives in ' + this.getZipcode( item)['city'];
				}
			});

			it( "with projection (value)", function() {
				var hits = e.match( 'AA');
				expect( hits.length).toEqual( 2);
				expect( e.projection( hits[0]).getZipcode().city).toEqual( 'Amsterdam');
			});

			it( "with projection (array)", function() {
				var arrays = [
					{ id : 'eins', values : ['bar', 'i', 'ton']},
					{ id : 'zwei', values : ['bitte', 'ein', 'bit']},
					{ id : 'drei', values : ['camp', 'side', 'ton']}
				];

				var e = window.ov.entity([
					{ name : 'foo', value : 'eins'},
					{ name : 'bits', value : 'zwei'},
					{ name : 'batz', value : 'drei'}
				], {
					'value' : arrays
				});

				var hits = e.match( /ton/);
				expect( hits.length).toEqual( 2);
				expect( e.projection( hits[1]).getValue().id).toEqual( 'drei');
			});

			it( "with projection (object)", function() {
				var objects = [
					{ id : '1', value : 'eins'},
					{ id : '2', value : 'zwei'},
					{ id : '3', value : 'eins'}
				];

				var e = window.ov.entity([
					{ name : 'foo', value : '1'},
					{ name : 'bits', value : '2'},
					{ name : 'batz', value : '3'}
				], {
					'value' : objects
				});

				var hits = e.match( 'zwei');
				expect( hits.length).toEqual( 1);
				expect( hits[0].name).toEqual( 'bits');

				hits = e.match( /ein/);
				expect( hits.length).toEqual( 2);
				expect( hits[1].name).toEqual( 'batz');
			});
		});

		describe( "atomic lists (aka key lists)", function() {
			var languages = [
				{ id : 'de_DE', country : 'Germany'},
				{ id : 'fr_FR', country : 'France'},
				{ id : 'en_US', country : 'USA'}
			];

			var list = [ 'de_DE', 'en_US'];

			//var e = window.ov.entity( list, languages);

			it( "projection", function() {
				var projection = window.ov.entity.projection.atomic({
					id : 'id',
					values : languages
				});

				expect( projection.get( 'fr_FR')).toEqual( languages[1]);
				expect( projection.get( 'en_US').country).toEqual( 'USA');

				var matches = projection.match( list, 'an');

				expect( matches.length).toEqual( 1);
				expect( projection.get( matches[0]).country).toEqual( 'Germany');

				var all = projection.all( ['de_DE', 'fr_FR']);
				expect( all.length).toEqual( 2);
				expect( all[0].country).toEqual( 'Germany');
				expect( all[1].country).toEqual( 'France');

				expect( projection.all( ['de_DE', 'fr_FR'], undefined, true).length, 1);
				expect( projection.all( ['de_DE', 'fr_FR'], undefined, true)[0].name, 'USA');

				var e = window.ov.entity( list, projection);
				expect( e.find( 'de_DE')).toEqual( 'de_DE');
				expect( e.find( 'fr_FR')).toEqual( undefined);

				expect( e.projection( e.find( 'de_DE')).country).toEqual( 'Germany');

				all = e.all( ['de_DE', 'fr_FR']);
				expect( all.length).toEqual( 2);
				expect( all[0].country).toEqual( 'Germany');
				expect( all[1].country).toEqual( 'France');

				expect( e.all( ['de_DE', 'fr_FR'], undefined, true).length, 1);
				expect( e.all( ['de_DE', 'fr_FR'], undefined, true)[0].country, 'USA');
			});
		});
	});

	describe( "Projection", function() {
		var projection = window.ov.entity.projection({
			'zipcode'		: zipcodes,
			'country'		: {
				'id'		: 'code',
				'values'	: countries
			},
			'description'	: function( item) {
				return 'lives in ' + this.getZipcode( item)['city'];
			}
		});

		it( "hasProjection", function() {
			expect( projection.has( persons[0], 'zipcode')).toEqual( true);
			expect( projection.has( persons[0], 'name')).toEqual( false);
		});

		it( "getProjection", function() {
			expect( projection.get( persons[0], 'zipcode').city).toEqual( 'Erfurt');
			expect( projection.get( persons[0], 'name')).toEqual( 'lars');
		});

		it( "match", function() {
			expect( projection.match( persons, 'ars')[0].name).toEqual( 'lars');
			expect( projection.match( persons, /ar/)[1].name).toEqual( 'marta');
		});
	});

	describe( "lamda", function() {
		var expr = window.ov.entity.lambda( "( person) => person.name=='lars'");
		var arr = $.grep( persons, expr);

		expect( arr[0]).toEqual( persons[0]);
	});

	describe( "where", function() {
		it( "expression", function() {
			var arr = window.ov.entity.where( persons, "this.name=='lars'");	
			expect( arr[0]).toEqual( persons[0]);

			arr = window.ov.entity.where( persons, "return this.name=='lars'");	
			expect( arr[0]).toEqual( persons[0]);

			arr = window.ov.entity.where( persons, "this.name=='lars';");	
			expect( arr[0]).toEqual( persons[0]);

			arr = window.ov.entity.where( persons, "return this.name=='lars';");	
			expect( arr[0]).toEqual( persons[0]);
		});

		it( "expression with argument", function() {
			var arr = window.ov.entity.where( persons, "( person) => person.name=='lars'");	
			expect( arr[0]).toEqual( persons[0]);
		});

		it( "expression with param", function() {
			var arr = window.ov.entity.where( persons, "( person, index, out, name) => person.name==name", 'lars');	
			expect( arr[0]).toEqual( persons[0]);

			var expr = window.ov.entity.lambda( "( person, index, out, name) => person.name==name");	
			arr = window.ov.entity.where( persons, expr, 'lars');	
			expect( arr[0]).toEqual( persons[0]);
		});

		it( "unique", function() {
			var arr = window.ov.entity.select( persons, "( person) => person.country");	
			arr = window.ov.entity.where( arr, "( country, index, out) => $.inArray( country, out)==-1");	
			expect( arr).toEqual( [ 'de', 'ru', 'nl']);

				// same but shorter written
			arr = window.ov.entity.select( persons, "( person) => person.country");	
			arr = window.ov.entity.where( arr, "( country, index, out) => !~$.inArray( country, out)");	
			expect( arr).toEqual( [ 'de', 'ru', 'nl']);
		});
	});

	describe( "select", function() {
		it( "expression", function() {
			var arr = window.ov.entity.select( persons, "this.country");	
			expect( arr).toEqual( [ 'de', 'ru', 'nl', 'de']);

			arr = window.ov.entity.select( 
				persons, 
				"( person, index, out, countries) => window.ov.entity.where( countries, \"this.code=='\" + person.country + \"'\")[0]",
				countries
			);
			expect( arr).toEqual( [ { code : 'de', name : 'Germany' }, { code : 'ru', name : 'Russia' }, { code : 'nl', name : 'Netherlands' }, { code : 'de', name : 'Germany' } ]);
		});
	});
})( jQuery);
