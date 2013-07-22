(function( $) {
	
	describe( 'Paginator', function() {
		var data = [
			"a", "aa", "ab", "cc", "dd", "ka", "bc", "zz", "ya", "eaaa", "aw"
		];

		function containsA( item) {
			return item.indexOf( 'a')!=-1;
		} 

		it( "getFiltered", function() {
			var paginator = window.ov.ampere.crud.paginator( data);
			
			expect( paginator.getPageItems()).toEqual( paginator.get());

			paginator = window.ov.ampere.crud.paginator( data)
			.filter( containsA);
			expect( paginator.getPageItems()).toEqual( ["a", "aa", "ab", "ka", "ya", "eaaa", "aw"]);
		});

		it( "getPageCount", function() {
			var paginator = window.ov.ampere.crud.paginator( data, { itemCountPerPage : 3})
			.filter( containsA);
			expect( paginator.getPageCount()).toEqual( 3);

			paginator = window.ov.ampere.crud.paginator( data);
			expect( paginator.getPageCount()).toEqual( 2);

			paginator = window.ov.ampere.crud.paginator( data, { itemCountPerPage : 20});
			expect( paginator.getPageCount()).toEqual( 1);

			paginator = window.ov.ampere.crud.paginator( [], { itemCountPerPage : 20});
			expect( paginator.getPageCount()).toEqual( 1);
		});

		it( "currentPageNumber", function() {
			var paginator = window.ov.ampere.crud.paginator( data, { itemCountPerPage : 3})
			.filter( containsA);

			expect( paginator.currentPageNumber()).toEqual( 1);

			expect( paginator.currentPageNumber( 2).currentPageNumber()).toEqual( 2);

			expect( function() {
				paginator.currentPageNumber( 4);
			}).toThrow();

			paginator.filter( function( item) {
				return item.indexOf( 'a')!=-1;
			}).getPageItems();

			expect( paginator.currentPageNumber( 1).currentPageNumber()).toEqual( 1);
		});
	});
})( jQuery);
