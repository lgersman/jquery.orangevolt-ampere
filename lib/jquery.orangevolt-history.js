/* 
 * Copyright (c) 2011 Lars Gersmann (lars.gersmann@gmail.com, http://orangevolt.blogspot.com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 */
/**
 * orangevolt history implements an undo/redo manager.
 * 
 * - create an instance 				: 
 * 		var myCommandStack = $.orangevolt.history();
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
 * 
 * @author lars gersmann <lars.gersmann@gmail.com>
 */
;(jQuery.orangevolt && jQuery.orangevolt.history) || (function($) {
		/*
		 * optional args can be a set of predefined actions
		 * which are positioned as undo actions (like they are already redoed)
		 */
	function history() {
		if( !(this instanceof history)) {
			var instance = new $.orangevolt.history();
			
				// append (redo) arguments to stack. this is used 
				// to initialize an history instance with an predefined 
				// set of redo actions (aka combined action)
			instance.stack = instance.stack.concat(  arguments.length==1 ? arguments[0].reverse() : []);
			instance.position = instance.stack.length;
			
			return instance;
		}
		
		$.extend( this, {
			/**
			 * @return 0 (==false) if no undoable action are on stack or count of undoable actions
			 */
			canUndo : function() {
				return this.position;
			},
			/**
			 * @return 0 (==false) if no redoable action are on stack or count of redoable actions
			 */
			canRedo : function() {
				return this.stack.length-this.position;
			},
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
			redo    : function() {
				var action = undefined;
				if( arguments.length==1) {
					action = arguments[0];
				} else if( arguments.length) {
					var args = $.makeArray( arguments);
					var history = $.orangevolt.history( args);
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
				var undo = redo ? redo() : undefined;
				
				if( undo) { 
					if( action) {
						this.stack.splice( this.position); 	// cleanup recent redo actions
						this.stack.push( undo);
						this.position = this.stack.length;
					} else if( this.canRedo()){
						this.stack[ this.position++] = undo;// point to next redo action
					}
				} else if( redo) {								// cleanup recent undo actions	
					this.stack.splice( 0, this.position);
					this.position = this.stack.length; 
				}
				
				return this;
			},
			/**
			 * execute the next undo action. 
			 * returns gracefully if no redo action is available.
			 * 
			 * @return the undo instance
			 */
			undo		: function() {
				if( this.canUndo()) {
					redo = this.stack[ --this.position]();
					if( redo) {
						this.stack[ this.position] = redo;	// replace undo by its returned redo action
					} else {								// cleanup recent redo actions
						this.stack.splice( this.position);
					}
				}
				
				return this;
			},
			reset		: function() {
				this.stack = [];
				this.position = 0;
				return this;
			},
			rewind		: function() {
				while( this.canUndo()) {
					this.undo();
				}
				
				return this;
			},
			playback	: function() {
				while( this.canRedo()) {
					this.redo();
				}
				
				return this;
			}
		});

		return this.reset();
	};
	
	$.orangevolt = $.orangevolt || {};
	$.orangevolt.history = $.orangevolt.history || history;
})( jQuery);