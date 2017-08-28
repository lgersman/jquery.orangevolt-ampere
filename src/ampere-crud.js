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

	function Template( control, default_tmpl) {
		var template = control.options( 'template');

		if( !template && template!=='') {
			if( typeof( template)=='string') {
				if( document.getElementById( template)) {
					template = $( document.getElementById( template));
					template && (template=window.ov.ampere.util.getTemplate( template));
				} else {
					template = $.get( template);
				}
			} else if( !template) {
				template = default_tmpl;
				if( document.getElementById( template)) {
					template = $( document.getElementById( template));
					template && (template=window.ov.ampere.util.getTemplate( template));
				} else {
					template = $.get( window.ov.ampere.defaults['ampere.baseurl'] + template);
				}
			}
		} else if( $.isFunction( template)) {
			template = template.call( control, control);
		}

		if( $.isFunction( template.promise)) {
			template.promise().done( function( data) {
				if( data instanceof HTMLElement) {
					data = $( data);
				}

				template = data.jquery ? (data[0].tagName=='SCRIPT' ? data.text().replace( "<![CDATA[", "").replace("]]>", "") : data) : template.responseText || data;
			});

				// attach promise to the crud control instance
			control.promise = template.promise;
		}

		return function() {
			return template;
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
				 * - function the (single) getter for the item property to render as cell value
				 * - function returning an array of column definitions
				 * - object { get : <string>|<function> } same as above
				 * - object { template : <string> } the angular template to render the item column
				 * - object { get : <string>|<function>, template : <string> } combination of both get and template
				 *
				 * if columns is not an array it will be assumed to be a single column element and converted into an array
				 *
				 * @return the colums array
				 */
			this.columns = function(columns) {
				if(arguments.length) {
					if($.isFunction(columns)) {
						columns = columns();
					}

					if($.isArray( columns)) {
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

					this.columns.values = columns;
					return this;
				}

				return this.columns.values;
			}.bind(this);
			this.columns.values = [];
			this.columns(columns);

			this.get = function() {
				return $.isFunction( array) ? array.call( this, this) : array;
			};

				/**
				 * @param headers array or object providing header informations
				 * <array> a header element can be :
				 * - string the header value
				 * - function the getter for a (single) header value
				 * - function returning an array of header definitions
				 * - object { get : <string>|<function> } same as above
				 * - object { template : <string> } the angular template to render the item header
				 * - object { get : <string>|<function>, template : <string> } combination of both get and template
				 *
				 * if headers is not an array it will be assumed to be a single header element and converted into an array
				 *
				 * @return the headers array when called without arguments, otherwise the list instance
				 */
			this.headers = function(headers) {
				if( arguments.length) {
					if($.isFunction(headers)) {
						headers = headers();
						if( !$.isArray(headers)) {
							headers = [headers];
						}
					}

					if($.isArray( headers)) {
						for( var i=0; i<headers.length; i++) {
							headers[i] = header( headers[i]);
						}
					}

					_ns.assert( headers.length===this.columns().length, "count of headers(=", headers.length, ") !== count of columns(=", this.columns().length, ")");
					this.headers.values = headers;
					return this;
				}

				return this.headers.values;
			}.bind(this);
			this.headers.values = [];

			this.sortable = (function( list) {
				var _sortable = {
					orderBy		: false,	// token to match or false for no sorting
					reverse     : true,		// acending/descending
					delegated   : false		// set this property to true to delegate sorting to someone else (->paginator or example)
				};

				return function( fn, reverse, delegated) {
					if( arguments.length) {
						_sortable.orderBy = fn || false;
						arguments.length>1 && (_sortable.reverse=reverse);
						arguments.length>2 && (_sortable.delegated=delegated);

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
				 * accessor for the splice property.
				 * splice can be used to set a custom splice function used by removable/addable/editable
				 * splice is by default mapped directly to Array.prototype.splice.
				 * the array asociated with the list will only be modified using the function provided via the splice accessor.
				 *
				 * @param  {spliceFn} optional parameter to set the splice function used by the list
				 * @return the list if called with _spliceFn argument as setter, otherwise the list instance
				 */
			this.splice = (function( list) {
				var spliceFn = Array.prototype.splice;

				return function( _spliceFn) {
					if( arguments.length) {
						_ns.assert( $.isFunction( _spliceFn), 'argument expected to be a array like splice function');
						spliceFn = _spliceFn;

						return list;
					}
					return spliceFn;
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

				/**
				 * combined getter/setter.
				 *
				 * if called with argument, the argument will be set.
				 * if called without argument, the current selection will be returned.
				 * the getter is implemented as "save method" : if the last selection is no more in the model (->get()) undefined will be returned.
				 * -> you can access anyway the stale selection via list.selection.value. this is unsafe but in rare cases very useful.
				 *
				 * @return the selected object
				 */
			this.selection = (function( list) {
				var fn = function(value, cb) {
						// cb is usually paginator.setPageContainingItem when given to support adjustment of the current data seen by the table
					cb && cb(value);
					if( arguments.length && list.selectable()(value)) {
						fn.value = value;

							// disable editor (if given)
						return this;
					} else {
						return $.inArray( fn.value, list.get())!=-1 ? fn.value : undefined;
					}
				};

				fn.value = undefined;

				return fn;
			})( this);

			this.options = Options( $.extend( {}, window.ov.ampere.crud.list.DEFAULTS, options || {}));

			this.template = Template( this, 'ampere-crud-list.default.tmpl');

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
				this.transitions = {};

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
						self.transitions.move = draggable.transition = state.transition( state.name() + '.' + stateProperty + '.list_move')
						.action( function( transition, ui, data) {
								// data[0] is the event
							var event = data[0],
								dTR = event.data.items[0],
									// adjust newPosition based on addable TR is relevant
								newPosition = event.data.position;

									// substract 1 if not addable or addable.index==0
								newPosition -= self.addable() && self.addable().index && self.addable().item!==undefined ? 0 : 1;

								var oldPosition = $( dTR).data( 'position');

							event.data.oldPosition = oldPosition;
							event.data.newPosition = newPosition;

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
									// remove item at index
								var item = self.splice().call( self.get(), oldPosition, 1)[0];

									// insert at position
								self.splice().call( self.get(), newPosition, 0, item);

								function undo() {
										// remove from position
									self.splice().call( self.get(), newPosition, 1);

										// insert at index
									self.splice().call( self.get(), oldPosition, 0, item);

									var undoMessage = transition.options( 'undo.message');
									if( $.isFunction( undoMessage)) {
										undoMessage = undoMessage.call( self);
									}
									return $.Deferred().resolve( undoMessage).promise( redo);
								}

								var redoMessage = transition.options( 'redo.message');
								if( $.isFunction( redoMessage)) {
									redoMessage = redoMessage.call( self);
								}
								return $.Deferred().resolve( redoMessage).promise( undo);
							};
						})
						.options( {
							'undo.message' : 'Item move undoed.',
							'redo.message' : 'Item moved.',
							'ampere.ui.description' : 'Drag to reorder items'
						})
						.enabled( function() {
								// dragging is only enabled when rows are unsorted
							return !self.sortable().orderBy &&
								// and
								!self.getEditingContext();
						});

						$.isFunction( draggable.callback) && draggable.callback.call( this, draggable);
					}
				}

				var template;
				if( this.editable()) {
					var editable = this.editable();

					if( !$.isFunction( editable.template)) {
						template = editable.template;
						editable.template = function() {
							return window.ov.ampere.util.getTemplate( template);
						};
					}

					if( !editable.transition) {
						self.transitions.edit = editable.transition = state.transition( state.name() + '.' + stateProperty + '.list_editable')
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

								return function undo() {
									self.selection( item);

									return redo;
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
								self.splice().call( self.get(), index, 1, workingcopy);
								self.selection( workingcopy);

								function undo() {
									self.splice().call( self.get(), index, 1, selection);
									self.selection( selection);

									var undoMessage = transition.options( 'undo.message');
									if( $.isFunction( undoMessage)) {
										undoMessage = undoMessage.call( self);
									}
									return $.Deferred().resolve( undoMessage).promise( redo);
								}

								var redoMessage = transition.options( 'redo.message');
								if( $.isFunction( redoMessage)) {
									redoMessage = redoMessage.call( self);
								}
								return $.Deferred().resolve( redoMessage).promise( undo);
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
						template = addable.template;
						addable.template = function() {
							return window.ov.ampere.util.getTemplate( template);
						};
					}

					if( !addable.transition) {
						self.transitions.add = addable.transition = state.transition( state.name() + '.' + stateProperty + '.list_addable')
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
								self.splice().call( self.get(), index, 0, item);
								self.selection( item);

								function undo() {
									self.splice().call( self.get(), index, 1);
									self.selection( selection);

									var undoMessage = transition.options( 'undo.message');
									if( $.isFunction( undoMessage)) {
										undoMessage = undoMessage.call( self);
									}

									return $.Deferred().resolve( undoMessage).promise( redo);
								}

								var redoMessage = transition.options( 'redo.message');
								if( $.isFunction( redoMessage)) {
									redoMessage = redoMessage.call( self);
								}
								return $.Deferred().resolve( transition.options( 'redo.message')).promise( undo);
							};
						}).options( {
							'undo.message'			: 'Item add undoed.',
							'redo.message'			: 'Item added.',
							'ampere.ui.description' : 'Add item',
							'ampere.ui.caption'		: 'Add',
							'ampere.ui.hotkey'		: 'Shift+Alt+S'
						});
					}

					$.isFunction( addable.callback) && addable.callback.call( this, addable);
				}

				if( this.removable()) {
					var removable = this.removable();

					var fn = removable.callback;

					if( !removable.transition || $.isFunction( removable.transition)) {
						self.transitions.remove = removable.transition = state.transition( state.name() + '.' + stateProperty + '.list_remove')
						.enabled( function() {
								// disabled if addable or editable active
							 return (!self.addable() || self.addable().item===undefined) && (!self.editable() || self.editable().item===undefined) && self.selection()!==undefined;
						 })
						.action( function( transition, ui, data) {
							var confirmMessage = removable.transition.options( 'confirm.message');
							if( $.isFunction( confirmMessage)) {
								confirmMessage = confirmMessage.call( this);
							}

							if( !confirmMessage || window.confirm( confirmMessage)) {
								var item = self.selection(), index = $.inArray( item, self.get());

								return function redo() {
									self.splice().call( self.get(), index, 1);

									function undo() {
										self.splice().call( self.get(), index, 0, item);

										var undoMessage = transition.options( 'undo.message');
										if( $.isFunction( undoMessage)) {
											undoMessage = undoMessage.call( self);
										}
										return $.Deferred().resolve( undoMessage).promise( redo);
									}

									var redoMessage = transition.options( 'redo.message');
									if( $.isFunction( redoMessage)) {
										redoMessage = redoMessage.call( self);
									}
									return $.Deferred().resolve( redoMessage).promise( undo);
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

				var selectAsTransition = function() {
					var value = self.options( 'list-select-as-transition');
					return $.isFunction( value) && value.call( self) || value;
				};

				if( this.selectable()) {
					var selectable = this.selectable();

					self.transitions.select = state.transition( state.name() + '.' + stateProperty + '.list_select')
					.enabled( function() {
							// disabled if addable or editable active
							//(!list.addable() || list.addable().item==undefined) && (!list.editable() || list.editable().item==undefined)
						return !self.getEditingContext();
						//return (!list.addable() || list.addable().item==undefined) && (!list.editable() || list.editable().item==undefined);
					})
					.action( function( transition, ui, data) {
						var oldSelection = self.selection(),
							position     = data[0] && $( data[0].currentTarget).data( 'position'),
							newSelection = $.isNumeric( position) && self.get().length>position && self.get()[ position] || data.length==2 && data[1];

							// doit nevertheless when the data are not provided as event
						if( oldSelection!==newSelection || !data[0]) {
							var redo = function() {
								self.selection( newSelection);

								return function undo() {
									self.selection( oldSelection);

									return redo;
								};
							};

							return selectAsTransition() ? redo : redo() && undefined;
						}
					}).options( {
						'ampere.ui.description' : 'Select item by mousedown',
						'ampere.ui.caption'		: ''
					});

					state.transition( state.name() + '.' + stateProperty + '.list_down')
					.enabled( function() {
							// disabled if addable or editable active
						return !(self.addable() && self.addable().item) && !(self.editable() && self.editable().item);
					})
					.action( function( transition, ui, data) {
						var oldSelection = self.selection(),
							newSelection = window.ov.entity.next( self.rows, self.selection()) || self.selection();

						/*
						self.selection( window.ov.entity.next( self.rows, self.selection()) || self.selection());
						ui.scrollIntoView( $( 'TR.active:first').next(), true);
						*/
						if( oldSelection!==newSelection) {
							var redo = function() {
								self.selection( newSelection);
								ui.scrollIntoView( $( 'TR.active:first').next(), true);

								return function undo() {
									self.selection( oldSelection);
									ui.scrollIntoView( $( 'TR.active:first').prev());

									return redo;
								};
							};
							return selectAsTransition() ? redo : redo() && undefined;
						}
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
						var oldSelection = self.selection(),
							newSelection = window.ov.entity.prev( self.rows, self.selection()) || self.selection();

						/*
							self.selection( window.ov.entity.prev( self.rows, self.selection()) || self.selection());
							ui.scrollIntoView( $( 'TR.active:first').prev());
						*/
						if( oldSelection!==newSelection) {
							var redo = function() {
								self.selection( newSelection);
								ui.scrollIntoView( $( 'TR.active:first').prev());

								return function undo() {
									self.selection( oldSelection);
									ui.scrollIntoView( $( 'TR.active:first').next(), true);

									return redo;
								};
							};
							return selectAsTransition() ? redo : redo() && undefined;
						}
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
						var oldSelection = self.selection(),
							newSelection = window.ov.entity.first( self.rows, self.selection()) || self.selection();

						/*
							self.selection( window.ov.entity.first( self.rows, self.selection()) || self.selection());
							ui.scrollIntoView( $( 'TR.item:first'));
						*/
						if( oldSelection!==newSelection) {
							var redo = function() {
								self.selection( newSelection);
								ui.scrollIntoView( $( 'TR.item:first'));

								return function undo() {
									self.selection( oldSelection);
									ui.scrollIntoView( $( 'TR.active:first'), true);

									return redo;
								};
							};
							return selectAsTransition() ? redo : redo() && undefined;
						}
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
						var oldSelection = self.selection(),
							newSelection = window.ov.entity.last( self.rows, self.selection()) || self.selection();

						/*
							self.selection( window.ov.entity.last( self.rows, self.selection()) || self.selection());
							ui.scrollIntoView( $( 'TR.item:last'));
						*/
						if( oldSelection!==newSelection) {
							var redo = function() {
								self.selection( newSelection);
								ui.scrollIntoView( $( 'TR.item:last'));

								return function undo() {
									self.selection( oldSelection);
									ui.scrollIntoView( $( 'TR.active:first'));

									return redo;
								};
							};
							return selectAsTransition() ? redo : redo() && undefined;
						}
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
		'list-nomatches.message': 'No item matches filter.',
		'list-item-dblclick'    : function() {
			return (this.editable() && this.editable().transition) || false;
		},
			// make list selections behave as transitions
			// if value is a function it gets called and the
			// returned value is evaluated
		'list-select-as-transition' : false
	};

	window.ov.ampere.crud.list.angular = function( angularModule) {
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

							template = jTemplate[0].outerHTML;

							var f = $compile( template);
							var replacement = f( scope);

							element.replaceWith( replacement);

							listController.element = replacement;
							replacement.data('ngAmpereCrudList', listController);
							element.data('ngAmpereCrudList', listController);
						}
					});
				}
			};
		}]);
	};

	window.ov.ampere.defaults[ 'ampere.ui.angular'] = window.ov.ampere.defaults[ 'ampere.ui.angular'] || [];
	window.ov.ampere.defaults[ 'ampere.ui.angular'].push( window.ov.ampere.crud.list.angular);

	/*
		paginator
	 */

	window.ov.ampere.crud.paginator = function Paginator( array, options) {
		if( this instanceof Paginator) {
			_ns.assert( $.isFunction( array) || $.isArray( array), 'first argument expected to be an array or <array>function() but is of type ', $.type( array));
			this.get = function() {
				return $.isFunction( array) ? array.call( this, this) : array;
			};

			this.options = Options( $.extend( {}, window.ov.ampere.crud.paginator.DEFAULTS, options || {}));

			this.template = Template( this, 'ampere-crud-paginator.default.tmpl');

			this.setPageContainingItem = (function(item) {
				this.getPageItems.reset();
				if (this.getItemCountPerPage()) {
					const index = this.get().indexOf(item),
						page = Math.floor(index / this.getItemCountPerPage()) + 1;
					this.currentPageNumber(page);
				}
			}).bind(this);

				/**
				 * @return the number of pages
				 */
			this.getPageCount = function() {
				if( this.getItemCountPerPage()===Infinity || this.getItemCountPerPage()<1) {
					return 1;
				}

				var length = this.getPageItems().length;
				return Math.max( Math.ceil( length / this.getItemCountPerPage()), 1);
			};

				/**
				 * @return the number of items per page
				 */
			this.getItemCountPerPage = function() {
				return this.options( 'itemCountPerPage');
			};

				/**
				 * sets or gets the current page number
				 *
				 * @param {int} currentPageNumber (optional) pagenumber when used as setter
				 * @return the current page number when used as getter, otherwise this
				 */
			this._currentPageNumber = 1;
			this.currentPageNumber = function( currentPageNumber) {
				if( arguments.length) {
					_ns.assert(
						currentPageNumber<=this.getPageCount(),
						'currentPageNumber(=' + currentPageNumber + ') must be less than pageCount(=' + this.getPageCount() + ')'
					);

					this._currentPageNumber = currentPageNumber;
					return this;
				} else {
					return this._currentPageNumber;
				}
			};

				/**
				 * takes a filter function( item)->boolean as argument
				 * if set, the whole array will always be filtered before display
				 *
				 * @return this when called without arguments, otherwise the filter object
				 */
			this.filter = (function() {
				var filter = $.noop;

				return function() {
					if( arguments.length && $.isFunction( arguments[0])) {
						filter = arguments[0];
					}
					return arguments.length ? this : filter;
				};
			})();

				/**
				 * return all items matching filter
				 *
				 * @return {array} resulting filtered array
				 */
			this.getPageItems = function() {
				var filter = this.filter();
				if( filter===$.noop) {
					return this.get();
				}

				var filtered = this.get().slice( 0), i=filtered.length;
				while( i--) {
					if( !filter.call( this, filtered[i])) {
						filtered.splice( i, 1);
					}
				}

					// adjust currentPageNumber
				var pageCount = this.getItemCountPerPage()===Infinity || this.getItemCountPerPage()<1 ? 1 : Math.ceil( filtered.length / this.getItemCountPerPage());
				if( this._currentPageNumber>pageCount) {
					this._currentPageNumber=pageCount || 1;
				}

					return filtered;
			};

				/**
				 * @return return all items of the current page
				 */
			this.getCurrentPageItems = $.proxy( function() {
				var pageItems = this.getPageItems();

				if( this.getItemCountPerPage()===Infinity || this.getItemCountPerPage()<1) {
					return pageItems;
				}

				var ofs = this.getItemCountPerPage()*(this._currentPageNumber-1);

				return pageItems.slice( ofs, Math.min( ofs + this.getItemCountPerPage(), pageItems.length));
			}, this);

			this.getPageRange = function() {
				var pageCount           = this.getPageCount(),
					pageRange           = Math.min( this.options('pageRange')-1, pageCount),
					currentPageNumber   = this.currentPageNumber(),
					half                = Math.floor( pageRange/2);

				var min = Math.max( currentPageNumber - half, 1);
				var max = Math.min( min + pageRange, pageCount);

				if( max-min<pageRange) {
					min = pageRange>=pageCount ? 1 : pageCount-pageRange;
				}

				var result = [];
				for(var i=min;i<=max; i++) {
					result.push( i);
				}

				return result;
			};

			var propertyWrapper = function() {
				var current = $.noop;

				return function( value) {
					if( arguments.length) {
						current = value;
						return this;
					} else {
						return current;
					}
				};
			};

				// getter/setter for the paginator transitions
			this.gotoFirstPage = propertyWrapper();
			this.gotoPrevPageRange = propertyWrapper();
			this.gotoPrevPage = propertyWrapper();
			this.gotoPage = propertyWrapper();
			this.gotoNextPage = propertyWrapper();
			this.gotoNextPageRange = propertyWrapper();
			this.gotoLastPage = propertyWrapper();

				// getter / setter for enablement
			this.enabled = (function() {
				var current = $.noop;

				return function( value) {
					if( arguments.length) {
						current = value;
						return this;
					} else {
						return current;
					}
				};
			})();

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

				var self = this, callback;

				this.gotoFirstPage((function( cb) {
					var transition = state.transition( state.name() + '.' + stateProperty + '.firstpage')
					.action( function( transition, ui, data) {
						self.currentPageNumber( 1);
					})
					.enabled( function() {
						var enabled = self.enabled().call( self, transition);
						return (enabled===undefined || enabled)  && self.currentPageNumber()>1;
					})
					.options({
						'ampere.ui.caption'     : self.options( 'firstpage.caption'),
						'ampere.ui.description' : self.options( 'firstpage.description'),
						'ampere.ui.icon'        : self.options( 'firstpage.icon')
					});

					cb.call( self, transition);

					return transition;
				})( this.gotoFirstPage()));

				this.gotoPrevPageRange((function( cb) {
					var transition = state.transition( state.name() + '.' + stateProperty + '.prevpagerange')
					.action( function( transition, ui, data) {
						self.currentPageNumber( Math.max( self.currentPageNumber()-self.options( 'pageRange'), 1));
					})
					.enabled( function() {
						var enabled = self.enabled().call( self, transition);
						return (enabled===undefined || enabled) && self.currentPageNumber()>1;
					})
					.options({
						'ampere.ui.caption'     : self.options( 'prevpagerange.caption'),
						'ampere.ui.description' : self.options( 'prevpagerange.description'),
						'ampere.ui.icon'        : self.options( 'prevpagerange.icon')
					});

					cb.call( self, transition);

					return transition;
				})( this.gotoPrevPageRange()));

				this.gotoPrevPage((function( cb) {
					var transition = state.transition( state.name() + '.' + stateProperty + '.prevpage')
					.action( function( transition, ui, data) {
						 self.currentPageNumber( self.currentPageNumber()-1);
					})
					.enabled( function() {
						var enabled = self.enabled().call( self, transition);
						return (enabled===undefined || enabled) && self.currentPageNumber()>1;
					})
					.options({
						'ampere.ui.caption'     : self.options( 'prevpage.caption'),
						'ampere.ui.description' : self.options( 'prevpage.description'),
						'ampere.ui.icon'        : self.options( 'prevpage.icon')
					});

					cb.call( self, transition);

					return transition;
				})( this.gotoPrevPage()));

				this.gotoPage((function( cb) {
					var transition = state.transition( state.name() + '.' + stateProperty + '.page')
					.action( function( transition, ui, data) {
						var event = data[0];
						var page = $( event.target).data( 'page');

						self.currentPageNumber( page);
					})
					.enabled( function() {
						var enabled = self.enabled().call( self, transition);
						return (enabled===undefined || enabled);
					})
					.options({
						'ampere.ui.caption'     : self.options( 'page.caption'),
						'ampere.ui.description' : self.options( 'page.description'),
						'ampere.ui.icon'        : self.options( 'page.icon')
					});

					cb.call( self, transition);

					return transition;
				})( this.gotoPage()));

				this.gotoNextPage((function( cb) {
					var transition = state.transition( state.name() + '.' + stateProperty + '.nextpage')
					.action( function( transition, ui, data) {
						self.currentPageNumber( self.currentPageNumber()+1);
					})
					.enabled( function() {
						var enabled = self.enabled().call( self, transition);
						return (enabled===undefined || enabled) && (self.currentPageNumber() < self.getPageCount());
					})
					.options({
						'ampere.ui.caption'     : self.options( 'nextpage.caption'),
						'ampere.ui.description' : self.options( 'nextpage.description'),
						'ampere.ui.icon'        : self.options( 'nextpage.icon')
					});

					cb.call( self, transition);

					return transition;
				})( this.gotoNextPage()));

				this.gotoNextPageRange((function( cb) {
					var transition = state.transition( state.name() + '.' + stateProperty + '.nextpagerange')
					.action( function( transition, ui, data) {
						self.currentPageNumber( Math.min( self.currentPageNumber()+self.options( 'pageRange'), self.getPageCount()));
					})
					.options({
						'ampere.ui.caption'     : self.options( 'nextpagerange.caption'),
						'ampere.ui.description' : self.options( 'nextpagerange.description'),
						'ampere.ui.icon'        : self.options( 'nextpagerange.icon')
					})
					.enabled( function() {
						var enabled = self.enabled().call( self, transition);
						return (enabled===undefined || enabled) && (self.currentPageNumber() < self.getPageCount());
					});

					cb.call( self, transition);

					return transition;
				})( this.gotoNextPageRange()));

				this.gotoLastPage((function( cb) {
					var transition = state.transition( state.name() + '.' + stateProperty + '.lastpage')
					.action( function( transition, ui, data) {
						self.currentPageNumber( self.getPageCount());
					})
					.options({
						'ampere.ui.caption'		: self.options( 'lastpage.caption'),
						'ampere.ui.description'	: self.options( 'lastpage.description'),
						'ampere.ui.icon'		: self.options( 'lastpage.icon')
					})
					.enabled( function() {
						var enabled = self.enabled().call( self, transition);
						return (enabled===undefined || enabled) && (self.currentPageNumber() < self.getPageCount());
					});

					cb.call( self, transition);

					return transition;
				})( this.gotoLastPage()));
			};
		} else {
			return new Paginator( array, options);
		}
	};

	window.ov.ampere.crud.paginator.prototype = new window.ov.ampere.Component( 'window.ov.ampere.crud.paginator');
	window.ov.ampere.crud.paginator.DEFAULTS = {
		itemCountPerPage            : 10,
		pageRange                   : 10,

		'firstpage.caption'			: 'First',
		'firstpage.description'		: 'Goto first page',
		'firstpage.icon'			: null,

		'prevpagerange.caption'		: null,
		'prevpagerange.description'	: 'Previous page range',
		'prevpagerange.icon'		: 'icon-double-angle-left',

		'prevpage.caption'			: null,
		'prevpage.description'		: 'Previous page',
		'prevpage.icon'				: 'icon-angle-left',

		'page.caption'				: null,
		'page.description'			: null,
		'page.icon'					: null,

		'nextpage.caption'			: null,
		'nextpage.description'		: 'Next page',
		'nextpage.icon'				: 'icon-angle-right',

		'nextpagerange.caption'		: null,
		'nextpagerange.description'	: 'Next page range',
		'nextpagerange.icon'		: 'icon-double-angle-right',

		'lastpage.caption'			: 'Last',
		'lastpage.description'		: 'Last page',
		'lastpage.icon'				: null
	};

	window.ov.ampere.crud.paginator.angular = function( angularModule) {
		angularModule.directive( 'ngAmpereCrudPaginator', [ '$compile', '$parse', '$window', function( $compile, $parse, $window) {
			return {
				restrict	: 'A',
				scope		: 'isolate',
				link		: function( scope, element, attrs) {
					scope.$watch( attrs.ngAmpereCrudPaginator, function( oldPaginatorController, paginatorController) {
						if( paginatorController) {
							scope.paginator = paginatorController;

							var template = paginatorController.template();

							var jTemplate = $( template);

							jTemplate.addClass( element.attr( 'class'));
							jTemplate.attr( 'style', element.attr( 'style'));

							template = jTemplate[0].outerHTML;

							var f = $compile( template);
							var replacement = f( scope);

							element.replaceWith( replacement);

							paginatorController.element = replacement;
						}
					});
				}
			};
		}]);
	};

	window.ov.ampere.defaults[ 'ampere.ui.angular'] = window.ov.ampere.defaults[ 'ampere.ui.angular'] || [];
	window.ov.ampere.defaults[ 'ampere.ui.angular'].push( window.ov.ampere.crud.paginator.angular);
})( jQuery);