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
					return $.extend( {}, column, {
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
									t[k] = $.isFunction(t[k]) ? t[k] : window.ov.ampere.util.getTemplate( t[k]);
								}

								return t;
							} else {
								return {
									append : "{{column.get( item)}}"
								};
							}
						})( column.template)
					});
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

			_ns.assert( $.isFunction( array) || $.isArray( array), 'first argument expected to be an array or <array>function() but is of type ', $.type( array));

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
				return $.isFunction( array) ? array.call( this, this) : array;
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
				 *      // (optional) if its a function the transition will be generated by the list
				 *      // and can be customized ithin the function
				 *   transition : (optional)<function( transition)>|<transition>,
				 *      // (optional) css selector referencing the dom element(s) acting as visual drag handle
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
				 *      // the editor template (i.e. content to be rendered into the TR.item)
				 *   template : <string>|<DOM Element>|<jQuery Collection>|<function>
				 *		// (optional) if its a function the transition will be generated by the list
				 *      // and can be customized within the function
				 *   transition : (optional)<function( transition)>|<transition>
				 * }
				 *
				 * @return the editable options when called without arguments, otherwise the list instance
				 */
			this.editable = (function( list) {
				var _options;

				return function( options) {
					if( arguments.length) {
						_ns.assert( $.isPlainObject( options), 'editable( options) : plain object expected as argument but was (', options, ')');
						_ns.assert( options.template, 'editable( options) : options.template expected but not given (', options.template, ')');
						_options = options;

						return list;
					}
					return _options;
				};
			})( this);

				/**
				 * @param options (optional) may be
				 * - object {
				 *      // the add editor template (i.e. content to be rendered into the TR.item)
				 *   template : <string>|<DOM Element>|<jQuery Collection>|<function>
				 *      // (optional) if its a function the transition will be generated by the list
				 *      // and can be customized within the function
				 *   transition : (optional)<function( transition)>|<transition>
				 * }
				 *
				 * @return the addable options when called without arguments, otherwise the list instance
				 */
			this.addable = (function( list) {
				var _options;

				return function( options) {
					if( arguments.length) {
						_ns.assert( $.isPlainObject( options), 'addable( options) : plain object expected as argument but was (', options, ')');
						_ns.assert( options.template, 'addable( options) : options.template expected but not given (', options.template, ')');
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
				 *      // (optional) the remove template (i.e. content to be rendered into the TR.item)
				 *   template : <string>|<DOM Element>|<jQuery Collection>|<function>
				 *      // (optional) if its a function the transition will be generated by the list
				 *      // and can be customized within the function
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
							// disable editor (if given)
						return this;
					} else {
						return $.inArray( selection, list.get())!=-1 ? selection : undefined;
					}
				};
			})( this);

			this.options = Options( $.extend( {}, window.ov.ampere.crud.list.DEFAULTS, options || {}));

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

				/**
				 * @returns {Object} either addable, editable or undefined if no editing is currently in action
				 */
			this.getEditingContext = function getEditingContext() {
				return (this.addable() &&  this.addable().item!==undefined && this.addable()) ||
				(this.editable() && this.editable().item!==undefined && this.editable());
			};

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
				var stateProperty = members[ i], prefix = this.name();
				this.name = function() {
					return prefix + '(' + state.name() + '.' + stateProperty + ')';
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
						draggable.transition = state.transition( state.name() + '.' + stateProperty + '.list_move').
						action( function( transition, ui, data) {
								// data[0] is the event
							var event = data[0],
								dTR = event.data.items[0],
									// adjust newPosition based on addable TR is relevant
								newPosition = event.data.position;

									// substract 1 if not addable or addable.index==0
								newPosition -= self.addable() && self.addable().index && self.addable().item!==undefined ? 0 : 1;

								oldPosition = $( dTR).data( 'position');

							if( newPosition==oldPosition) {
								return;
							}

								// shutdown addable if active
							if( self.editable()) {
								delete self.editable().item;
							}

								// shutdown addable if active
							if( self.addable()) {
								delete self.addable().item;
							}

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

									return $.Deferred().resolve( transition.options( 'undo.message')).promise( redo);
								}

								return $.Deferred().resolve( transition.options( 'redo.message')).promise( undo);
							};
						}).options( {
							'undo.message' : 'Item move undoed.',
							'redo.message' : 'Item moved.',
							'ampere.ui.description' : 'Drag to reorder items'
						});

						$.isFunction( draggable.callback) && draggable.callback.call( this, draggable);
					}
				}

				if( this.editable()) {
					var editable = this.editable();

					if( !$.isFunction( editable.template)) {
						var template = editable.template;
						editable.template = function() {
							return window.ov.ampere.util.getTemplate( template);
						};
					}

					if( !editable.transition) {
						editable.transition = state.transition( state.name() + '.' + stateProperty + '.list_editable')
						.enabled( function() {
							return self.selection()!==undefined && editable.item===undefined;
						})
						.action( function( transition, ui, data) {
							var selection = self.selection();

								// shutdown addable if active
							if( self.addable()) {
								delete self.addable().item;
							}

								// transfer item copy into editable
							self.editable().item = angular.copy( selection);

							return function redo() {
								self.selection( selection);

								return function undo() {
									self.selection( selection);

									return redo;
								};
							};
						})
						.active( function() {
							return self.editable().item!==undefined;
						})
						.options( {
							'ampere.ui.description'	: 'Edit item',
							'ampere.ui.icon'		: 'icon-pencil',
							'ampere.ui.caption'		: null,
							'ampere.ui.hotkey'		: 'F2'
						});
					}

					if( !editable.cancel) {
						editable.cancel = state.transition( state.name() + '.' + stateProperty + '.list_cancel_editable')
						.enabled( function() {
							return self.editable().item!==undefined;
						})
						.action( function( transition, ui, data) {
							var item = self.selection();

								// remove item from edit to prevent repeated editor rendering in undo/redo ops
							delete self.editable().item;

							return function redo() {
								self.selection( item);

								function undo() {
									self.selection( item);
								};
							};

						}).options( {
							'ampere.ui.description' : 'Cancel editing',
							'ampere.ui.caption'		: 'Cancel',
							'ampere.ui.hotkey'		: 'Esc'
						});
					}

					if( !editable.commit) {
						editable.commit = state.transition( state.name() + '.' + stateProperty + '.list_commit_editable')
						.enabled( function() {
							return editable.item!==undefined;
						})
						.action( function( transition, ui, data) {
							var workingcopy = editable.item,
								selection = self.selection(),
								index = $.inArray( selection, self.get());

								// remove item from edit to prevent repeated editor rendering in undo/redo ops
							delete editable.item;

								// return immediately without doing anything
							if( angular.equals( workingcopy, selection)) {
								return true;
							}

							return function redo() {
								self.get().splice( index, 1, workingcopy);
								self.selection( workingcopy);

								function undo() {
									self.get().splice( index, 1, selection);
									self.selection( selection);

									return $.Deferred().resolve( transition.options( 'undo.message')).promise( redo);
								};

								return $.Deferred().resolve( transition.options( 'redo.message')).promise( undo);
							};
						}).options( {
							'undo.message'			: 'Item update undoed.',
							'redo.message'			: 'Item updated.',
							'ampere.ui.description' : 'Apply changes',
							'ampere.ui.caption'		: 'Apply',
							'ampere.ui.hotkey'		: 'Shift+Alt+S'
						});
					}

					$.isFunction( editable.callback) && editable.callback.call( this, editable);
				}

				if( this.addable()) {
					var addable = this.addable();

					if( !$.isFunction( addable.template)) {
						var template = addable.template;
						addable.template = function() {
							return window.ov.ampere.util.getTemplate( template);
						};
					}

					if( !addable.transition) {
						addable.transition = state.transition( state.name() + '.' + stateProperty + '.list_addable')
						.enabled( function() {
							return addable.item===undefined;
						})
						.action( function( transition, ui, data) {
							var selection=self.selection();

								// disable editable if active
							if( self.editable()) {
								delete self.editable().item;
							}

								// transfer item copy into editable
							addable.item = { };
							addable.index = self.get().length;

							return function redo() {
								self.selection( selection);

								return function undo() {
									self.selection( selection);

									return redo;
								};
							};
						})
						.active( function() {
							return self.addable().item!==undefined;
						})
						.options( {
							'ampere.ui.description' : 'Add item',
							'ampere.ui.caption'		: 'Add new item',
							'ampere.ui.hotkey'		: 'Shift+Alt+N'
						});
					}

					if( !addable.cancel) {
						addable.cancel = state.transition( state.name() + '.' + stateProperty + '.list_cancel_addable')
						.enabled( function() {
							return addable.item!==undefined;
						})
						.action( function( transition, ui, data) {
							var selection = self.selection();

								// remove item from addable to prevent repeated addable editor rendering in undo/redo ops
							delete addable.item;

							return function redo() {
								self.selection( selection);

								return function undo() {
									self.selection( selection);

									return redo;
								};
							};
						}).options( {
							'ampere.ui.description' : 'Cancel adding item',
							'ampere.ui.caption'		: 'Cancel',
							'ampere.ui.hotkey'		: 'Esc'
						});
					}

					if( !addable.commit) {
						addable.commit = state.transition( state.name() + '.' + stateProperty + '.list_commit_addable')
						.enabled( function() {
							return addable.item!==undefined;
						})
						.action( function( transition, ui, data) {
							var item=addable.item,
								index=addable.index && addable.index || 0,
								selection = self.selection();

								// remove addable item prevent repeated add editor rendering in undo/redo ops
							delete addable.item;

							return function redo() {
								self.get().splice( index, 0, item);
								self.selection( item);

								function undo() {
									self.get().splice( index, 1);
									self.selection( selection);

									return $.Deferred().resolve( transition.options( 'undo.message')).promise( redo);
								};

								return $.Deferred().resolve( transition.options( 'redo.message')).promise( undo);
							};
						}).options( {
							'undo.message'			: 'Item add undoed.',
							'redo.message'			: 'Item added.',
							'ampere.ui.description' : 'Add item',
							'ampere.ui.caption'		: 'Add',
							'ampere.ui.hotkey'		: 'Shift+S'
						});
					}

					$.isFunction( addable.callback) && addable.callback.call( this, addable);
				}

				if( this.removable()) {
					var removable = this.removable();

					var fn = removable.callback;

					if( !removable.transition || $.isFunction( removable.transition)) {
						removable.transition = state.transition( state.name() + '.' + stateProperty + '.list_remove')
						.enabled( function() {
								// disabled if addable or editable active
							 return (!self.addable() || self.addable().item===undefined) && (!self.editable() || self.editable().item===undefined) && self.selection()!==undefined;
						 })
						.action( function( transition, ui, data) {
							var confirmMessage = removable.transition.options( 'confirm.message');
							if( !confirmMessage || window.confirm( confirmMessage)) {
								var item = self.selection(), index = $.inArray( item, self.get());

								return function redo() {
									self.get().splice( index, 1);

									function undo() {
										self.get().splice( index, 0, item);

										return $.Deferred().resolve( transition.options( 'undo.message')).promise( redo);
									};

									return $.Deferred().resolve( transition.options( 'redo.message')).promise( undo);
								};
							}
						}).options( {
							'confirm.message'		: 'Really want to remove item ?',
							'undo.message'			: 'Item remove undoed.',
							'redo.message'			: 'Item removed.',
							'ampere.ui.description' : 'Remove item',
							'ampere.ui.icon'		: 'icon-trash',
							'ampere.ui.caption'		: null,
							'ampere.ui.hotkey'		: 'Del'
						});
					} else {
						_ns.raise( 'removable() : dont know how to handle transition argument ', removable.transition);
					}

					$.isFunction( fn) && fn.call( removable, removable);
				}

				if( this.selectable()) {
					var selectable = this.selectable();

					state.transition( state.name() + '.' + stateProperty + '.list_down')
					.enabled( function() {
							// disabled if addable or editable active
						return !(self.addable() && self.addable().item) && !(self.editable() && self.editable().item);
					})
					.action( function( transition, ui, data) {
						self.selection( window.ov.entity.next( self.rows, self.selection()) || self.selection());

						ui.scrollIntoView( $( 'TR.active:first').next(), true);

							// force updating the view by returning true
						return false;
					}).options( {
						'ampere.ui.description' : 'Next item',
						'ampere.ui.icon'		: 'icon-down',
						'ampere.ui.caption'		: 'Next',
						'ampere.ui.hotkey'		: 'down'
					});

					state.transition( state.name() + '.' + stateProperty + '.list_up')
					.enabled( function() {
							// disabled if addable or editable active
						return !(self.addable() && self.addable().item) && !(self.editable() && self.editable().item);
					})
					.action( function( transition, ui, data) {
						self.selection( window.ov.entity.prev( self.rows, self.selection()) || self.selection());

						ui.scrollIntoView( $( 'TR.active:first').prev());
							// force updating the view by returning true
						return false;
					}).options( {
						'ampere.ui.description' : 'Previous item',
						'ampere.ui.icon'		: 'icon-down',
						'ampere.ui.caption'		: 'Previous',
						'ampere.ui.hotkey'		: 'up'
					});

					state.transition( state.name() + '.' + stateProperty + '.list_home')
					.enabled( function() {
							// disabled if addable or editable active
						return !(self.addable() && self.addable().item) && !(self.editable() && self.editable().item);
					})
					.action( function( transition, ui, data) {
						self.selection( window.ov.entity.first( self.rows, self.selection()) || self.selection());

						ui.scrollIntoView( $( 'TR.item:first'));

							// force updating the view by returning true
						return false;
					}).options( {
						'ampere.ui.description' : 'First item',
						'ampere.ui.caption'		: 'Home',
						'ampere.ui.hotkey'		: 'home'
					});

					state.transition( state.name() + '.' + stateProperty + '.list_end')
					.enabled( function() {
							// disabled if addable or editable active
						return !(self.addable() && self.addable().item) && !(self.editable() && self.editable().item);
					})
					.action( function( transition, ui, data) {
						self.selection( window.ov.entity.last( self.rows, self.selection()) || self.selection());

						ui.scrollIntoView( $( 'TR.item:last'));

							// force updating the view by returning true
						return false;
					}).options({
						'ampere.ui.description' : 'Last item',
						'ampere.ui.caption'		: 'End',
						'ampere.ui.hotkey'		: 'end'
					});
				}
			};

			return this;
		} else {
			return new List( array, columns, options);
		}
	};
	window.ov.ampere.crud.list.prototype = new window.ov.ampere.Component( 'window.ov.ampere.crud.list');
	window.ov.ampere.crud.list.DEFAULTS = {
		'list-empty.message'	: 'List is empty.',
		'list-nomatches.message': 'No item matches filter.'
	};

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

							var jTemplate = $( template);

							jTemplate.addClass( element.attr( 'class'));
							jTemplate.attr( 'style', element.attr( 'style'));

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

							var f = $compile( template);
							var replacement = f( scope);

							element.replaceWith( replacement);
						}
					});
				}
			};
		}]);
	};

	window.ov.ampere.defaults[ 'ampere.ui.angular'] = window.ov.ampere.defaults[ 'ampere.ui.angular'] || [];
	window.ov.ampere.defaults[ 'ampere.ui.angular'].push( window.ov.ampere.crud.angular);
})( jQuery);