ov.ampere().module( function crontab( module) {
	module.MINUTES = (function() {
		var minutes = [];
		for( var i=0; i<60; i++) {
			minutes[i]=i;
		}
		return minutes;
	})();
	module.HOURS = (function() {
		var hours = [];
		for( var i=0; i<24; i++) {
			hours[i]=i;
		}
		return hours;
	})();
	module.DAYS_OF_MONTH = (function() {
		var days = [];
		for( var i=1; i<=31; i++) {
			days[i-1]=i;
		}
		return days;
	})();
	module.MONTHS = (function() {
		var months = [];
		for( var i=1; i<=12; i++) {
			months[i-1]=i;
		}
		return months;
	})();
	module.MONTH_NAMES = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	module.DAY_NAMES = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	module.state( {
		main : function( state) {
			state.transition( module.states.edit)
			.action( function( transition, ui ,data) {
				var contents = state.contents;
				var items = parseCrontab( contents);
				var currentItems = transition.target.items; 

				return function redo( main, edit) {
					//main.contents = contents;
					edit.items = items;

					return function undo( main, edit) {
						//main.contents = contents;
						edit.items = currentItems;	

						return redo;
					};
				};
			})
			.enabled( function() {
				return document.getElementsByTagName( 'form')[0].checkValidity();
			});

			var parseCrontab = function( string) {
				var entries = [];

				var lines = string.split( /\n+/);
				for (var i = 0; i <lines.length; i++) {
						// process only non empty lines
					if( $.trim( lines[i].length)) {
							// if its not a comment
						if( lines[i].charAt( 0)!='#') {
							var entry = lines[i].match(/^([0-9,\-\/]+|\*{1}|\*{1}\/[0-9]+)\s+([0-9,\-\/]+|\*{1}|\*{1}\/[0-9]+)\s+([0-9,\-\/]+|\*{1}|\*{1}\/[0-9]+)\s+([0-9,\-\/]+|\*{1}|\*{1}\/[0-9]+)\s+([0-9,\-\/]+|\*{1}|\*{1}\/[0-9]+)\s*(.+)$/);
							
								// if parse was successful -> add it to the resulting entries
							if( entry) {
								var data = {
									minute 		: entry[1],
									hour 		: entry[2],
									day_of_month: entry[3],
									month 		: entry[4],
									day_of_week : entry[5],
									command 	: entry[6]
								};
								entries.push( data);
							} else {
								throw new Error( 'Failed to parse crontab line ' + (i+1) + ' : \n\n"' + lines[i] + '"');
							}
						}
					}
				}

				return entries;
			}

			state.contents = module.options( 'crontab-contents');

			state.validate=function( jqTextarea) {
				try {
					parseCrontab( state.contents);
				} catch( ex) {
					jqTextarea.setCustomValidity( ex.message);
				}							
			}; 							

			state.view.load( 'tmpl/main.tmpl');

			state.options({
				'ampere.ui.caption' : false			// -> prevent default caption for this state
			})
		},

		help  : function( state) {
			state.view.load( 'tmpl/help.tmpl');
		},

		edit : function( state) {
			this.transition( module.states.main)
			.options({
				'ampere.ui.type' 	: 'primary',
				'ampere.ui.caption' : 'Back',
				'ampere.ui.icon'	: 'icon-chevron-left'
			});

			function generateCrontab() {
				var lines = [];
				for (var i = 0; i < state.items.length; i++) {
					var item = state.items[i]
					lines.push( 
						item.minute + ' ' + 
						item.hour + ' ' + 
						item.day_of_month + ' ' + 
						item.month + ' ' + 
						item.day_of_week + ' ' + 
						item.command
					);
				};

				return lines.join( '\n');
			}

			this.transition( 'preview', module.states.main)
			.action( function( transition, ui, data) {
				var deferred = $.Deferred();

				$( '#preview-dialog textarea').text( generateCrontab());

				$( '#preview-dialog')
				.modal( 'show')
				.one( 'hidden', function() {
					deferred.reject();
				});
					// trigger ui to be updated
				ui.update();

				return deferred;
			})
			.options({
				'ampere.ui.caption' : 'Preview Crontab',
				'ampere.ui.icon'	: 'icon-eye-open',
				'commit'			: function( ui) {
					$( '#preview-dialog').modal( 'hide');
				}
			});

			this.transition( 'apply', module.states.main)
			.action( function( transition, ui, data) {
				var items = state.items;
				var oldContents = module.states.main.contents;

				return function redo( edit, main) {
					edit.items = items;
					main.contents = generateCrontab();

					return function undo( main, edit) {
						edit.items = items;
						main.contents = oldContents;									

						return redo;
					};
				};
			})
			.options({
				'ampere.ui.caption' 	: 'Apply and go back',
				'ampere.ui.description' : 'Apply edited crontab to initial texarea for copy/paste purposes',
			});

			state.validateCommand = function( eTexarea) {
				/\r|\n/m.test( state.list.getEditingContext().item.command) && eTexarea.setCustomValidity( 'Line breaks are not allowed in command.');
			};

			state.normalizeEditingItem = function() {
				var item = state.list.getEditingContext().item;

					// convert new item	in correct format
				item.minute = item.minute.length<60 && item.minute.join( ',') || '*';
				item.hour = item.hour.length<24 && item.hour.join( ',') || '*';
				item.day_of_month = item.day_of_month.length<31 && item.day_of_month.join( ',') || '*';
				item.month = item.month.length<12 && item.month.join( ',') || '*';

				item.day_of_week = item.day_of_week.length<7 && item.day_of_week.join( ',') || '*';
			};

			state.items = [];

			state.list = state.list = window.ov.ampere.crud.list( 
					// wrap the data model argument in a function
					// because the model object may be completely replaced 
				function() { 
					return state.items; 
				}, 
				[
					{
						template : '{{item.minute}}'
					}, {
						template : '{{item.hour}}'
					}, {
						template : '{{item.day_of_month}}'
					}, {
						template : '{{item.month}}'
					}, {
						get 	 : function( item) {
							return item=='*' && [ item] || 
								$.map( item.split( ','), function( day) {
									return module.DAY_NAMES[ parseInt( day<7 && day || 0)];
								})
							; 
						},
						template : '{{column.get( item.day_of_week).join( ", ")}}'
					}, {
						template : '<pre>{{item.command}}</pre>'
					}
				]
			)
			.headers([
				{
					template : 'Minute'
				},
				{
					template : 'Hour'
				},
				{
					template : 'Day of month'
				},
				{
					template : 'Month'
				},
				{
					template : 'Day of week'
				},
				{
					template : 'Command'
				}
			])
			.removable( true)
			.draggable( true)
			.editable({
				template : function() {
					return document.getElementById( 'entry-editor');
				},	
				callback : function( editable)   {
					editable.transition.action( (function( action) {
						return function( transition, ui, data) {
							var redo = action( transition, ui, data), item = editable.item;

							var toArray = function( s, convertToString) {
								return $.map( s.split( ','), function( k) {
									return parseInt( k, 10);
								})
							};

								// prepare data item for editing
							item.minute = item.minute=='*' && [].concat( module.MINUTES) || 
								toArray( item.minute);

							item.hour = item.hour=='*' && [].concat( module.HOURS) || 
								toArray( item.hour);

							item.day_of_month = item.day_of_month=='*' && [].concat( module.DAYS_OF_MONTH) || 
								toArray( item.day_of_month);

							item.month = item.month=='*' && [].concat( module.MONTHS) || 
								toArray( item.month);

							item.day_of_week = item.day_of_week=='*' && Object.keys( module.DAY_NAMES) || toArray( item.day_of_week);

							item.day_of_week = $.map( item.day_of_week, function( entry) {
								return (entry>6 ? 0 : entry).toString();
							});

							editable.original = angular.copy( item);

							return redo;
						};
					})( editable.transition.action()));

					editable.commit
					.action( (function( action) {
						return function( transition, ui, data) {
							state.normalizeEditingItem();

								// proceed with default addable logic
							return action( transition, ui, data);
						};
					})( editable.commit.action()))
					.enabled( function() {
						return $('textarea:first').checkValidity() && 
							!angular.equals( state.list.getEditingContext().item, state.list.getEditingContext().original);
					});
				}
			})
			.addable({
				template : function() {
					return document.getElementById( 'entry-editor');
				},	
				callback : function( addable)   {
					
					addable.transition.action( (function( action) {
						return function( transition, ui, data) {
							var redo = action( transition, ui, data);

							addable.item = {
								minute 		: [].concat( module.MINUTES),
								hour 		: [].concat( module.HOURS),
								day_of_month: [].concat( module.DAYS_OF_MONTH),
								month 		: [].concat( module.MONTHS),
								day_of_week : Object.keys( module.DAY_NAMES),
								command 	: 'root echo "" > /www/apache/logs/error_log'
							};

							return redo;
						};
					})( addable.transition.action()));

					addable.commit
					.action( (function( action) {
						return function( transition, ui, data) {
							state.normalizeEditingItem();

								// proceed with default addable logic
							return action( transition, ui, data);
						};
					})( addable.commit.action()))
					.enabled( function() {
						return $('textarea:first').checkValidity();
					});
				}
			});

			state.view.load( 'tmpl/edit.tmpl');
		}
	});

	if( module.options( 'showUndoRedo')) {
		module.transition( module.history().undo.target)
		.action( module.history().undo)
		.enabled( module.history().canUndo)
		.options({
			'ampere.ui.caption' : 'Undo',
			'ampere.ui.hotkey'  : 'ctrl+Z',
			'ampere.ui.icon' 	: 'icon-undo',
			'ampere.ui.type' 	: 'global'
		});

		module.transition( module.history().redo.target)
		.action( module.history().redo)
		.enabled( module.history().canRedo)
		.options({
			'ampere.ui.caption' : 'Redo',
			'ampere.ui.hotkey'  : 'ctrl+Y',
			'ampere.ui.icon' 	: 'icon-repeat',
			'ampere.ui.type' 	: 'global'
		});
	}

	module.transition( module.states.main)
	.options({
		'ampere.ui.caption' : 'Intro',
	})
	.active( function() {
		return module.current().state===module.states.main;
	})
	.enabled( function() {
		return module.current().state!==module.states.main;
	});

	module.transition( module.states.help)
	.active( function() {
		return module.current().state===module.states.help;
	})
	.enabled( function() {
		return module.current().state!==module.states.help;
	});

	module.options({
		'ampere.ui.caption' 	: 'Crontab editor',
		'ampere.ui.about' 		: 'This is a sample <a target="_blank" href="https://github.com/lgersman/jquery.orangevolt-ampere">Ampere</a> application.',
		'ampere.ui.about.url'	: 'https://github.com/lgersman/jquery.orangevolt-ampere',
		'ampere.ui.description'	: 'Crontab editor is a GUI application that can be used to edit your  crontab file easily'
	});
});