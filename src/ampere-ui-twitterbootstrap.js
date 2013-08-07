/*
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
		 * declare the angular module
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

		ampere.filter( 'ucwords', function() {
			return function( input, scope) {
				return window.ov.ampere.util.ucwords( input);
			};
		});
		ampere.filter( 'strip_tags', function() {
			return function( input, scope) {
				return typeof( input)=='string' && window.ov.ampere.util.strip_tags( input) || input;
			};
		});
		ampere.filter( 'replace', function() {
			return function( input, regexp, replace) {
				var lastSlashIndex = regexp.lastIndexOf("/");

				var re = new RegExp( regexp.substr( 1, lastSlashIndex-1), regexp.substr( lastSlashIndex+1));
				return input.replace( re, replace);
			};
		});

		ampere.filter( 'next', function() {
			return function( items, current) {
				//var pos = $.inArray( current, items);
				//return pos<items.length-1 ? items[ pos+1] : current;
				return window.ov.entity.next( items, current) || current;
			};
		});
		ampere.filter( 'prev', function() {
			return function( items, current) {
				//var pos = $.inArray( current, items);
				//return pos>0 ? items[ pos-1] : current;
				return window.ov.entity.prev( items, current) || current;
			};
		});
		ampere.filter( 'indexof', function() {
			return function( items, current) {
				return $.inArray( current, items);
			};
		});
		ampere.filter( 'type', function() {
			return function( input) {
				return window.ov.ampere.type( input);
			};
		});
		ampere.filter( 'first', function() {
			return function( array) {
				return window.ov.entity.first( array);
			};
		});
		ampere.filter( 'last', function() {
			return function( array) {
				return window.ov.entity.last( array);
			};
		});
		ampere.filter( 'match', function() {
			return function( items, value, property) {
				property = property!==undefined || 'id';
				if( !$.isArray( value)) {
					value = [ value];
				}

				return $.grep( items, function( item) {
					for( var i in value) {
						if( (value[i] instanceof RegExp) ? value[i].test( item[property]) : item[property]==value[i]) {
							return true;
						}
					}
				});
			};
		});
		ampere.filter( 'find', function() {
			return function( items, value, property) {
				property = property!==undefined && property || 'id';
				if( !$.isArray( value)) {
					value = [ value];
				}

				var hit;
				for( var i in value) {
					if( hit = window.ov.entity.find( items, value[i], property)) {
						return hit;
					}
				}
			};
		});
		ampere.filter( 'sort', function() {
			return function( items, property) {
				return window.ov.entity.sort( items, property);
			};
		});
		ampere.filter( 'keys', function() {
			return function( items, property) {
				return Object.keys( items);
			};
		});

			/**
			 * decorate $exception handler
			 * 
			 * see http://stackoverflow.com/questions/13595469/how-to-override-exceptionhandler-implementation	
			 */ 
		/*
		ampere.config( function( $provide) {
			$provide.decorator("$exceptionHandler", function($delegate) {
				return function(exception, cause) {
					$delegate( exception, cause);
					// do your own stuff here
				};
			});
		});
		*/

		var ampereTwitterbootstrapController = function( $scope, $rootElement, $window, $http, $timeout,  $log, $resource, $cookies/*, $location*/) {
			var controller = $rootElement.parent().data( 'ampere.controller');
				/*
				 * TODO : this is a dirty hack to transport the initial template into
				 * the ampere structure of angularjs
				 */
			var template = controller._initial_template;
			controller._initial_template = undefined;
			$scope.$ampere = {
				module	: controller.module,
				ui		: controller.ui,
				template: template,
				view	: controller.module.current().view
			};

				// copy services to root scope
			$scope.$window = $window;
			$scope.$http = $http;
			$scope.$timeout = $timeout;
			$scope.$log = $log;
			$scope.$resource = $resource;
			$scope.$cookies = $cookies;
			$scope.$ = $;
//			$scope.$location = $location;

				/*
				 * prepare general purpose ampere structures
				 */
				// ampere.disposable is a array of functions executed everytime
				// the view changes
			$rootElement.data( 'ampere.disposable', []);
		};
		ampereTwitterbootstrapController.$inject = ['$scope', '$rootElement', '$window', '$http', '$timeout',  '$log', '$resource', '$cookies'/*, '$location'*/];

		ampere.controller( 'amperetwitterbootstrap', ampereTwitterbootstrapController);

		ampere.directive( 'ngAmpereState', [ '$compile', '$window', function( $compile, $window) {
			return {
				restrict	: 'A',
				scope		: 'isolate',
				link		: function( scope, element, attrs) {
					scope.$watch( '$ampere', function() {
						scope.$ampere.scope = scope;

							// execute & cleanup all disposable handlers
						var disposables = element.closest( '.ampere-module').data( 'ampere.disposable');
						while( disposables.length) {
							disposables.pop()();
						}

							// destroy all child scopes (->transitions)
						while( scope.$$childHead) {
							scope.$$childHead.$destroy();
						}

						var _ns = $.ov.namespace('ngAmpereTransition(' + scope.$ampere.module.current().state.fullName() + ')');
						_ns.debug( 'ampere changed');

							// remove old scope variables
						var i, properties = Object.keys( scope);

						for( i in properties) {
							if( /*properties[i]!='ampere' &&*/ properties[i]!='this' && properties[i].charAt( 0)!='$') {
								_ns.debug( 'delete previously defined scope.' + properties[i]);
								delete scope[ properties[i]];
							}
						}
							// transport state variables into scope
						properties = Object.keys( scope.$ampere.module.current().state);
						for( i in properties) {
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
						element.html( template);
						$compile( element.contents())( scope);
					});

					scope.$watch( function() {
						var _ns = $.ov.namespace('ngAmpereTransition(' + scope.$ampere.module.current().state.fullName() + ')');
							/*
							 * get current filtered scope variables
							 */
						var i, changeset = {}, keys = Object.keys( scope);
						for( i in keys) {
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
						for( i in keys) {
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
							for( i in toSet) {
								scope.$ampere.module.current().state[ toSet[i]] = changeset[ toSet[i]];
								_ns.debug( scope.$ampere.module.current().state.fullName(), '.', toSet[i], '=', changeset[ toSet[i]]);
							}

								// remove deleted properties
							for( i in toDelete) {
								delete scope.$ampere.module.current().state[ toDelete[i]];
								_ns.debug( 'delete ', scope.$ampere.module.current().state.fullName(), '.', toDelete[i]);
							}

							_ns.debug( 'broadcast ampere-model-changed ( ', changeset, ', ', toDelete, ')');
							scope.$root.$broadcast( 'ampere-model-changed', changeset, toDelete);
						}

						scope.$ampere.module.trigger( "ampere.angular-scope-changed", [ scope]);
					});
				}
			};
		}]);

		ampere.directive( 'ngAmpereTransition', [ '$compile', '$parse', '$window', function( $compile, $parse, $window) {
			var templates = {
				'a'     : '<a href="javascript:void(0)"\
 class="ampere-transition name-{{transition.name()}} {{attrs.class}} {{$css()}}"\
 ng-class="{disabled : !transition.enabled(), active : transition.active(), \'ampere-hotkey\' : hotkey}"\
 accesskey="{{attrs.accesskey}}"\
 id="{{attrs.id}}"\
 tabindex="{{attrs.tabindex}}"\
 style="{{attrs.style}}"\
 data-ampere-hotkey="{{attrs.ngAmpereHotkey}}"\
 title="{{attrs.title || $ampere.ui.getDescription( transition) | strip_tags}}{{hotkey && \' \' + hotkey}}">\
<i ng-class="attrs.ngAmpereIcon || $ampere.ui.getIcon( transition)"></i>\
{{(attrs.ngAmpereIcon || $ampere.ui.getIcon( transition)) && ($.trim( element.text()) || $ampere.ui.getCaption( transition)) && \'&nbsp;\' || \'\'}}\
{{$.trim( element.text()) || $ampere.ui.getCaption( transition)}}\
</a>',
				'button' : '<button type="button"\
 ng-disabled="!transition.enabled()"\
 class="ampere-transition name-{{transition.name()}} btn {{attrs.class}} {{$css()}}"\
 ng-class="{disabled : !transition.enabled(), active : transition.active(), \'ampere-hotkey\' : hotkey}"\
 ng-disabled="!transition.enabled()"\
 id="{{attrs.id}}"\
 tabindex="{{attrs.tabindex}}"\
 accesskey="{{attrs.accesskey}}"\
 style="{{attrs.style}}"\
 data-ampere-hotkey="{{attrs.ngAmpereHotkey}}"\
 title="{{attrs.title || $ampere.ui.getDescription( transition) | strip_tags}}{{hotkey && \' \' + hotkey}}">\
<i ng-class="attrs.ngAmpereIcon || $ampere.ui.getIcon( transition)"></i>\
{{(attrs.ngAmpereIcon || $ampere.ui.getIcon( transition)) && ($.trim( element.text()) || $ampere.ui.getCaption( transition)) && \'&nbsp;\' || \'\'}}\
{{$.trim( element.text()) || $ampere.ui.getCaption( transition)}}\
</button>',
				'file' : '<button type="button"\
 onclick="$( this).next().click()"\
 ng-disabled="!transition.enabled()"\
 class="ampere-transition name-{{transition.name()}} btn ampere-transition-companion {{attrs.class}} {{$css()}}"\
 ng-class="{disabled : !transition.enabled(), active : transition.active(), \'ampere-hotkey\' : hotkey}"\
 ng-disabled="!transition.enabled()"\
 accesskey="{{attrs.accesskey}}"\
 tabindex="{{attrs.tabindex}}"\
 style="{{attrs.style}}"\
 data-ampere-hotkey="{{attrs.ngAmpereHotkey}}"\
 title="{{attrs.title || $ampere.ui.getDescription( transition) | strip_tags}}{{hotkey && \' \' + hotkey}}">\
<i ng-class="attrs.ngAmpereIcon || $ampere.ui.getIcon( transition)"></i>\
{{(attrs.ngAmpereIcon || $ampere.ui.getIcon( transition)) && ($.trim( element.text()) || $ampere.ui.getCaption( transition)) && \'&nbsp;\' || \'\'}}\
{{$.trim( element.text()) || $ampere.ui.getCaption( transition)}}\
</button>\
<input\
 id="{{attrs.id}}"\
 name="{{attrs.name}}"\
 class="ampere-transition-companion"\
 ng-class="{disabled : !transition.enabled()}"\
 type="file"\
 ng-ampere-change="transition"\
>',
				'submit' : '<button type="submit"\
 ng-disabled="!transition.enabled()"\
 class="ampere-transition name-{{transition.name()}} btn {{attrs.class}}  {{$css()}}"\
 ng-class="{disabled : !transition.enabled(), active : transition.active(), \'ampere-hotkey\' : hotkey}"\
 ng-disabled="!transition.enabled()"\
 id="{{attrs.id}}"\
 accesskey="{{attrs.accesskey}}"\
 tabindex="{{attrs.tabindex}}"\
 style="{{attrs.style}}"\
 data:ampere-hotkey="{{attrs.ngAmpereHotkey}}"\
 title="{{attrs.title || $ampere.ui.getDescription( transition) | strip_tags}}{{hotkey && \' \' + hotkey}}">\
<i ng-class="attrs.ngAmpereIcon || $ampere.ui.getIcon( transition)"></i>\
{{(attrs.ngAmpereIcon || $ampere.ui.getIcon( transition)) && ($.trim( element.text()) || $ampere.ui.getCaption( transition)) && \'&nbsp;\' || \'\'}}\
{{$.trim( element.text()) || $ampere.ui.getCaption( transition)}}\
</button>',
				'reset' : '<button type="reset"\
 ng-disabled="!transition.enabled()"\
 class="ampere-transition name-{{transition.name()}} btn {{attrs.class}}  {{$css()}}"\
 ng-class="{disabled : !transition.enabled(), active : transition.active(), \'ampere-hotkey\' : hotkey}"\
 ng-disabled="!transition.enabled()"\
 accesskey="{{attrs.accesskey}}"\
 tabindex="{{attrs.tabindex}}"\
 style="{{attrs.style}}"\
 data-ampere-hotkey="{{attrs.ngAmpereHotkey}}"\
 title="{{attrs.title || $ampere.ui.getDescription( transition) | strip_tags}}{{hotkey && \' \' + hotkey}}">\
<i ng-class="attrs.ngAmpereIcon || $ampere.ui.getIcon( transition)"></i>\
{{(attrs.ngAmpereIcon || $ampere.ui.getIcon( transition)) && ($.trim( element.text()) || $ampere.ui.getCaption( transition)) && \'&nbsp;\' || \'\'}}\
{{$.trim( element.text()) || $ampere.ui.getCaption( transition)}}\
</button>'
			};

				// add LI creation support (convenience method for easier twitter bootstrap toolbar  creation)
			templates.li = '<li\
 class="ampere-transition name-{{transition.name()}}"\
 ng-class="{disabled : !transition.enabled(), active : transition.active()}">' + templates.a + '</li>'
			;

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
				scope        : 'isolate',
				link: function(scope, element, attrs) {
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

						var transition = newValue, transitionArguments = [];
						if( $.isPlainObject( newValue)) {
							transition = newValue.transition;

							_ns = $.ov.namespace('ngAmpereTransition(' + transition.fullName() + ')');
							_ns.assert( 
								newValue['arguments']===undefined || $.isArray( newValue['arguments']), 
								'property "arguments" expected to be undefined or array but is ' + $.ov.json.stringify( newValue['arguments'], $.ov.json.stringify.COMPACT)
							);
							$.isArray( newValue['arguments']) && (transitionArguments = newValue['arguments']);
						}

						!_ns || (_ns = $.ov.namespace('ngAmpereTransition(' + transition.fullName() + ')'));

						var type = attrs.type || transition.options( 'ampere-ui-input-type') || ($.inArray( element[0].tagName.toLowerCase(), Object.keys( templates))!=-1 ? element[0].tagName.toLowerCase() : 'button');

						scope.transition = transition;
						scope.transitionArguments = transitionArguments;
						scope.$enabled = scope.transition.enabled();
						scope.$css = (function( value) {
							return function() {
								return $.isFunction( value) ? value.call( this, this) : value;
							};
						})( scope.transition.options( 'ampere.ui.class'));	

						_ns.assert(
							window.ov.ampere.type( scope.transition)=='transition',
							'attribute "ng-ampere-transition" (="', attrs.ngAmpereTransition, '") does not resolve to a ampere transition or object containting a transition { transition : ..., ...}'
						);

						if( templates[ type]) {
							var template = templates[ type];

								// special case : tag a with type="file"
							if( type="file" &&  element[0].tagName=="A") {
								template = template.replace( /\type="button"|btn/g, '').replace( /button/g, 'a');
							}

							var f = $compile( template);
							var replacement = f( scope);

							element.replaceWith( replacement);

								// keep tabindex
							replacement.tabIndex=element.tabInde;

								// add data- attributes
							var dataAttributes = Object.keys( element[0].dataset);
							for( var i=0; i<dataAttributes.length; i++) {
								replacement.attr( 'data-' + dataAttributes[i], element[0].dataset[ dataAttributes[i]]);
							}

							var hotkey = attrs.ngAmpereHotkey || scope.$ampere.ui.getHotkey( scope.transition);

							if( hotkey) {
								scope.hotkey = ' (' + window.ov.ampere.util.ucwords( hotkey) + ')';
							}
							replacement.data( 'ampereTransition', transition);
						} else {
							_ns.raise( 'type "', type, '" is unknown');
						}
					}, true);
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
						$( element).on( eventName, function( event) {
							var value = scope.$eval( attrs[ directive]);

							var transition = value, transitionArguments = [];
							if( $.isPlainObject( value)) {
								transition = value.transition;
								$.isArray( value['arguments']) && (transitionArguments = value['arguments']);
							}

							if( transition) {
								var ui = scope.$ampere.ui;
								var controller = ui.controller;

								!ui.isBlocked() && controller.proceed( transition, [event].concat( transitionArguments));
							} else if( transition!==false) {
								_ns.error( 'attribute "ng-ampere-' + eventName + '" (=' +  attrs[ directive] + ') doesnt resolve to an ampere transition or object containting a transition { transition : ..., ...}');
							}
							//event.preventDefault();
							//event.stopPropagation();
							//event.stopImmediatePropagation();
							
						});
					}
				};
			}]);
		}
		eventDirective( 'change');
		eventDirective( 'click');
		eventDirective( 'dblclick');
		eventDirective( 'mousedown');
		eventDirective( 'mouseup');

		ampere.directive( 'ngAmpereDrop', [ function() {
			var _ns = $.ov.namespace( 'ngAmpereDrop');

			return {
				restrict   : 'A',
				link: function( scope, element, attrs) {
					$( element).on( 'drop', function( event) {
						var value = scope.$eval( attrs.ngAmpereDrop);

						var transition = value, transitionArguments = [];
						if( $.isPlainObject( value)) {
							transition = value.transition;
							$.isArray( value['arguments']) && (transitionArguments = value['arguments']);
						}

						if( transition) {
							var ui = scope.$ampere.ui;
							var controller = ui.controller;

							!ui.isBlocked() && controller.proceed( transition, [event].concat( transitionArguments));
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
					});
				}
			};
		}]);

		ampere.directive( 'ngAmpereSortable', [ '$timeout', function( $timeout) {
			var _ns = $.ov.namespace( 'ngAmpereSortable');

			return {
				restrict   : 'A',
				link: function( scope, element, attrs) {
					/*
					var options = {
						forcePlaceholderSize : true,
						placeholder : element[0].tagName=='TBODY' && $('<tr><td>&nbsp;</td></tr>')
					};
					*/
				
					var OPTIONS = { /*options*/
						helper			: function( e, tr) {
							var $originals = tr.children();
							var $helper = tr.clone();
							$helper.children().each(function( index) {
								$(this).width( $originals.eq( index).width());
							});
						    return $helper;
						},
						placeholder			: 'sortable-placeholder',
						forcePlaceholderSize: true,
						stop				: function( event, _ui) {
							var ui = scope.$ampere.ui;
							var controller = ui.controller;

							event.data = { items : _ui.item, position : _ui.item.index()};							
							if( window.ov.ampere.type( transition)=='transition') {
								!ui.isBlocked() && controller.proceed( transition, [ event]);
								
									// if we do the stuff below the jquery ui sortable
									// will reject the sort action reult which has a flicker effect
								//event.preventDefault();
								//event.stopPropagation();
								//event.stopImmediatePropagation();
								//return false;
							} else {
								transition( null, ui, [event].concat( transitionArguments));
							}
						}/*,
						start : function( event, ui ) {
							if( window.ov.ampere.type( transition)=='transition' && !transition.enabled()) {
								$( element.get()).sortable( "disable" );								
							}
						} 
						*/
					};

					var options = $.extend( {}, OPTIONS);
					var transition, transitionArguments = [];
					var value = scope.$eval( attrs.ngAmpereSortable);

					if( $.isPlainObject( value)) {
						/*
							// commented out to allow also plain functions to be used as callback 
							// for the sortable
						_ns.assert(
							(!Object.hasOwnProperty.call( value, 'transition') || value.transition) &&
							(!Object.hasOwnProperty.call( value, 'ng-ampere-transition') || value['ng-ampere-transition']),
							'value option transition or ng-ampere-transition doesnt resolve to a transition'
						);
						*/

						transition = value['ng-ampere-transition'] || value.transition || transition;
						$.isArray( value['arguments']) && (transitionArguments=value['arguments']);

						$.extend( options, value);
					} else if( value) {
						transition = value;
					} else {
						_ns.raise( 'could not evaluate attribute "ng-ampere-transition" to an object or function (="' + attrs.ngAmpereSortable + '")');
					}

					_ns.assert(
						window.ov.ampere.type( transition)=='transition' || $.isFunction( transition),
						'value option transition or ng-ampere-transition doesnt resolve to a transition'
					);

					scope.$watch( function( a, b, c, d, e) {
						
						if( element.hasClass( 'ui-sortable')) {
							if( !options.handle) {
								$( options.items, element.get()).addClass( 'draghandle');
							}
							$( element.get()).sortable( 'refresh');
						}
					});

						// ATTENTION : $timeout is no more needed an may have side effects (scope.$apply is called at end of timeout) !!!
					$timeout = function( f) {
						//scope.$ampere.module.once( 'ampere.view-changed', function() {
						//	f();
						//});
						f();
					};
					$timeout( function() {
						if( typeof( options.items)=='string') {
							//options.items = $( element.get()).children( options.items);
							options.items = '> ' + options.items;
						} else if( !options.items) {
							//options.items = $( element.get()).children( ':not(.ng-ampere-sortable-nohandle)');
							options.items = '> *:not(.ng-ampere-sortable-nohandle)';
						}

							// custom handle is given
						if( !options.handle) {
							$( options.items, element.get()).addClass( 'draghandle');
						}

						
							//THIS SEEMS TO BE NO MORE NEEDED						
						
							// if transition is not just a function but a true transition
							// suppress drag start if transition is disabled
						(window.ov.ampere.type( transition)=='transition') && $( element.get()).on( 'mousedown', options.items, function( event) {
							if( !transition.enabled()) {
								//event.preventDefault();
								//event.stopPropagation();
								event.stopImmediatePropagation();

								//return false;
							}
						});
						

						var sortable = $( element.get()).sortable( options);

						/*
						var ui = scope.$ampere.ui;
						var controller = ui.controller;

						transition && sortable.on( 'sortupdate', function( event, options) {
							event.data = { items : options.item, position : options.item.index()};

							!ui.isBlocked() && controller.proceed( transition, [ event]);
							event.preventDefault();
							event.stopPropagation();
							event.stopImmediatePropagation();
						});
						*/
					});
				}
			};
		}]);

		ampere.directive( 'ngAmpereHotkey', [ function() {
			var _ns = $.ov.namespace( 'ngAmpereHotkey');

			return {
				restrict   : 'A',
				link: function( scope, element, attrs) {
						/*
						 * if the ng-ampere-hotkey attribute is not
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

		ampere.directive( 'ngAmpereData', [ function() {
			var _ns = $.ov.namespace( 'ngAmpereData');

			return {
				restrict   : 'A',
				link: function( scope, element, attrs) {
					var data = scope.$eval( attrs.ngAmpereData);
					_ns.assert( $.isPlainObject( data), 'attribute "ng-ampere-data"(="' + attrs.ngAmpereData + '") expected to evaluate to an object');

					angular.extend( element.data(), data);
				}
			};
		}]);

		ampere.directive( 'ngAmpereWatch', [ function() {
			var _ns = $.ov.namespace( 'ngAmpereWatch');

			return {
				restrict   : 'A',
				link: function( scope, element, attrs) {
					function wrap( fn, property) {
						return function( scope) {
							var state = (arguments.length==1 ? scope : arguments[2]).$ampere.module.current().state;
							//var args = $.makeArray( arguments);
							var args = [];
							if( arguments.length==1) {
									// watch all call

								args.push( state);
							} else {
									// watch property call
								args.push( state);
								args.push( property);
							}
							args.push( element); 

							fn.apply( scope, args);
						};
					}

					var disposables = element.closest( '.ampere-module').data( 'ampere.disposable');
					var watcher = scope.$eval( attrs.ngAmpereWatch);
					if( $.isFunction( watcher)) {
						_ns.debug( 'activate watch(*) ', window.ov.ampere.util.functionName( watcher) || 'function', '()');

						disposables.push( scope.$watch( wrap( watcher)));
					} else if( $.isPlainObject( watcher)) {
						for( var key in watcher) {
							var f = watcher[ key];
							_ns.assert( $.isFunction( f), "watcher property value of key '", key, "'(=", $.ov.json.stringify( f, $.ov.json.stringify.COMPACT), ") expected to be a function");

							var watchedProperties = key.split( /\s*,\s*/g);
							for( var i=0; i<watchedProperties.length; i++) {
								var property = watchedProperties[i];
								if( property==='' || property==='*') {
									_ns.debug( 'activate watch(*) ', window.ov.ampere.util.functionName( f) || 'function', '()');
									disposables.push( scope.$watch( wrap( f)));
								} else {
									_ns.debug( 'activate watch(', property, ') ', window.ov.ampere.util.functionName( f) || 'function', '()');
									disposables.push( scope.$watch( property, wrap( f, property)));
								}
							}
						}
					} else {
						_ns.raise( 'dont know how to handle argument "', attrs.ngAmpereWatch, '". function or plain object argument is expected.');
					}
				}
			};
		}]);

		ampere.directive( 'ngAmpereDeferred', [ function() {
			var _ns = $.ov.namespace( 'ngAmpereDeferred');

			return {
				restrict   : 'A',
				link: function( scope, element, attrs) {
					function wrap( fn) {
						var deferred = fn.call( element, element);
						return $.isFunction( deferred.abort) && deferred.abort || $.isFunction( deferred.reject) && deferred.reject || $.noop;
					}

					var disposables = element.closest( '.ampere-module').data( 'ampere.disposable');
					var deferredFn = scope.$eval( attrs.ngAmpereDeferred);
					_ns.assert( $.isFunction( deferredFn), 'Argument ngAmpereDeferred(=', element.attr( 'ng-ampere-deferred'), ') expected to be a function<Deferred>');

					disposables.push( wrap( deferredFn));
				}
			};
		}]);

		ampere.directive( 'ngAmpereTemplate', [ '$compile', function( $compile) {
			return {
				restrict	: 'A',
				scope		: false,
				link		: function( scope, element, attrs) {
					scope.$watch( attrs.ngAmpereTemplate, function( newValue, oldValue) {
						var contents  = element.contents();
						
						if( newValue) {
							if( !$.isPlainObject( newValue)) {
								newValue = {
									replace : newValue
								};
							}

							element.empty();

							var content = window.ov.ampere.util.getTemplate(
								$.isFunction( newValue.prepend) && newValue.prepend.call( window, window) || newValue.prepend || ''
							);
							content && element.append( content);

							content = window.ov.ampere.util.getTemplate(
								$.isFunction( newValue.replace) && newValue.replace.call( window, window) || newValue.replace || ''
							) || contents;

							content && element.append( content);

							content = window.ov.ampere.util.getTemplate(
								$.isFunction( newValue.append) && newValue.append.call( window, window) || newValue.append || ''
							);
							content && element.append( content);

							$compile( element.contents())( scope);
						}
					}, true);
				}
			};
		}]);

		ampere.directive( 'ngAmpereValidate', [ function( $timeout) {
			var _ns = $.ov.namespace( 'ngAmpereValidate');

			return {
				restrict   : 'A',
				link: function( scope, element, attrs) {
					var fn = scope.$eval( attrs.ngAmpereValidate);
					_ns.assert(
						$.isFunction( fn),
						'dont know how to handle argument "', attrs.ngAmpereWatch, '". function or plain object argument is expected.'
					);

					var state = scope.$ampere.module.current().state;
					if( $.isFunction( fn)) {
						if( attrs.ngModel) {
							scope.$watch( attrs.ngModel, function( oldValue, newValue) {
								element.setCustomValidity( '');
								var result = fn.call( element.get(), element, state);
								if( typeof( result)=='string') {
									element.setCustomValidity( result);
								}
							}, true);
						} else {
							element.on( 'input', function() {
								element.setCustomValidity( '');
								var result = fn.call( element, element, state);
								if( typeof( result)=='string') {
									element.setCustomValidity( result);
								}
							});
						}
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
		var subnav = $('.subnav:last');
		if( !subnav.data( "inBodyScroll")) {

			subnav.data( "inBodyScroll", true);
			// If was not activated (has no attribute "data-top"
			if( !subnav.attr('data-top')) {
				// If already fixed, then do nothing
				if( subnav.hasClass('subnav-fixed')) {
						return;
				}
				// Remember top position
				var offset = subnav.offset() || {};
				subnav.attr('data-top', offset.top);
			}

			if( $( this).scrollTop() && subnav.attr('data-top') - subnav.outerHeight() <= $(this).scrollTop()) {
				subnav.addClass('subnav-fixed');
					// reset the individual css style to get the value from the css class
				$( 'body').css( 'padding-top', '');
				var paddingTop = parseInt( $( 'body').css( 'padding-top') || 0, 10);
				$( 'body').css( 'padding-top', paddingTop + subnav.height() + 'px');
			} else {
				subnav.removeClass('subnav-fixed');
					// remove style
				$( 'body').css( 'padding-top', '');
			}

			window.setTimeout( function() {
				subnav.data( "inBodyScroll", false);
			}, 300);
		}
	}

		/**
		 * a transition was clicked
		 */
	function onTransitionClicked( event) {
		var scope = angular.element( this).scope(),
			controller = $( this).closest( '.ampere-app').ampere();

		!controller.ui.isBlocked() && controller.proceed( scope.transition, [event].concat( scope.transitionArguments));

		event.preventDefault();
			// prevent any other hotkey handler to be invoked
		event.stopPropagation();
		event.stopImmediatePropagation();
	}

	/**
	 * focuses first form element in computed template
	 */
	function focus( /*jquery*/root) {
		var formControls = root.find( '.ampere-state .ampere-view input,select,textarea,button').filter( '[tabIndex!="-1"]:visible:enabled');
		if( !formControls.filter( '*[autofocus]').focus().length) {
			formControls.first().focus();
		}
	}

	function onActionAbort() {
		$.ov.namespace('twitterboostrap::onActionAbort()').debug( 'action aborted');

		var controller = $( this).closest( '.ampere-app').ampere();

		if( window.confirm( 'Really abort transition ?')) {
				// hide flash
			controller.ui.flash();

			var deferred = controller.ui.flash.getElement().data( 'ampere.action-deferred');
			_ns.assert( deferred && $.isFunction( deferred.promise), 'no action deferred registered on flash element');
			
				// trigger handler
			deferred.reject( controller.module);
		}
	}

		/*
		* allow anchors with attribute "draggable"
		* to be draggable to the desktop
		*/
	function onDraggableAnchor( event) {
		var dragImage = $( this).find( '[class^="icon-"]:first');
		dragImage.length && event.originalEvent.dataTransfer.setDragImage( dragImage[0], -10, -10);

		event.originalEvent.dataTransfer.setData(
			'DownloadURL',
			$( this).data( 'downloadurl') || "application/octet-stream:" + this.href.replace(/^.*[\/\\]/g, '') + ':'+ this.href
		);
	}

	function twitterbootstrap( controller, options) {
		if( !(this instanceof twitterbootstrap)) {
			return new twitterbootstrap( controller, options);
		}
		var self = this;

		this._super( controller, angular.extend( {}, twitterbootstrap.defaults, options || {}));

		var angularOptions = this.options( "ampere.ui.angular");
		if( angularOptions) {
			_ns.assert( $.isArray( angularOptions), 'option "ampere.ui.angular" expected to be an array but is of type ', $.type( angularOptions));
				// declare aditional angular directives
			var angularModule = angular.module('window.ov.ampere.ui.twitterbootstrap');

			for( var i=0; i<angularOptions.length; i++) {
				_ns.assert( $.isFunction( angularOptions[i]), 'items of option "ampere.ui.angular" expected to be an function but is of type ', $.type( angularOptions[i]));

				angularOptions[i].call( angularModule, angularModule);
			}
		}

		var layout = 'default';
		if( Object.hasOwnProperty.call( this.options(), 'ampere.ui.layout')) {
			layout = this.options( 'ampere.ui.layout');
				// set "nolayout" template when layout option was false
			layout || (layout='nolayout');
		}

		var name;
		if( $.inArray( layout, [ 'default', 'nolayout', 'wizard'])!=-1) {
			var template = 'ampere-ui-twitterbootstrap.layout.' + layout + '.tmpl';
			name = layout;
			if( document.getElementById( template)) {
				layout = $( document.getElementById( template));
			} else {
				layout = this.options( 'ampere.baseurl') + 'ampere-ui-twitterbootstrap.layout.' + layout + '.tmpl';
			}
			controller.element.addClass( 'layout-name-' + name);
		} else if( typeof( layout)=='string') {
			if( document.getElementById( layout)) {
				layout = $( document.getElementById( layout));
			}
			controller.element.addClass( 'layout-name-' + layout.replace(/(^.*[\/\\])|\./g, ''));
		}
		this.layout = typeof( layout)=='string' ? $.get( layout) : layout;

			/*
			 * automagically add 'ampere.ui.type':'global' for module transactions
			 */
		for( name in controller.module.transitions) {
			var transition = controller.module.transitions[ name];
			// doesnt work if value is undefined :
			//if( !Object.hasOwnProperty( transition.options(), 'ampere.ui.type')) {
			if( !('ampere.ui.type' in transition.options())) {
				transition.options( 'ampere.ui.type','global');
			}
		}

		function onMessage( event) {
				// in case of a cross origin posted message an execptiopn may occur
			if( !$.isEmptyObject( onMessage.handlers)) {
				try {
					var location = event.originalEvent.source.location.href.match( /[^#]+/);
					if( onMessage.handlers[ location]) {
						onMessage.handlers[ location]( event.originalEvent.data, event.originalEvent.source);
					}
				} catch( ex) {

				}
			}
		}
		onMessage.handlers = {};

		function onTypeAheadChange() {
			$( this).trigger( 'input');
		}

		var _init = this.init;
		this.init = function() {
			_init.call( this);

			(this.controller.element[0].tagName=="BODY") && $( window).on( 'resize scroll', onBodyscroll);

				// fix for bootstrap typeahead which dont throws oninput
			this.controller.element.on( 'change', 'input[data-provide="typeahead"]', onTypeAheadChange);

				// react on click only on standalone ampere transition representants
				// but not companions (like the representant of input[file] wit ng-ampere-transition)
			this.controller.element.on( 'click', '.ampere-transition:not( .ampere-transition-companion)', onTransitionClicked);
			this.controller.element.on( 'click', '.flash .alert button.close', onActionAbort);

				// allow anchors with attribute "draggable" to be draggable to the desktop
			this.controller.element.on( 'dragstart', 'a[draggable]', onDraggableAnchor);

				// fix buggy centering of bootstrap modals
			//this.controller.element.on( 'show', '.modal', function() {
			//	$(this).css({'margin-top':($(window).height()-$(this).height())/2,'top':'0'});
			//});			

			$( window).on( 'message', onMessage);

			focus( controller.element);
		};

		var _destroy = this.destroy;
		this.destroy = function() {
			_destroy.call( this);
			(this.controller.element[0].tagName=="BODY") && $( window).off( 'resize scroll', onBodyscroll);

			this.controller.element.off( 'change', 'input[data-provide="typeahead"]', onTypeAheadChange);

			this.controller.element.off( 'click', '.ampere-transition', onTransitionClicked);
			this.controller.element.off( 'click', '.flash .alert button.close', onActionAbort);

			$( this.controller.element).off( 'dragstart', 'a[draggable]', onDraggableAnchor);

			$( window).off( 'message', onMessage);
		};

			/**
			 * (used by crud table for example)
			 */
		this.scrollIntoView = function( jElement, /*false==at bottom, true==at top*/bottom) {
			var jContainer = jElement.parent().closest( '.scrollable');

				// abort if no scrollable container was found
			if( !jContainer.length) {
				return;
			}

			if( bottom) {
					// if before visible area
				if( jElement.position().top<0) {
					this.scrollIntoView( jElement);
				} else if( jElement.position().top>=jContainer.height()) {
						// if after visible area
					jContainer.stop().animate({
						scrollTop : jContainer.scrollTop() + jElement.position().top - jContainer.height() + jElement.height()
					}, 'fast');
				}
			} else {
					// if before visible area
				if( jElement.position().top<0) {
					jContainer.stop().animate({
						scrollTop : jContainer.scrollTop() + jElement.position().top
					}, 'fast');
				} else if( jElement.position().top>=jContainer.height()) {
					this.scrollIntoView( jElement, true);
				}
			}
		};

		this.flash = function( message, /* optional */options) {
			if( arguments.length) {
				options = options || {};
				var flash = this.flash.getElement();

				switch( options.type) {
					case 'progress' :
						flash.addClass( 'wait');
						flash.find( '.alert').removeClass( 'alert-error').addClass( 'alert-info');
						flash.find('.progress').show()
						.find( '.bar').css( 'width', options.value);

							// it is an progress event ?
						if( message && 'progress'===message.type) {
							var isUpload = !!options.value;
							flash.find( '.message').text( isUpload ? 'Uploading ...' : 'Downloading ...');
						} else {
							flash.find( '.message').text( message);
						}

						var deferred = options.deferred;
							// add abort button if the provided promise
							// is a deferred
						
						flash.find( 'button.close')[ deferred && $.isFunction( deferred.reject) ? 'show' : 'hide']();

						break;
					case 'error' :
							// skip possibly running animations (fadeout or example ...) and force flash to be visible
						flash.stop( true).css( 'opacity', '1');


						flash.removeClass( 'wait');

							// reset flash style to default
						flash.find( '.alert').removeClass( 'alert-info').addClass( 'alert-error');
						flash.find('.progress').hide();

						flash.find( '.message').text( 'Error occured : ' + message);
						if( options.value) {
							var retry = $('<button class="btn retry"><i class="' + ($.isFunction( options.value) && 'icon-refresh') + '"></i>' + ($.isFunction( options.value) ? 'Retry' : 'Ok') + '</button>');
							retry.click( function() {
								flash.hide();
								$.isFunction( options.value) && options.value();
							});

							var cancel = $('<button class="btn"><i></i>Cancel</button>');
							cancel.click( function() {
								flash.hide();
								self.unblock();
							});

							flash.find( '.message').append(
								$( '<div class="btn-group">').append( retry, cancel)
							);
						}
						flash.find( 'button.close').hide();
						break;
					default :
						flash.removeClass( 'wait');
						flash.find( '.alert').removeClass( 'alert-error alert-info');

						flash.find( '.progress, button.close').hide();

						flash.find( '.message').text( message);

						flash.show().fadeOut( 1000);
						return;
				}

				flash.show();
			} else {
				this.flash.getElement().hide();
			}

			return this.flash;
		};
		this.flash.getElement = function() {
			return controller.element.find( '.flash');
		};
		this.flash.progress = function( message, progress, deferred) {
				// hide flash if message is undefined
			return message===undefined  ? self.flash() : self.flash( message || 'Operation in progress ...', {
				type     : 'progress',
				value    : progress || '100%',
				deferred : deferred || self.flash.getElement().data( 'ampere.action-deferred')
			});
		};
		this.flash.error = function( message, onRetry) {
			return self.flash( message, {
				type     : 'error',
				value    : onRetry
			});
		};

		this.isBlocked = function() {
			return this.controller.element.find( '.overlay').hasClass( 'block');
		};

		this.block = function() {
			this.controller.element.addClass( 'overlay').find( '.overlay').addClass( 'block');

			return this;
		};

		this.unblock = function() {
			this.controller.element.removeClass( 'overlay').find( '.overlay').removeClass( 'block');

			return this;
		};

		this.getTemplate = function( view) {
			var template = view.template();

			if( !template && template!=='') {
				template = this.options( 'ampere.ui.view');
				if( typeof( template)=='string') {
					if( document.getElementById( template)) {
						template = $( document.getElementById( template));
					} else {
						template = $.get( view);
					}
				} else if( !template) {
					template = 'ampere-ui-twitterbootstrap.view.default.tmpl';
					if( document.getElementById( template)) {
						template = $( document.getElementById( template));
					} else {
						template = $.get( this.options( 'ampere.baseurl') + template);
					}
				}
			} else if( $.isFunction( template)) {
				template = template.call( view, view);
			}

			$.ov.namespace( 'ngState').assert(
				!$.isFunction( template.promise) || template.promise().state()!='success',
				'view fragment is not ready : state=', $.isFunction( template.promise) ? template.promise().state() : ''
			);

			return $.when( $.isFunction( template.promise) ? template.promise() : template);
		};

		this.renderAction = function( promise) {
			this.flash
			.progress( 'Transition in progress ...', '100%', promise)
			.getElement().data( 'ampere.action-deferred', promise);

			promise
			.progress( self.flash.progress)
			.then( function() {
					// hide flash && dont forget to remove the temporay data after finishing
				self.flash().getElement().removeData( 'ampere.action-deferred');
			});
		};

		this.renderError = function( message, onRetry) {
			this.refresh();
			this.flash.error( message, onRetry);
		};

		this.update = function() {
				// transport current state properties into scope
			var scope = angular.element( controller.element.find( '.ampere-view:first')).scope();

				// remove old scope variables
			var i, toDelete = $.grep( Object.keys( scope), function( item) {
				return item!='this' && item.charAt( 0)!='$';
			});

							// transport state variables into scope
			var properties = Object.keys( scope.$ampere.module.current().state);
			for( i in properties) {
				_ns
				.assert( properties[i]!='this', 'state property named "this" is forbidden')
				.assert( properties[i].charAt( 0)!='$', 'state property starting with $ (="', properties[i], '") is forbidden');

				if( properties[i]!='promise') {
					if( scope[ properties[i]] !== scope.$ampere.module.current().state[ properties[i]]) {
						scope[ properties[i]] = scope.$ampere.module.current().state[ properties[i]];
						_ns.debug( 'update scope.' + properties[i] + '=', $.ov.json.stringify( scope[ properties[i]], $.ov.json.stringify.COMPACT));
					}					

					var index = $.inArray( properties[i], toDelete);
					index!=-1 && toDelete.splice( index, 1);
				}
			}

			for( i in toDelete) {
				_ns.debug( 'delete previsouly defined scope.' + toDelete[i]);
				delete scope[ toDelete[i]];
			}

			scope.$$phase || scope.$apply( $.noop);

				// broadcast ampere.view-changed event
			controller.module.trigger( "ampere.view-updated");

			return this;
		};

		this.refresh = function() {
			this.renderState( controller.module.current().view);
				// broadcast ampere.view-changed event
			controller.module.trigger( "ampere.view-refreshed");

			return this;
		};

		//var lastView = undefined;
		this.renderState = function( view, template, transitionResult) {
				// twitter bootstrap fix : cleanup added dropdowns
			$('body').children( '.dropdown-menu').remove();

				// remember scroll position
			var scrollX = window.scrollX;
			var scrollY = window.scrollY;
			//console.warn( scrollY);

			var scope = angular.element( controller.element.find( '>.ampere-module')).scope();

			var apply = function() {
					/*
					 * if no view was given - just rerender the current view
					 * this case happens for history.reset
					 */
				if( view) {
						// cleanup opened modals whenever a new view gets rendered
					$('.modal:visible').hide();
					$('.modal-backdrop').remove();

					scope.$ampere = {
						module	: controller.module,
						ui		: controller.ui,
						view	: view,
							/*
							 * module.current.reset is calling this
							 * function without providing a template
							 * so we take the already used one as fallback
							 */
						template : template==='' ? template : template || scope.$ampere.template
					};
				}
			};

			if( scope.$$phase=="$apply") {
				apply();
			} else {
				scope.$apply( apply);
			}

				// compute optional flash message
			$.when( transitionResult).done( function() {
					// initialize datepickers
				$( 'input[data-date-format]').datepicker({ autoclose : true})
					// datepicker only triggers chnage but angular expects "input"
				.on('changeDate', function( event) {
					$( event.target).trigger( 'input');
				});
					// render initial validation results into title 
				$( ".html5validation-title").each( function() {
					$( this).attr( 'title', this.validationMessage);
				});

				focus( controller.element);

				//window.scrollTo( scrollX, scrollY);
				//window.scrollTo( 0, 0);
				//onBodyscroll();

				if( /*arguments.length==1 &&*/ typeof( arguments[0])=='string') {
						// display flash message
					self.flash( arguments[0]);
				} else {
						// hide flash 
					self.flash();
				}
			});
		};

		// see Ampere.UI
		this.modal = function( url, options) {
			options = options || {};
			var popup, callback = $.noop;

			if( !options.container) {
				popup = $( '<div class="container modal-popup"><iframe width="100%" height="100%" border="no" src="' + url + '"></iframe></div>');
				controller.element.addClass( 'modal-popup').find( '.ampere-module').append( popup);

				url = popup.find( 'iframe')[0].src;
				callback =function() {
					controller.element.removeClass( 'modal-popup');
					popup.remove();
				};
			} else {
				popup = $( '<div class="modal-embed-backdrop"></div><div class="container modal-embed"><iframe border="no" src="' + url + '"></iframe></div>');
				controller.element.addClass( 'modal-embed');

				options.container
				.addClass( 'modal-embed-container')
				.append( popup);

				url = popup.find( 'iframe')[0].src;
				callback = function() {
					controller.element.removeClass( 'modal-embed');
					options.container.removeClass( 'modal-embed-container');
					popup.remove();
				};
			}

			popup.find( 'iframe').focus();

			var deferred = $.Deferred( options.callback || $.noop);
			onMessage.handlers[ url] = $.proxy( options.onMessage || $.noop, deferred);

				// remove popup when deferred is done/rejected
			deferred.always( function() {
				callback();
					// remove message handler
				delete onMessage.handlers[ url];
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
			$.when( controller.module.current().view, controller.module.current().view.template, this.layout, controller.module)
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
						controller.element.append( '<div class="alert">' + (self.layout.isRejected() ? self.layout.statusText + ' : ' + layout : $.ov.json.stringify( arg, $.ov.json.stringify.COMPACT)) + '</div>');
					})
				);
				$( '.progress', controller.element).addClass( 'progress-danger');
				deferred.resolveWith( controller.ui, self.layout.isRejected() ? self.layout.statusText + ' : ' + layout : arg);
			}).done( function() {
				eProgress.remove();

				controller.element
				.append( self.layout.responseText ? self.layout.responseText : (self.layout.jquery && self.layout[0].tagName=='SCRIPT' ? self.layout.text().replace( "<![CDATA[", "").replace("]]>", "") : self.layout));

				var template = self.getTemplate( controller.module.current().view);
				template.done( function( data) {
					if( data instanceof HTMLElement) {
						data = $( data);
					}

					template = data.jquery ? (data[0].tagName=='SCRIPT' ? data.text().replace( "<![CDATA[", "").replace("]]>", "") : data) : template.responseText || data;
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

						// broadcast ampere.view-changed event
					controller.module.trigger( "ampere.view-changed");

					deferred.resolveWith( controller.ui, []);
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