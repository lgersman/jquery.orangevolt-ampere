/* 
 * Copyright (c) 2011 Lars Gersmann (lars.gersmann@gmail.com, http://orangevolt.blogspot.com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 */
((window.$deferRun || function( run ){ run( jQuery); }) (
	function( $, options) {
			/*
			 * history implementing undo/redo.
			 * 
			 * - create an instance 				: 
			 * 		var myCommandStack = History();
			 * 
			 * - push actions into command stack 	:
			 * 			// redo with argument adds and executes a new action inside the undo/redo manager
			 * 		myCommandStack.redo( function() {
			 *			// do something here
			 *			return function() {		// return a undo function if your action is undoable
			 *				// undo something here
			 *				// return redo function if your undo function is redoable
			 *			};
			 *		})
			 *
			 * - undo an action 					:
			 * 		myCommandStack.undo();
			 * 
			 * - redo an action						:
			 * 		myCommandStack.redo();
			 * 
			 * - ask undo / redo state		 		: 
			 * 		myCommandStack.canUndo(); myCommandStack.canRedo()
			 * 		attention : canUndo/canRedo return the count of undoable/redoable actions or 0 if nothing undoable/redoable instead of a boolean 
			 *   
			 * - reset 								:
			 * 		myCommandStack.reset()
			 * 
			 * - rollback all undo actions 			:
			 * 		myCommandStack.rewind()
			 *
			 * - playback all redo actions			:
			 * 		myCommandStack.playback()
			 */
		function History( options) {
			if( !(this instanceof History)) {
				return new History( options);
			}
			
			this.options = $.extend( {callback : $.noop}, options);
			
			/**
			 * @return 0 (==false) if no undoable action are on stack or count of undoable actions
			 */
			this.canUndo = function() {
				return this.position;
			};
			
			/**
			 * @return 0 (==false) if no redoable action are on stack or count of redoable actions
			 */
			this.canRedo = function() {
				return this.stack.length-this.position;
			};
			
			/**
			 * @param action the new action to execute and store 
			 * or undefined (i.e no argument) to redo the last undo action. 
			 * 
			 * if multiple action arguments are given, they get combined into an atomic
			 * action which returns only a undo action if all actions are undoable. 
			 * 
			 * if no redo action is available function returns gracefully
			 * 
			 * @return the undo instance
			 */
			this.redo = function( dontCallback) {
				var action = undefined;
				if( arguments.length==1) {
					action = arguments[0];
				} else if( arguments.length) {
					var args = $.makeArray( arguments);
					var history = $.history( args);
					var undo = function() {
						history.playback();
						return history.stack.length==args.length ? action : undefined;
					};					
					action = function() {
						history.rewind();
						return history.stack.length==args.length ? undo : undefined;
					};
				}		
					
				var redo = (action || (this.canRedo() ? this.stack[ this.position] : undefined));
				
				var deferred = $.Deferred(); 
				var undo = redo ? redo( deferred) : undefined;

				var history = this;
				$.when( redo ? deferred : undefined).done( function() {
					if( undo) { 
						if( action) {
							history.stack.splice( history.position); 	// cleanup recent redo actions
							history.stack.push( undo);
							history.position = history.stack.length;
						} else if( history.canRedo()){
							history.stack[ history.position++] = undo;// point to next redo action
						}
					} else if( redo) {							// cleanup recent undo actions	
						history.stack.splice( 0, history.position);
						history.position = history.stack.length; 
					}
					
					var flash = arguments.length ? { message : arguments[0] } : undefined;
					
					redo && dontCallback!==false && history.options.callback.call( history, 'redo', redo, undo, flash);					
				});
				
				return this;
			};
			
			/**
			 * execute the next undo action. 
			 * returns gracefully if no redo action is available.
			 * 
			 * @return the undo instance
			 */
			this.undo = function( dontCallback) {
				if( this.canUndo()) {
					var undo = this.stack[ --this.position];
					
					var deferred = $.Deferred(); 
					var redo = undo( deferred);
					
					var history = this;
					$.when( deferred).done( function() {
						if( redo) {
							history.stack[ history.position] = redo;	// replace undo by its returned redo action
						} else {								// cleanup recent redo actions
							history.stack.splice( history.position);
						}
						
						var flash = arguments.length ? { message : arguments[0] } : undefined;
						
						dontCallback!==false && history.options.callback.call( history, 'undo', undo, redo, flash);
					});
				}
				
				return this;
			};
			
			this.reset = function() {
				this.stack = [];
				this.position = 0;
				
				this.options.callback.call( this, 'reset');
				
				return this;
			};
			
			this.rewind	= function() {
				while( this.canUndo()) {
					this.undo( false);
				}
				this.options.callback.call( this, 'rewind');
				
				return this;
			};
			
			this.playback = function() {
				while( this.canRedo()) {
					this.redo( false);
				}
				this.options.callback.call( this, 'rewind');
				return this;
			};
		
			return this.reset();
		};
		
		$.ampere.history = History;
	}
));