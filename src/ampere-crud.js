/*
 * Orangevolt Ampere Framework
 *
 * http://github.com/lgersman
 * http://www.orangevolt.com
 *
 * Copyright 2012, Lars Gersmann <lars.gersmann@gmail.com>
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

;(window.ov && window.ov.ampere && window.ov.ampere.crud) || (function( $) {
	window.ov = window.ov || {};
	window.ov.ampere = window.ov.ampere || {};

	var _ns = $.ov.namespace( 'window.ov.ampere.crud');

		/**
		 * copy of ampere options
		 */
	function Options( defaults) {
		var _ = defaults || {};

		return function options() {
			if( arguments.length==2) {
				_[ arguments[0]] = arguments[1];
				return this;
			} else if( arguments.length==1) {
				var arg = arguments[0];
				if( $.isPlainObject( arg)) {
					angular.extend( _, arg);
					return this;
				} else {
					return _[ arg];
				}
			}
			return _;
		};
	}

	window.ov.ampere.crud = function Crud() {
	};
	window.ov.ampere.crud.list = function List( array, columns, options) {
		if( this instanceof List) {
			var _ns = $.ov.namespace( this.name());

			var column = function( column) {
				if( typeof( column)=='string') {
					return {
						get		: function( item) {
							return item[ column];
						},
						template: {
							append : "{{column.get( item)}}"
						}
					};
				} else if( (column instanceof HTMLElement) || column.jquery) {
					return {
						template: {
							append : window.ov.ampere.util.getTemplate( column)
						}
					};
				} else if( $.isPlainObject( column)) {
					return {
						get		: $.isFunction( column.get) && column.get || function( item) {
							return item[ column.get];
						},
						template: (function( t) {
							if( t) {
								if( !$.isPlainObject( t)) {
									t = {
										append : t
									};
								}

								for( var k in t) {
									t[k] = window.ov.ampere.util.getTemplate( t[k]);
								}

								return t;
							} else {
								return {
									append : "{{column.get( item)}}"
								};
							}
						})( column.template)
					};
				} else if( $.isFunction( column)) {
					return {
						get : column,
						template : {
							prepend : "{{column.get( item)}}"
						}
					};
				} else {
					_ns.raise( "don't know how to handle column data (=", column, ')');
				}
			};

			var header = function ( header) {
				if( typeof( header)=='string' || (header instanceof HTMLElement) || header.jquery) {
					return {
						template : { prepend : window.ov.ampere.util.getTemplate( header) }
					};
				} else if( $.isPlainObject( header)) {
					var _header = {
						template : (function( t) {
							if( t) {
								if( !$.isPlainObject( t)) {
									t = {
										prepend : t
									};
								}

								for( var k in t) {
									t[k] = window.ov.ampere.util.getTemplate( t[k]);
								}

								return t;
							} else {
								return {
									prepend : "{{column.get( item)}}"
								};
							}
						})( header.template)
					};

					if( header.orderBy) {
						_header.orderBy = $.isFunction( header.orderBy) && header.orderBy ||
							typeof( header.orderBy)=='string' && function( item) { return item[ header.orderBy]; } ||
							$.noop;
					}

					return _header;
				} else {
					_ns.raise( "don't know how to handle column data (=", header, ')');
				}
			};

			_ns.assert( $.isArray( array), 'first argument expected to be an array but is of type ', $.type( array));

				/**
				 * @param columns array or object providing column informations
				 * <array> a column element can be :
				 * - string the item property rendered as cell value
				 * - function the getter for the item property to render as cell value
				 * - object { get : <string>|<function> } same as above
				 * - object { template : <string> } the angular template to render the item column
				 * - object { get : <string>|<function>, template : <string> } combination of both get and template
				 *
				 * if columns is not an array it will be assumed to be a single column element and converted into an array
				 *
				 * @return the colums array
				 */
			this.columns = (function() {
				if( $.isArray( columns)) {
					_ns.assert( columns.length, 'argument columns : array cannot be empty');
					for( var i=0; i<columns.length; i++) {
						columns[i] = column( columns[i]);
					}
				} else {
					columns = [
						column( columns || {
							get : function( item) {
								return item;
							}
						})
					];
				}

				return function() {
					return columns;
				};
			})();
			this.get = function() {
				return array;
			};

				/**
				 * @param headers array or object providing header informations
				 * <array> a header element can be :
				 * - string the header value
				 * - function the getter for the header value
				 * - object { get : <string>|<function> } same as above
				 * - object { template : <string> } the angular template to render the item header
				 * - object { get : <string>|<function>, template : <string> } combination of both get and template
				 *
				 * if headers is not an array it will be assumed to be a single header element and converted into an array
				 *
				 * @return the headers array when called without arguments, otherwise the list instance
				 */
			this.headers = (function( list) {
				var _headers = [];

				return function( headers) {
					if( arguments.length) {
						if( $.isArray( headers)) {
							for( var i=0; i<headers.length; i++) {
								headers[i] = header( headers[i]);
							}
						} else {
							headers = [	header( headers)];
						}

						_ns.assert( headers.length==list.columns().length, "count of headers(=", headers.length, ") !== count of columns(=", list.columns().length, ")");
						_headers = headers;
						return list;
					}

					return _headers;
				};
			})( this);

			this.sortable = (function( list) {
				var _sortable = { orderBy : $.noop, reverse : true};

				return function( fn, reverse) {
					if( arguments.length) {
						_sortable.orderBy = fn || $.noop;
						arguments.length==2 && (_sortable.reverse=reverse);

						return list;
					}
					return _sortable;
				};
			})( this);

				/**
				 * @param options (optional) may be
 				 * - true = enable dragging with defaults
 				 * - object {
 				 * 		// (optional) if its a function the transition will be generated by the list
 				 * 		// and can be customized ithin the function
 				 *   transition : (optional)<function( transition)>|<transition>,
 				 *   	// (optional) css selector referencing the dom element(s) acting as visual drag handle
 				 *   handle : <string>
 				 * }
				 *
				 * @return the draggable options when called without arguments, otherwise the list instance
				 */
			this.draggable = (function( list) {
				var _options;

				return function( options) {
					if( arguments.length) {
						_options = ($.isPlainObject( options) || $.isFunction( options)) && options || options && {} || undefined;

						return list;
					}
					return _options;
				};
			})( this);

				/**
				 * @param options (optional) may be
				 * - object {
				 *   	// the editor template (i.e. content to be rendered into the TR.item)
				 *   template : <string>|<DOM Element>|<jQuery Collection>|<function>
				 * 		// (optional) if its a function the transition will be generated by the list
				 * 		// and can be customized within the function
				 *   transition : (optional)<function( transition)>|<transition>
				 * }
				 *
				 * @return the editable options when called without arguments, otherwise the list instance
				 */
			this.editable = (function( list) {
				var _options;

				return function( options) {
					if( arguments.length) {
						_ns.assert( $.isPlainObject( options), 'edit( options) : plain object expected as argument but was (', options, ')');
						_ns.assert( options.template, 'edit( options) : options.template expected but not given (', options.template, ')');
						_options = options;

						return list;
					}
					return _options;
				};
			})( this);

				/**
				 * @param options (optional) may be
				 * - true = enable remove with defaults
				 * - object {
				 *   	// (optional) the remove template (i.e. content to be rendered into the TR.item)
				 *   template : <string>|<DOM Element>|<jQuery Collection>|<function>
				 * 		// (optional) if its a function the transition will be generated by the list
				 * 		// and can be customized within the function
				 *   transition : (optional)<function( transition)>|<transition>
				 * }
				 *
				 * @return the editable options when called without arguments, otherwise the list instance
				 */
			this.removable = (function( list) {
				var _options;

				return function( options) {
					if( arguments.length) {
						_options = $.isPlainObject( options) && options || options && {} || undefined;

						return list;
					}
					return _options;
				};
			})( this);

				/**
				 * takes a filter function( item)->boolean as argument
				 * if set, the whole array will always be filtered before display
				 *
				 * @return this when called without arguments, otherwise the filter object
				 */
			this.filter = (function() {
				var filter = function( item) {
					return true;
				};

				return function() {
					if( arguments.length && $.isFunction( arguments[0])) {
						filter = arguments[0];
					}
					return arguments.length ? this : filter;
				};
			})();

				/**
				 * takes true/false or an function( item)->boolean as argument
				 *
				 * @return this when called without arguments, otherwise the isSelectable function
				 */
			this.selectable = (function() {
				var selectable = window.ov.ampere.util.trueFn;

				return function() {
					if( arguments.length) {
						selectable = $.isFunction( arguments[0]) && arguments[0] || arguments[0] && window.ov.ampere.util.trueFn || $.noop;
					}
					return arguments.length ? this : selectable;
				};
			})();

			this.selection = (function( list) {
				var selection;

				return function() {
					if( arguments.length && list.selectable()( arguments[0])) {
						selection = arguments[0];
						return this;
					} else {
						return selection;
					}
				};
			})( this);

			this.options = Options( options);

			this.template = (function( list) {
				var template = list.options( 'template');

				if( !template && template!=='') {
					if( typeof( template)=='string') {
						if( document.getElementById( template)) {
							template = $( document.getElementById( template));
						} else {
							template = $.get( template);
						}
					} else if( !template) {
						template = 'ampere-crud-list.default.tmpl';
						if( document.getElementById( template)) {
							template = $( document.getElementById( template));
						} else {
							template = $.get( window.ov.ampere.defaults['ampere.baseurl'] + template);
						}
					}
				} else if( $.isFunction( template)) {
					template = template.call( list, list);
				}

				if( $.isFunction( template.promise)) {
					template.promise().done( function( data) {
						if( data instanceof HTMLElement) {
							data = $( data);
						}

						template = data.jquery ? (data[0].tagName=='SCRIPT' ? data.text().replace( "<![CDATA[", "").replace("]]>", "") : data) : template.responseText || data;
					});

						// attach promise to the crud list instance
					list.promise = template.promise;
				}

				return function() {
					return template;
				};
			})( this);

			this.init = function( state) {
				_ns.assert( window.ov.ampere.type( state)=='state', 'expected to be attached to a state but was attached to a "', window.ov.ampere.type( state), '"');

				this.state = function() {
					return state;
				};

					// eval name of instance
				var members = Object.keys( state);
				for( var i in members) {
					if( state[ members[ i]]===this) {
						break;
					}
				}
				var prefix = this.name();
				this.name = function() {
					return prefix + '(' + state.name() + '.' + members[ i] + ')';
				};

				var self = this;

					// install transitions if needed into state
				if( this.draggable()) {
					var draggable = this.draggable();
					if( $.isFunction( draggable)) {
						draggable = {
							callback : draggable
						};
						this.draggable( draggable);
					}

					if( !draggable.transition) {
						draggable.transition = state.transition( this.name() + '_move').
						action( function( transition, ui, data) {
								// data[0] is the event
							var event = data[0],
								dTR = event.data.items[0],
								newPosition = event.data.position,
								oldPosition = $( dTR).data( 'position');

							return function redo() {
									// remove note at index
								var item = self.get().splice( oldPosition, 1)[0];

									// insert at position
								self.get().splice( newPosition, 0, item);

								function undo() {
										// remove from position
									self.get().splice( newPosition, 1);

										// insert at index
									self.get().splice( oldPosition, 0, item);

									return $.Deferred().resolve( transition.options( 'redo.message')).promise( redo);
								}

								return $.Deferred().resolve( transition.options( 'undo.message')).promise( undo);
							};
						}).options( {
							'redo.message' : 'Item move undoed.',
							'undo.message' : 'Item moved.',
							'ampere.ui.description' : 'Drag to reorder items'
						});

						$.isFunction( draggable.callback) && draggable.callback.call( this, draggable);
					}
				}

				if( this.editable()) {
					var editable = this.editable();

					if( !editable.transition) {
						editable.transition = state.transition( this.name() + '_edit')
						.action( function( transition, ui, data) {
							var backup = {
								item : self.editable().item,
								workingcopy : self.editable().workingcopy,
								selection   : self.selection
							};

							var item = self.selection();
							var workingcopy = angular.copy( item);

							return function redo() {
								self.editable().item = item;
								self.editable().workingcopy = workingcopy;
								self.selection( backup.selection);

								return function undo() {
									self.editable().item = backup.item;
									self.editable().workingcopy = backup.workingcopy;
									self.selection( backup.item);

									return redo;
								}
							}
						})
						.options( {
							'ampere.ui.description' : 'Edit item',
							'ampere.ui.icon' 		: 'icon-pencil',
							'ampere.ui.caption' 	: null,
							'ampere.ui.hotkey' 		: 'F2'
						});
					}

					if( !editable.cancel) {
						editable.cancel = state.transition( this.name() + '_cancel')
						.action( function( transition, ui, data) {
							var backup = {
								item : self.editable().item,
								workingcopy : self.editable().workingcopy,
								selection   : self.selection
							};

							return function redo() {
								delete self.editable().item;
								delete self.editable().workingcopy;
								self.selection( backup.item);

								return function undo() {
									self.editable().item = backup.item;
									self.editable().workingcopy = backup.workingcopy;
									self.selection( backup.selection);

									return redo;
								}
							}
						}).options( {
							'ampere.ui.description' : 'Cancel editing',
							'ampere.ui.caption' 	: 'Cancel',
							'ampere.ui.hotkey' 		: 'Esc'
						});
					}

					if( !editable.update) {
						editable.update = state.transition( this.name() + '_update')
						.action( function( transition, ui, data) {
							var backup = {
								item : self.editable().item,
								workingcopy : self.editable().workingcopy,
								selection   : self.selection
							};
							var index = $.inArray( backup.item, self.get());

							return function redo() {
								self.get().splice( index, 1, self.editable().workingcopy);

								delete self.editable().item;
								delete self.editable().workingcopy;
								self.selection( backup.item);

								return function undo() {
									self.get().splice( index, 1, backup.item);

									self.editable().item = backup.item;
									self.editable().workingcopy = backup.workingcopy;
									self.selection( backup.selection);

									return redo;
								}
							}
						}).options( {
							'ampere.ui.description' : 'Update item',
							'ampere.ui.caption' 	: 'Update'
						});
					}

					$.isFunction( editable.callback) && editable.callback.call( this, editable);
				}

				if( this.removable()) {
					var removable = this.removable();

					if( !removable.transition || $.isFunction( removable.transition)) {
						var fn = removable.transition;

						removable.transition = state.transition( this.name() + '_remove')
						.action( function( transition, ui, data) {
						}).options( {
							'ampere.ui.description' : 'Remove item',
							'ampere.ui.icon' 		: 'icon-remove',
							'ampere.ui.caption' 	: null,
							'ampere.ui.hotkey' 		: 'Del'
						});

						$.isFunction( fn) && fn.call( removable.transition, removable.transition);
					} else {
						_ns.raise( 'removable() : dont know how to handle transition argument ', removable.transition);
					}
				}
			};

			return this;
		} else {
			return new List( array, columns, options);
		}
	};
	window.ov.ampere.crud.list.prototype = new window.ov.ampere.Component( 'window.ov.ampere.crud.list');

	window.ov.ampere.crud.angular = function( angularModule) {
		angularModule.directive( 'ngAmpereCrudList', [ '$compile', '$parse', '$window', function( $compile, $parse, $window) {
			return {
				restrict	: 'A',
				scope		: 'isolate',
				link		: function( scope, element, attrs) {
					scope.$watch( attrs.ngAmpereCrudList, function( oldListController, listController) {
						if( listController) {
							scope.list = listController;

							var template = listController.template();
							if( listController.draggable() || listController.options( 'onTemplate')) {
								var jTemplate = $( template);

								if( listController.draggable()) {
									var handle = listController.draggable().handle ? ", handle : '" + listController.draggable().handle + "'" : '';
									jTemplate.addClass( 'table-hover')
									.find( 'TBODY')
											/*
											tell ampere to make the table rows sortable by applying directive "ng-ampere-sortable"
											configure the sortable behaviour to
											- allow dragging only for item rows (having class .item)
											- execute transition "move" when a drag occures
										*/
									.attr(
										"ng-ampere-sortable", "{ items : 'TR.item'" + handle + ", transition : list.draggable().transition}"
									);

									if( listController.draggable().handle) {
										jTemplate.find( 'TR.item >TD').addClass( "ng-ampere-sortable-nohandle");
									}

									jTemplate.find( 'TBODY ' + (handle ? listController.draggable().handle : 'TR.item'))
									.attr( 'title', listController.draggable().transition.options( 'ampere.ui.description'));
								}

								var onTemplate = listController.options( 'onTemplate');
								if( $.isFunction( onTemplate)) {
									onTemplate.call( listController, jTemplate, listController);
								}

								template = jTemplate[0].outerHTML;
							}

							var f = $compile( template);
							var replacement = f( scope);

							element.empty().append( replacement);
						}
					});
				}
			};
		}]);
	};

	window.ov.ampere.defaults[ 'ampere.ui.angular'] = window.ov.ampere.defaults[ 'ampere.ui.angular'] || [];
	window.ov.ampere.defaults[ 'ampere.ui.angular'].push( window.ov.ampere.crud.angular);
})( jQuery);