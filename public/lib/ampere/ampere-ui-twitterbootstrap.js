/*!
 * Orangevolt Ampere Framework 
 *
 * http://github.com/lgersman
 * http://www.orangevolt.com
 *
 * Copyright 2012, Lars Gersmann <lars.gersmann@gmail.com>
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

/**
 * Twitter Bootstrap / AngularJS Renderer
 */
;(window.ov && window.ov.ampere && window.ov.ampere.ui.twitterbootstrap) || (function( $) {
	var _ns = $.ov.namespace( 'window.ov.ampere.ui.twitterbootstrap'); 
	
		/**
		 * declare window.ov.ampere.ui.twitterbootstrap module
		 * for angular 
		 */
	(function() {
		var ampere = angular.module('window.ov.ampere.ui.twitterbootstrap', [ 'ngResource', 'ngCookies']).run( function( /* $rootScope, $window, $http*/) {
			/*
			$rootScope.ov = {
				ampere : {
					util : $window.ov.ampere.util
				}
			};
			*/
		});
		//.config( ['$locationProvider'/*,'$routeProvider'*/, function( $locationProvider/*, $routeProvider*/) {
		//	$locationProvider.html5Mode( $( 'html').hasClass( 'history'));
		//	$locationProvider.hashPrefix( '!');
		//}]);
		
		ampere.filter( 'ucwords', function() {
		    return function( input, scope) {
		        return window.ov.ampere.util.ucwords( input);
		    };
		});
		ampere.filter( 'replace', function() {
		    return function( input, regexp, replace) {
		    	debugger
		    	var lastSlashIndex = regexp.lastIndexOf( '/');
		    	var re = new RegExp( regexp.substr( 1, lastSlashIndex-1), regexp.substr( lastSlashIndex+1));
		    	return input.replace( re, replace);
		    };
		});
		
		ampere.filter( 'next', function() {
		    return function( items, current) {
				var pos = $.inArray( current, items);
		        return pos<items.length-1 ? items[ pos+1] : current;
		    };
		});
		ampere.filter( 'prev', function() {
		    return function( items, current) {
				var pos = $.inArray( current, items);
		        return pos>0 ? items[ pos-1] : current;
		    };
		});
		ampere.filter( 'type', function() {
		    return function( input) {
				return $.type( input);
		    };
		});
		
		var ampereTwitterbootstrapController = function( $scope, $rootElement, $window, $http, $timeout,  $log, $resource, $cookies/*, $location*/) {
			var controller = $rootElement.parent().data( 'ampere.controller');
			/* 
			 * TODO : this is a dirty hack to transport the initial template into
			 * the ampere structure of angularjs
			 */ 
			var template = controller._initial_template;
			controller._initial_template = undefined;
			$scope.$ampere = {
				module 	: controller.module,
				ui 	   	: controller.ui,
				template: template, 
				view   	: controller.module.current().view
			};

				// copy services to root scope
			$scope.$window = $window;
			$scope.$http = $http;
			$scope.$timeout = $timeout;
			$scope.$log = $log;
			$scope.$resource = $resource;
			$scope.$cookies = $cookies;
//			$scope.$location = $location;

			/*
			$scope.$watch( 
		    	function() { 
		    		return $scope.$location.search()
		    	}, 
		    	function( oldValue, newValue) {
		    		if( !$location._ignore ) {
		    			console.warn( '$location1 changed ', oldValue, newValue, angular.equals( oldValue, newValue));
		    			if( newValue.u && $scope.$ampere.module.history().canUndo()) {
		    				$timeout( $scope.$ampere.module.history().undo);
		    			} else if( newValue.r && $scope.$ampere.module.history().canRedo()) {
		    				$timeout( $scope.$ampere.module.history().redo);
		    			}
		    		} else {
		    			delete $location._ignore;
		    		}
		    	}
		    );
			*/
		};
		ampereTwitterbootstrapController.$inject = ['$scope', '$rootElement', '$window', '$http', '$timeout',  '$log', '$resource', '$cookies'/*, '$location'*/];
		
		ampere.controller( 'amperetwitterbootstrap', ampereTwitterbootstrapController);
		
		ampere.directive( 'ngAmpereState', [ '$compile', '$window', function( $compile, $window) {
			return {
				restrict   : 'A',
				scope      : 'isolate',
				link: function( scope, element, attrs) {
					/*
					var controller = element.parents().filter( function( obj) { return $.data( this, 'ampere.controller'); })
					.data( 'ampere.controller');
					 */
					
					scope.$watch( '$ampere', function() {
							// destroy all child scopes (->transitions)
						while( scope.$$childHead) {
							scope.$$childHead.$destroy();
						}
						
						var _ns = $.ov.namespace('ngAmpereTransition(' + scope.$ampere.module.current().state.fullName() + ')');
						_ns.debug( 'ampere changed');
						
							// remove old scope variables
						var properties = Object.keys( scope);
						
						for( var i in properties) {
							if( /*properties[i]!='ampere' &&*/ properties[i]!='this' && properties[i].charAt( 0)!='$') {
								_ns.debug( 'delete previsouly defined scope.' + properties[i]);
								delete scope[ properties[i]];
							}
						}
							// transport state variables into scope
						properties = Object.keys( scope.$ampere.module.current().state);
						for( var i in properties) {
							$.ov.namespace( 'ngState')
							//.assert( properties[i]!='ampere', 'state variable named "ampere" is forbidden')
							.assert( properties[i]!='this', 'state property named "this" is forbidden')
							.assert( properties[i].charAt( 0)!='$', 'state property starting with $ (="', properties[i], '") is forbidden');
							
							if( properties[i]!='promise') {
								scope[ properties[i]] = scope.$ampere.module.current().state[ properties[i]];
								_ns.debug( 'set initial scope.' + properties[i] + '=', $window.$.ov.json.stringify( scope[ properties[i]], $window.$.ov.json.stringify.COMPACT));
							}
						} 
						
						var template = scope.$ampere.template;

						_ns.debug( 'template=' + template);
						
						element.html( template);
						$compile( element.contents())( scope);
					});
					
					scope.$watch( function() {
						var _ns = $.ov.namespace('ngAmpereTransition(' + scope.$ampere.module.current().state.fullName() + ')');
							/*
							 * get current filtered scope variables
							 */  
						var changeset = {}; 	
						var keys = Object.keys( scope);
						for( var i in keys) {
							if( /*keys[i]!='ampere' &&*/ keys[i]!='promise' && keys[i]!='this' && keys[i].charAt( 0)!='$') {
								changeset[ keys[i]] = scope[ keys[i]];
							}
						}
						
							/*
							 * detect changes
							 */ 
						keys = Object.keys( changeset);
							// remove duplicate keys
						$window.jQuery.each( Object.keys( scope.$ampere.module.current().state), function( index, item) {
							$.inArray( item, keys)!=-1 || keys.push( item);
						});
						
							/*
							 * filter out equal values
							 */ 
						var toDelete = [];
						var toSet = [];						
						for( var i in keys) {
							var key = keys[i];
							if( key!='promise') {
								if( !Object.hasOwnProperty.call( changeset, key)) {
									toDelete.push( key);
								} else if( angular.equals( changeset[ key], scope.$ampere.module.current().state[ key])) {
									delete changeset[ key];
								} else {
									toSet.push( key);
								}
							}
						}
	
							/*
							 * if changes occured 
							 */ 
						if( toSet.length || toDelete.length) {
								// set modified properties
							for( var i in toSet) {
								scope.$ampere.module.current().state[ toSet[i]] = changeset[ toSet[i]];
								_ns.debug( scope.$ampere.module.current().state.fullName(), '.', toSet[i], '=', changeset[ toSet[i]]);
							}
							
								// remove deleted properties
							for( var i in toDelete) {
								delete scope.$ampere.module.current().state[ toDelete[i]];
								_ns.debug( 'delete ', scope.$ampere.module.current().state.fullName(), '.', toDelete[i]);
							}
							
							_ns.debug( 'broadcast ampere-model-changed ( ', changeset, ', ', toDelete, ')');
							scope.$root.$broadcast( 'ampere-model-changed', changeset, toDelete);
						}
					});
				}
			};
		}]);
		
		ampere.directive( 'ngAmpereTransition', [ '$compile', '$parse', '$window', function( $compile, $parse, $window) {
			var templates = {
				'a' 	: '<a href="javascript:void(0)"'
					+ ' class="ampere-transition name-{{transition.name()}} {{attrs.class}}"'
   					+ ' ng-class="{disabled : !transition.enabled(), \'ampere-hotkey\' : hotkey}"'
   					+ ' accesskey="{{attrs.accesskey}}"'
   					+ ' id="{{attrs.id}}"'
   					+ ' style="{{attrs.style}}"'
   					+ ' data-ampere-hotkey="{{attrs.ngAmpereHotkey}}"'
       				+ ' title="{{attrs.title || $ampere.ui.getDescription( transition)}}{{hotkey && \' \' + hotkey}}">'
       				+ '<i ng-class="$ampere.ui.getIcon( transition)"></i>'
       				+ '{{$.trim( element.text()) || $ampere.ui.getCaption( transition)}}'
       				+ '</a>',
       			'button' : '<button type="button"'
   					+ ' ng-disabled="!transition.enabled()"'
   					+ ' class="ampere-transition name-{{transition.name()}} btn {{attrs.class}}"'
   					+ ' ng-class="{\'ampere-hotkey\' : hotkey}"'
   					+ ' ng-disabled="!transition.enabled()"'
   					+ ' id="{{attrs.id}}"'
   					+ ' accesskey="{{attrs.accesskey}}"'
   					+ ' style="{{attrs.style}}"'
   					+ ' data-ampere-hotkey="{{attrs.ngAmpereHotkey}}"'
       				+ ' title="{{attrs.title || $ampere.ui.getDescription( transition)}}{{hotkey && \' \' + hotkey}}">'
       				+ '<i ng-class="$ampere.ui.getIcon( transition)"></i>'
					+ '{{$.trim( element.text()) || $ampere.ui.getCaption( transition)}}'
					+ '</button>',
				'file' : '<button type="button"'
					+ ' onclick="$( this).next().click()"'
					+ ' ng-disabled="!transition.enabled()"'
					+ ' class="ampere-transition name-{{transition.name()}} btn ampere-transition-companion {{attrs.class}}"'
					+ ' ng-class="{\'ampere-hotkey\' : hotkey}"'
					+ ' ng-disabled="!transition.enabled()"'
					+ ' accesskey="{{attrs.accesskey}}"'
					+ ' style="{{attrs.style}}"'
					+ ' data-ampere-hotkey="{{attrs.ngAmpereHotkey}}"'
	   				+ ' title="{{attrs.title || $ampere.ui.getDescription( transition)}}{{hotkey && \' \' + hotkey}}">'
	   				+ '<i ng-class="$ampere.ui.getIcon( transition)"></i>'
					+ '{{$.trim( element.text()) || $ampere.ui.getCaption( transition)}}'
					+ '</button>'
					+ '<input' 
					+ ' id="{{attrs.id || attrs.name}}"'
					+ ' name="{{attrs.name || attrs.id}}"'
					+ ' class="ampere-transition-companion"'
					+ ' type="file"' 
					+ ' ng-ampere-change="transition"'
					+ '>',
				'submit' : '<button type="submit"'
   					+ ' ng-disabled="!transition.enabled()"'
   					+ ' class="ampere-transition name-{{transition.name()}} btn {{attrs.class}}"'
   					+ ' ng-class="{\'ampere-hotkey\' : hotkey}"'
   					+ ' ng-disabled="!transition.enabled()"'
   					+ ' id="{{attrs.id}}"'
   					+ ' accesskey="{{attrs.accesskey}}"'
   					+ ' style="{{attrs.style}}"'
   					+ ' data:ampere-hotkey="{{attrs.ngAmpereHotkey}}"'
       				+ ' title="{{attrs.title || $ampere.ui.getDescription( transition)}}{{hotkey && \' \' + hotkey}}">'
       				+ '<i ng-class="$ampere.ui.getIcon( transition)"></i>'
					+ '{{$.trim( element.text()) || $ampere.ui.getCaption( transition)}}'
					+ '</button>',
				'reset' : '<button type="reset"'
   					+ ' ng-disabled="!transition.enabled()"'
   					+ ' class="ampere-transition name-{{transition.name()}} btn {{attrs.class}}"'
   					+ ' ng-class="{\'ampere-hotkey\' : hotkey}"'
   					+ ' ng-disabled="!transition.enabled()"'
   					+ ' accesskey="{{attrs.accesskey}}"'
   					+ ' style="{{attrs.style}}"'
   					+ ' data-ampere-hotkey="{{attrs.ngAmpereHotkey}}"'
       				+ ' title="{{attrs.title || $ampere.ui.getDescription( transition)}}{{hotkey && \' \' + hotkey}}">'
       				+ '<i ng-class="$ampere.ui.getIcon( transition)"></i>'
					+ '{{$.trim( element.text()) || $ampere.ui.getCaption( transition)}}'
					+ '</button>'
			};
			/*
			 * does not work yet
				// compile templates
			var names = Object.keys( templates);
			for( var i in names) {
				templates[names[i]] = $compile( templates[ names[i]]);
			}
			*/
			
			var _ns = $.ov.namespace('ngAmpereTransition');
			
			return {
				restrict   : 'A',
				scope 	   : 'isolate',
				link: function(scope, element, attrs) {
					/*
					var controller = element.parents().filter( function( obj) { return $.data( this, 'ampere.controller'); })
					.data( 'ampere.controller');
					*/
					scope.element = element;
					scope.attrs = attrs;
					scope.$ = $window.jQuery;
					
					scope.$on( 'ampere-model-changed' ,function( /*object*/changeset, /*array<string>*/deleted) {
						// _ns.debug( scope.transition.fullName(),' ampere-model-changed (', changeset, ', ', deleted, ')');
						if( scope.transition){
							scope.$enabled = scope.transition.enabled();
						} 
					});
					
					scope.$watch( attrs.ngAmpereTransition, function( oldValue, newValue) {
						if( !newValue) {
							 element.replaceWith( '<span style="background-color:crimson; color:white">' + 'attribute "ng-ampere-transition" (="' + attrs.ngAmpereTransition + '") does not resolve to a ampere transition' + '</span>');
							 return;
						}
						
						_ns = $.ov.namespace('ngAmpereTransition(' + newValue.fullName() + ')');
						
						var type = attrs.type || ($.inArray( element[0].tagName.toLowerCase(), Object.keys( templates))!=-1 ? element[0].tagName.toLowerCase() : 'button');
						
						scope.transition = newValue;
						
						scope.$enabled = scope.transition.enabled();
						
						_ns.assert( 
							$.type( scope.transition)=='object' && scope.transition.constructor && scope.transition.constructor.name=='Transition', 
							'attribute "ng-ampere-transition" (="', attrs.ngAmpereTransition, '") does not resolve to a ampere transition'
						);
						
						if( templates[ type]) {
							var f = $compile( templates[ type]);
							var replacement = f( scope);
							
							element.replaceWith( replacement);
							
							var hotkey = attrs.ngAmpereHotkey || scope.$ampere.ui.getHotkey( scope.transition);
								
							if( hotkey) {
								scope.hotkey = ' (' + window.ov.ampere.util.ucwords( hotkey) + ')';
							}
							replacement.data( 'ampereTransition', newValue);
						} else {
							_ns.raise( 'type "', type, '" is unknown');
						}
					});
				}
			};
		}]);
		
		function eventDirective( eventName) {
			var directive = 'ngAmpere' + window.ov.ampere.util.ucwords( eventName); 
				
			ampere.directive( directive, [ function() {
				var _ns = $.ov.namespace( directive);
				
				return {
					restrict   : 'A',
					link: function( scope, element, attrs) {
						// doesnt work with input event :-)
						//var event = Modernizr.hasEvent( 'input', element[0]) ? 'input' : 'change';

						$( element).on( eventName, function( event) {
							var transition = scope.$eval( attrs[ directive]);

							if( transition) {
								var ui = scope.$ampere.ui;
								var controller = ui.controller;

								!ui.isBlocked() && controller.proceed( transition, event);
							} else {
								_ns._ns.error( 'attribute "ng-ampere-' + eventName + '" (=' +  attrs[ directive] + ') doesnt resolve to an ampere transition');
							}
							event.preventDefault();
							event.stopPropagation();
							event.stopImmediatePropagation();
						});
					}
				};
			}]);
		}
		eventDirective( 'change');
		eventDirective( 'click');
		eventDirective( 'dblclick');
		
		ampere.directive( 'ngAmpereDrop', [ function() {
			var _ns = $.ov.namespace( 'ngAmpereDrop');
			
			return {
				restrict   : 'A',
				link: function( scope, element, attrs) {
					$( element).on( 'drop', function( event) {
						var transition = scope.$eval( attrs.ngAmpereDrop);

						if( transition) {
							var ui = scope.$ampere.ui;
							var controller = ui.controller;

							!ui.isBlocked() && controller.proceed( transition, [ event]);
						} else {
							_ns.error( 'attribute "ngAmpereDrop" (=' +  attrs.ngAmpereDrop + ') doesnt resolve to an ampere transition');
						}
						event.preventDefault();
						event.stopPropagation();
						event.stopImmediatePropagation();
						
						return false;
					})
					// ff : this is needed for ff to prevent loading file into browser
					.on( 'dragover', function( event) {
						event.preventDefault();
					})
				}
			};
		}]);
		
		ampere.directive( 'ngAmpereHotkey', [ function() {
			var _ns = $.ov.namespace( 'ngAmpereHotkey');
			
			return {
				restrict   : 'A',
				link: function( scope, element, attrs) {
					
						/*
						 * it the ng-ampere-hotkey attribute is not
						 * used in combination with ng-ampere-transition
						 */ 
					if( !attrs.ngAmpereTransition) {
						var hotkeys = scope.$eval( attrs.ngAmpereHotkey);
						_ns.assert( $.isPlainObject( hotkeys), 'attribute "ng-ampere-hotkey"(="' + attrs.ngAmpereHotkey + '") expected to evaluate to an object');
						
						element.data( 'ampereHotkey', hotkeys);
					}
				}
			};
		}]);
		
	})();
	
		/**
		 * twitter bootstrap scroll functionality
		 * 
		 *  http://stackoverflow.com/questions/9179708/replicating-bootstraps-main-nav-and-subnav
		 */
	function onBodyscroll() {
	    // If has not activated (has no attribute "data-top"
	    if( !$('.subnav').attr('data-top')) {
	        // If already fixed, then do nothing
	        if ($('.subnav').hasClass('subnav-fixed')) return;
	        // Remember top position
	        var offset = $('.subnav').offset();
	        $('.subnav').attr('data-top', offset.top);
	    }

	    if( $(this).scrollTop() && $('.subnav').attr('data-top') - $('.subnav').outerHeight() <= $(this).scrollTop())
	        $('.subnav').addClass('subnav-fixed');
	    else
	        $('.subnav').removeClass('subnav-fixed');
	};
	
		/**
		 * a transition was clicked
		 */
	function onTransitionClicked( event) {
		var transition = angular.element( this).scope().transition;
		var controller = $( this).closest( '.ampere-app').ampere();

		!controller.ui.isBlocked() && controller.proceed( transition);
	
		event.preventDefault();
			// prevent any other hotkey handler to be invoked
		event.stopPropagation();
		event.stopImmediatePropagation();
	}

	/**
	 * focuses first form element in computed template 
	 */
	function focus( /*jquery*/root) {
		//var formControls = root.find( '.ampere-state .ampere-view :input:not(input[type=button],input[type=submit],button),select,textarea').filter( '[tabIndex!="-1"]:visible');
		var formControls = root.find( '.ampere-state .ampere-view input,select,textarea,button').filter( '[tabIndex!="-1"]:visible:enabled');
		if( !formControls.filter( '*[autofocus]').focus().length) {
			formControls.first().focus();
		}
	}
	
	function onActionAbort() {
		$.ov.namespace('twitterboostrap::onActionAbort()').debug( 'action aborted');
		
		var controller = $( this).closest( '.ampere-app').ampere();
		
		if( confirm( 'Really abort transition ?')) {
			var flash = controller.element.find( '.flash');
			
			var deferred = flash.data( 'ampere.action-deferred');
			_ns.assert( deferred && $.isFunction( deferred.promise), 'no action deferred registered on flash element');

			flash.hide();
			
				// trigger handler
			deferred.reject( controller);
		}
	}
	
		/*
		* allow anchors with attribute "draggable" 
		* to be draggable to the desktop
		*/
	function onDraggableAnchor( event) {
		//console.warn( "DownloadUrl=", $( this).data( 'downloadurl') || "application/octet-stream:" + basename( this.href) + ':'+ this.href);
		
		var dragImage = $( this).find( '[class^="icon-"]:first');
		dragImage.length && event.originalEvent.dataTransfer.setDragImage( dragImage[0], -10, -10);
		
		event.originalEvent.dataTransfer.setData( 
			'DownloadURL',
			$( this).data( 'downloadurl') || "application/octet-stream:" + basename( this.href) + ':'+ this.href						
		);
	}
	
	function twitterbootstrap( controller, options) {
		if( !(this instanceof twitterbootstrap)) {
			return new twitterbootstrap( controller, options);
		}
		var self = this;
		
		this._super( controller, angular.extend( {}, twitterbootstrap.defaults, options || {}));
		
		layout = 'default';
		if( Object.hasOwnProperty.call( this.options(), 'ampere.ui.layout')) {
			var layout = this.options( 'ampere.ui.layout');
				// set "nolayout" template when layout option was false
			layout || (layout='nolayout'); 
		}
		
		if( $.inArray( layout, [ 'default', 'nolayout', 'wizard'])!=-1) {
			controller.element.addClass( 'layout-name-' + layout)
			layout = this.options( 'ampere.baseurl') + 'ampere/ampere-ui-twitterbootstrap.layout.' + layout + '.tmpl';
		}
		this.template = $.get( layout);
			
		
		/*
		 * automagically add 'ampere.ui.type':'global' for module transactions 
		 */
		for( var name in controller.module.transitions) {
			var transition = controller.module.transitions[ name];
			// doesnt work if value is undefined : 
			//if( !Object.hasOwnProperty( transition.options(), 'ampere.ui.type')) {
			if( !('ampere.ui.type' in transition.options())) {
				transition.options( 'ampere.ui.type','global');
			}
		}
		
		var _init = this.init;
		this.init = function() {
			_init.call( this);
			
			(this.controller.element[0].tagName=="BODY") && $( window).on( 'resize', onBodyscroll);
			(this.controller.element[0].tagName=="BODY") && $( document).on( 'scroll', onBodyscroll);
			
				// react on click only on standalone ampere transition representants
				// but not companions (like the representant of input[file] wit ng-ampere-transition) 
			this.controller.element.on( 'click', '.ampere-transition:not( .ampere-transition-companion)', onTransitionClicked);
				
			this.controller.element.on( 'click', '.flash .alert button.close', onActionAbort); 
			
				// allow anchors with attribute "draggable" to be draggable to the desktop
			$( this.controller.element).on( 'dragstart', 'a[draggable]', onDraggableAnchor); 
			
			focus( controller.element);
		};

		var _destroy = this.destroy;
		this.destroy = function() {
			_destroy.call( this);
			(this.controller.element[0].tagName=="BODY") && $( window).off( 'resize', onBodyscroll);
			(this.controller.element[0].tagName=="BODY") && $( document).off( 'scroll', onBodyscroll);
			
			this.controller.element.off( 'click', '.ampere-transition', onTransitionClicked);
			this.controller.element.off( 'click', '.flash .alert button.close', onActionAbort);
			
			$( this.controller.element).off( 'dragstart', 'a[draggable]', onDraggableAnchor);
		};		
		
		this.isBlocked = function() {
			return this.controller.element.find( '.overlay').hasClass( 'block');
		};
		
		this.block = function() {
			this.controller.element.addClass( 'overlay').find( '.overlay').addClass( 'block');
		};
		
		this.unblock = function() {
			this.controller.element.removeClass( 'overlay').find( '.overlay').removeClass( 'block');
		};
		
		this.getTemplate = function( view) {
			var template = view.template();

			if( !template) {
				if( this.options( 'ampere.ui.view')) {
					var view = this.options( 'ampere.ui.view');
					template = $.get( view);
				} else {
					template = $.get( this.options( 'ampere.baseurl') + 'ampere/ampere-ui-twitterbootstrap.view.default.tmpl');
				}
			} else if( $.isFunction( template)) {
				template = template.call( scope.$ampere.module.current().view, scope.$ampere.module.current().view);
			};
		 	
			$.ov.namespace( 'ngState').assert( 
				!$.isFunction( template.promise) || template.promise().state()!='success', 
				'view fragment is not ready : state=', $.isFunction( template.promise) ? template.promise().state() : ''
			);
			
			return $.when( $.isFunction( template.promise) ? template.promise() : template);
		};
				
		this.renderAction = function( promise) {
			var flash = this.controller.element.find( '.flash');
				// reset flash style to default  
			flash.find( '.alert').removeClass( 'alert-error').addClass( 'alert-info');
			flash.find('.progress').show()
			.find( '.bar').css( 'width', '100%');

			flash.find( '.message').text( 'Transition in progress ...');
			flash.data( 'ampere.action-deferred', promise);
			
				// add abort button if the provided promise
				// is a deferred
			flash.find( 'button.close')[ $.isFunction( promise.reject) ? 'show' : 'hide']();
			flash.show();
			
			promise
			.progress( function( message, /* example '12%'*/ progressInPercent) {
				if( arguments.length) {
					message && flash.find( '.message').text( message);
				}
				if( arguments.length==2) {
					flash.find( '.bar').css( 'width', progressInPercent);
				}
			})
			.then( function() {
				flash.hide();
				// dont forget to remove the temporay data after 
				// finishing 
				flash.removeData( 'ampere.action-deferred');
			});
		};
		
		this.renderError = function( message, onRetry) {
			var flash = this.controller.element.find( '.flash');
				// reset flash style to default  
			flash.find( '.alert').removeClass( 'alert-info').addClass( 'alert-error');
			flash.find('.progress').hide();
			
			flash.find( '.message').text( 'Error occured : ' + message);
			if( onRetry) {
				var retry = $('<button class="btn retry"><i class="icon-refresh"></i>Retry</button>');
				retry.click( function() {
					flash.hide();
					onRetry();
				});
				flash.find( '.message').append( retry);
			}
			flash.find( 'button.close').hide();
			flash.show();
		};
		
		this.renderState = function( view, template, transitionResult) {
				// remember scroll position
			var scrollX = window.scrollX;
			var scrollY = window.scrollY;
			
			var scope = angular.element( controller.element.find( '>.ampere-module')).scope();
			
			scope.$apply( function() {
					/*
					 * if no view was given - just rerender the current view
					 * this case happens for history.reset
					 */ 
				if( view) {
					scope.$ampere = {
						module   : controller.module,
						ui 	     : controller.ui,
						view     : view,	
							/*
							 * module.current.reset is calling this
							 * function without providing a template
							 * so we take the already used one as fallback  
							 */  
						template : template || scope.$ampere.template 
					};
				} 
			});
			
				// compute optional flash message 
			$.when( transitionResult).done( function() {
				focus( controller.element);
				
				window.scrollTo( scrollX, scrollY);
				//window.scrollTo( 0, 0);
				//onBodyscroll();
				
				if( arguments.length==1 && typeof( arguments[0])=='string') {
					var flash = controller.element.find( '.flash');
					
						// reset flash style to default  
					flash.find( '.alert').removeClass( 'alert-info');
					flash.find( '.progress').hide();
					
					flash.find( '.message').text( arguments[0]);
					flash.find( 'button.close').hide();
					flash.show();
					
					flash.fadeOut( 1000);
				} 
			});
		};
		
			// see Ampere.Ui
		this.popup = function( url, /* function */ initializer) {
			var popup = $( '<div class="container popup"><iframe width="100%" height="100%" border="no" src="' + url + '"></iframe></div>');
			this.controller.element.addClass( 'popup').find( '.ampere-module').append( popup);

			popup.find( 'iframe').focus();
			
			var deferred = $.Deferred();
			initializer.call( deferred, deferred);		

			var self = this;
			
				// remove popup when deferred is done/rejected 
			deferred.always( function() {
				self.controller.element.removeClass( 'popup');
				popup.remove();
			}); 
			
			return deferred;
		};
		
		this.toggleHelp = function() {
			controller.element.find( '.page-header >.ampere-help').toggle( 'slow');
		};
		
		this.renderBootstrap = function() {
			var controller = this.controller;
			
			var eProgress = $('<div class="progress progress-striped active"><div class="bar" style="width: 100%;"></div></div>'); 
			
			controller.element
			.append( eProgress)
			.css( 'cursor', 'wait');
			
			var bar = controller.element.find( '.bar');
			bar.text( 'Bootstrapping ' + controller.module.name() + ' ...');			
			
			var deferred = $.Deferred();
			
			$.when( controller.module.current().view, controller.module.current().view.template, this.template, controller.module)
			.progress( function() {
				_ns.debug( 'progress', this, arguments);
			})
			.always( function() {
				bar.css( 'width', '100%');
				controller.element.css( 'cursor', '');
			})
			.fail( function( arg) {
				bar
				.text( 'Bootstrapping ' + controller.module.name() + ' failed ! ')
				.append( 
					$('<a href="#">Details</a>').one( 'click', function() {
						controller.element.append( '<div class="alert">' + (self.template.isRejected() ? self.template.statusText + ' : ' + layout : $.ov.json.stringify( args, $.ov.json.stringify.COMPACT)) + '</div>');
					}) 
				);
				$( '.progress', controller.element).addClass( 'progress-danger');
			}).done( function() {
				eProgress.remove();
				
				controller.element
				.append( self.template.responseText);
				
				var template = self.getTemplate( controller.module.current().view); 
				template.done( function( data) {
					if( data instanceof Element) {
						data = $( data);
					}
					template = data.jquery ? data.text() : template.responseText || data;
						/* 
						 * TODO : this is a dirty hack to transport the initial template into
						 * the ampere structure of angularjs
						 */ 
					controller._initial_template = template;
					
					angular.bootstrap( 
						controller.element.find( '>.ampere-module')
						.addClass( 'name-' + controller.module.name()), 
						['window.ov.ampere.ui.twitterbootstrap']
					);
					
					self.init();
					deferred.resolve();
				});
			});
			
			return deferred;
		};
	}
	twitterbootstrap.prototype = window.ov.ampere.ui();
	twitterbootstrap.defaults = {
		'ampere.ui.twitterbootstrap.theme' : 'default'
	};	
	
	window.ov.ampere.defaults['ampere.ui'] = window.ov.ampere.ui.twitterbootstrap = twitterbootstrap;

		// add css class "iframe" to root node if loaded in iframe
		// this css flag can be used to provide different css rules for iframed ampere app modules 
	window.top!==window.self && $('html').addClass( 'iframe');
})( jQuery);