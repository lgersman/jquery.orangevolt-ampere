/**
 * twitter bootstrap ampere ui
 */
;(window.ov && window.ov.ampere && window.ov.ampere.ui.twitterbootstrap) || (function( $) {
	var _ns = $.ov.namespace( 'window.ov.ampere.ui.twitterbootstrap'); 
	
		/**
		 * declare window.ov.ampere.ui.twitterbootstrap module
		 * for angular 
		 */
	(function() {
		var ampere = angular.module('window.ov.ampere.ui.twitterbootstrap', []).run( function( $rootScope, $window) {
			/*
			$rootScope.ov = {
				ampere : {
					util : $window.ov.ampere.util
				}
			};
			*/
		});
		
		var ampereTwitterbootstrapController = function( $scope, $rootElement, $window) {
			var controller = $rootElement.parent().data( 'ampere.controller');
			
			$scope.ampere = {
				module : controller.module,
				ui 	   : controller.ui,
				view   : controller.module.current().view
			};
		};
		ampereTwitterbootstrapController.$inject = ['$scope', '$rootElement', '$window'];
		ampere.controller( 'amperetwitterbootstrap', ampereTwitterbootstrapController);
		
		ampere.directive( 'ngAmpereState', [ '$compile', '$window', function( $compile, $window) {
			var _ns = $.ov.namespace('ngAmpereTransition');
			
			return {
				restrict   : 'A',
				scope      : 'isolate',
				link: function(scope, element, attrs) {
					/*
					var controller = element.parents().filter( function( obj) { return $.data( this, 'ampere.controller'); })
					.data( 'ampere.controller');
					 */

					// var oldChangeset = {};
					
					scope.$watch( 'ampere', function() {
						_ns.debug( 'ampere changed');
							
							// remove old scope variables
						/*
						debugger
						var properties = Object.keys( scope);
						for( var i in properties) {
							delete scope[ properties[i]];
						}
						*/
							// transport state variables into scope
						properties = Object.keys( scope.ampere.module.current().state);
						for( var i in properties) {
							$.ov.namespace( 'ngState')
							.assert( properties[i]!='ampere', 'state variable named "ampere" is forbidden')
							.assert( properties[i]!='this', 'state variable named "this" is forbidden')
							.assert( properties[i].charAt( 0)!='$', 'state variable starting with $ (="', properties[i], '")is forbidden');
							
							scope[ properties[i]] = scope.ampere.module.current().state[ properties[i]];
							_ns.debug( 'set initial scope.' + properties[i] + '=', $window.$.ov.json.stringify( scope[ properties[i]], $window.$.ov.json.stringify.COMPACT));
						} 
						
						
						var view = scope.ampere.module.current().view;
						var template = view.template();

						if( template==null) {
							template = $.get( scope.ampere.ui.options( 'ampere.baseurl') + '/ampere-twitterbootstrap.defaultview.fragment');
						} else if( $.isFunction( template)) {
							template = template.call( scope.ampere.module.current().view, scope.ampere.module.current().view);
						};
					 	
						$.ov.namespace( 'ngState').assert( 
							!$.isFunction( template.promise) || template.promise().state()!='success', 
							'view fragment is not ready : state=', $.isFunction( template.promise) ? template.promise().state() : ''
						);
						$.when( $.isFunction( template.promise) ? template.promise() : template).done( function( data) {
							console.log( 'data=' + data);								
							template = data.jquery ? data.text() : data.responseText || data;
							
							element.html( template);
							$compile( element.contents())( scope);
						});
					});
					
					scope.$watch( function() {
						/*
						 * get current filtered scope variables
						 */  
					var changeset = {}; 	
					var keys = Object.keys( scope);
					for( var i in keys) {
						if( keys[i]!='ampere' && keys[i]!='this' && keys[i].charAt( 0)!='$') {
							changeset[ keys[i]] = scope[ keys[i]];
						}
					}
					
						/*
						 * detect changes
						 */ 
					keys = Object.keys( changeset);
						// remove duplicate keys
					$window.jQuery.each( Object.keys( scope.ampere.module.current().state), function( index, item) {
						$.inArray( item, keys)!=-1 || keys.push( item);
					});
					
						/*
						 * filter out equal values
						 */ 
					var toDelete = [];
					var toSet = [];						
					for( var i in keys) {
						var key = keys[i];
						if( !Object.hasOwnProperty.call( changeset, key)) {
							toDelete.push( key);
						} else if( angular.equals( changeset[ key], scope.ampere.module.current().state[ key])) {
							delete changeset[ key];
						} else {
							toSet.push( key);
						}
					}

						/*
						 * if changes occured 
						 */ 
					if( toSet.length || toDelete.length) {
							// set modified properties
						for( var i in toSet) {
							scope.ampere.module.current().state[ toSet[i]] = changeset[ toSet[i]];
							_ns.debug( scope.ampere.module.current().state.fullName(), '.', toSet[i], '=', changeset[ toSet[i]]);
						}
						
							// remove deleted properties
						for( var i in toDelete) {
							delete scope.ampere.module.current().state[ toDelete[i]];
							_ns.debug( 'delete ', scope.ampere.module.current().state.fullName(), '.', toDelete[i]);
						}
						
						_ns.debug( 'broadcast ampere-model-changed ( ', changeset, ', ', toDelete, ')');
						scope.$root.$broadcast( 'ampere-model-changed', changeset, toDelete);
					}
				});
					
					//scope.$watch( 'controller.module.current().view', function() {
					/*
						var view = controller.module.current().view;
						var template = view.template();
						
						if( $.isFunction( template.promise)) {
							$.ov.namespace( 'ngState').assert( template.promise().state()!='success', 'view fragment is not ready : state=', template.promise().state());
							template.promise().done( function( data) {
								template = data.jquery ? data.text() : data;
							});
						}
						
			            element.html( template);
		                $compile(element.contents())( scope);
		                */
					//});								
				}
				/*
				compile    : function( element, attr) {
					var controller = element.parents().filter( function( obj) { return $.data( this, 'ampere.controller'); })
					.data( 'ampere.controller');
					
					return function( scope, element) {
						var childScope;
						
						//
						// function() {
						// 	return controller.module.current().state;
						// } 
						// 
						// should also be working 
						//
						scope.$watch( 'module().current().state', function(src) {
							if( childScope) {
								childScope.$destroy();
							}
				            
							var view = controller.current().view;
							var template = view.template();
							
							if( $.isFunction( template.promise)) {
								$.ov.namespace( 'ngState').assert( template.promise().state()!='success', 'view fragment is not ready : state=', template.promise().state());
								template.promise().done( function( data) {
									template = data.jquery ? data.text() : data;
								});
							}
							
							childScope = scope.$new();
							
				            element.html( template);
			                $compile(element.contents())(childScope);
			               // scope.$eval('module().current().state');
						});
					};
				}*/
			};
		}]);
		
		ampere.directive( 'ngAmpereTransition', [ '$compile', '$parse', '$window', function( $compile, $parse, $window) {
			var templates = {
				'a' 	: '<a href="javascript:void(0)"'
					+ 'class="ampere-transition {{attrs.class}}"'
   					+ 'ng-class="{disabled : !transition.isEnabled()}"'
   					+ 'style="{{attrs.style}}"'
       				+ 'title="{{attrs.title || ampere.ui.getDescription( transition)}}">'
       				+ '<i ng-class="ampere.ui.getIcon( transition)"></i>'
       				+ '{{$.trim( element.text()) || ampere.ui.getCaption( transition)}}'
       				+ '</a>',
       			'button' : '<button type="button"'
   					+ 'ng-disabled="!transition.isEnabled()"'
   					+ 'class="ampere-transition name-{{transition.name()}} btn {{attrs.class}}"'
   					+ 'style="{{attrs.style}}"'
       				+ 'title="{{attrs.title || ampere.ui.getDescription( transition)}}">'
       				+ '<i ng-class="ampere.ui.getIcon( transition)"></i>'
					+ '{{$.trim( element.text()) || ampere.ui.getCaption( transition)}}'
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
					
					var controller = element.parents().filter( function( obj) { return $.data( this, 'ampere.controller'); })
					.data( 'ampere.controller');
					
					scope.element = element;
					scope.attrs = attrs;
					scope.$ = $window.jQuery;
					
					scope.$on( 'ampere-model-changed' ,function( /*object*/changeset, /*array<string>*/deleted) {
						//_ns.debug( scope.transition.fullName(),' ampere-model-changed (', changeset, ', ', deleted, ')');
						scope.$enabled = scope.transition.isEnabled();
					});
					
					scope.$watch( attrs.ngAmpereTransition, function( oldValue, newValue) {
						//_ns.log( 'transition changed ', newValue.constructor && newValue.constructor.name=='Transition' ? newValue.name() : '"' + attrs.ngAmpereTransition + '"');
											
						var type = attrs.type || ($.inArray( element[0].tagName.toLowerCase(), Object.keys( templates))!=-1 ? element[0].tagName.toLowerCase() : 'button');
						
							// TODO : invest time to go into this issue
							// if a transition is called from within a included template
							// scope.transition is not automatically resolved
							// ... its probably a bug in angularjs 1.0.1
						/*
						if( !newValue) {
							var transition = $parse( attrs.ngAmpereTransition)( scope);
							scope.transition = transition;
						} else {
							scope.transition = newValue;
						}
						*/
						scope.transition = newValue;
						scope.$enabled = scope.transition.isEnabled();
						
						if( !scope.transition) {
							 element.replaceWith( '<span style="background-color:crimson; color:white">' + 'attribute "ng-ampere-transition" (="' + attrs.ngAmpereTransition + '") does not resolve to a ampere transition' + '</span>');
							 return;
						}
						
						_ns.assert( 
							$.type( scope.transition)=='object' && scope.transition.constructor && scope.transition.constructor.name=='Transition', 
							'attribute "ng-ampere-transition" (="', attrs.ngAmpereTransition, '") does not resolve to a ampere transition'
						);
						if( templates[ type]) {
							var f = $compile( templates[ type]);
							element = element.replaceWith( f( scope));
						} else {
							_ns.raise( 'type "', type, '" is unknown');
						}
					});
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

	    if( $('.subnav').attr('data-top') - $('.subnav').outerHeight() <= $(this).scrollTop())
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
		
		controller.proceed( transition);
		event.preventDefault();
	}
	
	function twitterbootstrap( controller, options) {
		if( !(this instanceof twitterbootstrap)) {
			return new twitterbootstrap( controller, options);
		}
		var self = this;
		
		this._super( controller, $.extend( {}, twitterbootstrap.defaults, options || {}));
		
		this.init = function() {
			(this.controller.element[0].tagName=="BODY") && $( document).on( 'scroll', onBodyscroll);
			
			this.controller.element.on( 'click', '.ampere-transition', onTransitionClicked);
			
			return this.template;
		};
		
		this.block = function() {
			this.controller.element.find( '.overlay').addClass( 'block');
		};
		
		this.unblock = function() {
			this.controller.element.find( '.overlay').removeClass( 'block');
		};

		this.destroy = function( controller) {
			(this.controller.element[0].tagName=="BODY") && $( document).off( 'scroll', onBodyscroll);
			
			this.controller.element.off( 'click', '.ampere-transition', onTransitionClicked);
		};
		
		this.template = $.get( this.options( 'ampere.baseurl') + '/ampere-twitterbootstrap.fragment');
		
		this.renderTransition = function( transition) {
			// TODO
		};
		
		this.renderState = function( state, view) {
			var scope = angular.element( controller.element.find( '>.ampere-module')).scope();
			scope.$apply( function() {
				scope.ampere = {
					module : controller.module,
					ui 	   : controller.ui,
					view   : controller.module.current().view
				};
			});
		};
		
		this.renderBootstrap = function() {
			var controller = this.controller;
			
			controller.element
			.empty()
			.append( '<div class="progress progress-striped active"><div class="bar" style="width: 0%;"></div></div>')
			.css( 'cursor', 'wait');
			
			var bar = controller.element.find( '.bar');
			bar.text( 'Bootstrapping ' + controller.module.name() + ' ...');			
			
			var deferred = $.when( this.controller.module.current().view, (this.controller.module.current().view||{}).template, this.template, controller.module)
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
					$('<a href="#">Details</a>').on( 'click', function() {
						controller.element.append( '<div class="alert">' + (self.template.isRejected() ? self.template.statusText + ' : ampere-twitterbootstrap.fragment' : $.ov.json.stringify( args, $.ov.json.stringify.COMPACT)) + '</div>');
					}) 
				);
				$( '.progress', controller.element).addClass( 'progress-danger');
			}).done( function() {
				controller.element
				.empty()
				.append( self.template.responseText);
				
				angular.bootstrap( 
					controller.element.find( '>.ampere-module')
					.addClass( 'name-' + controller.module.name()), 
					['window.ov.ampere.ui.twitterbootstrap']
				);
				
			});
			
			return deferred;
		};
	}
	twitterbootstrap.prototype = window.ov.ampere.ui();
	twitterbootstrap.defaults = {
		'ampere.ui.twitterbootstrap.theme' : 'default'
	};	
	
	window.ov.ampere.defaults['ampere.ui'] = window.ov.ampere.ui.twitterbootstrap = twitterbootstrap; 
})( jQuery);