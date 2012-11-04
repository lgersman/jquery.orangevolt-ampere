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
				return window.ov.ampere.type( input);
			};
		});
		ampere.filter( 'match', function() {
			return function( items, property, value) {
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
								_ns.debug( 'delete previsouly defined scope.' + properties[i]);
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

						_ns.debug( 'template=' + template);

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
					});
				}
			};
		}]);

		ampere.directive( 'ngAmpereTransition', [ '$compile', '$parse', '$window', function( $compile, $parse, $window) {
			var templates = {
				'a'     : '<a href="javascript:void(0)"\
 class="ampere-transition name-{{transition.name()}} {{attrs.class}}"\
 ng-class="{disabled : !transition.enabled(), active : transition.active(), \'ampere-hotkey\' : hotkey}"\
 accesskey="{{attrs.accesskey}}"\
 id="{{attrs.id}}"\
 style="{{attrs.style}}"\
 data-ampere-hotkey="{{attrs.ngAmpereHotkey}}"\
 title="{{attrs.title || $ampere.ui.getDescription( transition) | strip_tags}}{{hotkey && \' \' + hotkey}}">\
<i ng-class="attrs.ngAmpereIcon || $ampere.ui.getIcon( transition)"></i>\
 {{$.trim( element.text()) || $ampere.ui.getCaption( transition)}}\
</a>',
				'button' : '<button type="button"\
 ng-disabled="!transition.enabled()"\
 class="ampere-transition name-{{transition.name()}} btn {{attrs.class}}"\
 ng-class="{disabled : !transition.enabled(), active : transition.active(), \'ampere-hotkey\' : hotkey}"\
 ng-disabled="!transition.enabled()"\
 id="{{attrs.id}}"\
 accesskey="{{attrs.accesskey}}"\
 style="{{attrs.style}}"\
 data-ampere-hotkey="{{attrs.ngAmpereHotkey}}"\
 title="{{attrs.title || $ampere.ui.getDescription( transition) | strip_tags}}{{hotkey && \' \' + hotkey}}">\
<i ng-class="attrs.ngAmpereIcon || $ampere.ui.getIcon( transition)"></i>\
 {{$.trim( element.text()) || $ampere.ui.getCaption( transition)}}\
</button>',
				'file' : '<button type="button"\
 onclick="$( this).next().click()"\
 ng-disabled="!transition.enabled()"\
 class="ampere-transition name-{{transition.name()}} btn ampere-transition-companion {{attrs.class}}"\
 ng-class="{disabled : !transition.enabled(), active : transition.active(), \'ampere-hotkey\' : hotkey}"\
 ng-disabled="!transition.enabled()"\
 accesskey="{{attrs.accesskey}}"\
 style="{{attrs.style}}"\
 data-ampere-hotkey="{{attrs.ngAmpereHotkey}}"\
 title="{{attrs.title || $ampere.ui.getDescription( transition) | strip_tags}}{{hotkey && \' \' + hotkey}}">\
<i ng-class="attrs.ngAmpereIcon || $ampere.ui.getIcon( transition)"></i>\
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
 class="ampere-transition name-{{transition.name()}} btn {{attrs.class}}"\
 ng-class="{disabled : !transition.enabled(), active : transition.active(), \'ampere-hotkey\' : hotkey}"\
 ng-disabled="!transition.enabled()"\
 id="{{attrs.id}}"\
 accesskey="{{attrs.accesskey}}"\
 style="{{attrs.style}}"\
 data:ampere-hotkey="{{attrs.ngAmpereHotkey}}"\
 title="{{attrs.title || $ampere.ui.getDescription( transition) | strip_tags}}{{hotkey && \' \' + hotkey}}">\
<i ng-class="attrs.ngAmpereIcon || $ampere.ui.getIcon( transition)"></i>\
 {{$.trim( element.text()) || $ampere.ui.getCaption( transition)}}\
</button>',
				'reset' : '<button type="reset"\
 ng-disabled="!transition.enabled()"\
 class="ampere-transition name-{{transition.name()}} btn {{attrs.class}}"\
 ng-class="{disabled : !transition.enabled(), active : transition.active(), \'ampere-hotkey\' : hotkey}"\
 ng-disabled="!transition.enabled()"\
 accesskey="{{attrs.accesskey}}"\
 style="{{attrs.style}}"\
 data-ampere-hotkey="{{attrs.ngAmpereHotkey}}"\
 title="{{attrs.title || $ampere.ui.getDescription( transition) | strip_tags}}{{hotkey && \' \' + hotkey}}">\
<i ng-class="attrs.ngAmpereIcon || $ampere.ui.getIcon( transition)"></i>\
 {{$.trim( element.text()) || $ampere.ui.getCaption( transition)}}\
</button>'
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

						_ns = $.ov.namespace('ngAmpereTransition(' + newValue.fullName() + ')');

						var type = attrs.type || ($.inArray( element[0].tagName.toLowerCase(), Object.keys( templates))!=-1 ? element[0].tagName.toLowerCase() : 'button');

						scope.transition = newValue;
						scope.$enabled = scope.transition.enabled();

						_ns.assert(
							$.type( scope.transition)=='object' && scope.transition.constructor && scope.transition.constructor.name=='Transition',
							'attribute "ng-ampere-transition" (="', attrs.ngAmpereTransition, '") does not resolve to a ampere transition'
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
						$( element).on( eventName, function( event) {
							var transition = scope.$eval( attrs[ directive]);

							if( transition) {
								var ui = scope.$ampere.ui;
								var controller = ui.controller;

								!ui.isBlocked() && controller.proceed( transition, [event]);
							} else {
								_ns.error( 'attribute "ng-ampere-' + eventName + '" (=' +  attrs[ directive] + ') doesnt resolve to an ampere transition');
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
					});
				}
			};
		}]);

		ampere.directive( 'ngAmpereSortable', [ '$timeout', function( $timeout) {
			var _ns = $.ov.namespace( 'ngAmpereSortable');

			return {
				restrict   : 'A',
				link: function( scope, element, attrs) {
					var options = {
						forcePlaceholderSize : true,
						placeholder : element[0].tagName=='TBODY' && $('<tr><td>&nbsp;</td></tr>')
					};

					var transition;
					var value = scope.$eval( attrs.ngAmpereSortable);
					if( $.isPlainObject( value)) {
						_ns.assert(
							(!Object.hasOwnProperty.call( value, 'transition') || value.transition) &&
							(!Object.hasOwnProperty.call( value, 'ng-ampere-transition') || value['ng-ampere-transition']),
							'value option transition or ng-ampere-transition doesnt resolve to a transition'
						);

						transition = value['ng-ampere-transition'] || value.transition || transition;

						$.extend( options, value);
					} else if( value) {
						transition = value;
					}

					$timeout( function() {
						var sortable = $( element.get()).sortable({ /*options*/
							helper			: function( e, tr) {
								var $originals = tr.children();
								var $helper = tr.clone();
								$helper.children().each(function( index) {
									$(this).width( $originals.eq( index).width());
								});
							    return $helper;
							},
							items				: $( element.get()).children( ':not(.ng-ampere-sortable-nohandle)'),
							placeholder			: 'sortable-placeholder',
							forcePlaceholderSize: true,
							stop				: function( event, _ui) {
								var ui = scope.$ampere.ui;
								var controller = ui.controller;

								if( transition) {
									event.data = { items : _ui.item, position : _ui.item.index()};

									!ui.isBlocked() && controller.proceed( transition, [ event]);
									event.preventDefault();
									event.stopPropagation();
									event.stopImmediatePropagation();
								}
							}
						});
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
							var args = $.makeArray( arguments);
							if( arguments.length==1) {
									// watch all call

									// replace scope argument by state
								args[0] = state;
							} else {
									// watch property call

									// remove scope argument
								args.pop();

								args.unshift( property);
								args.unshift( state);
							}
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
				if ($('.subnav').hasClass('subnav-fixed')) {
						return;
				}
				// Remember top position
				var offset = $('.subnav').offset() || {};
				$('.subnav').attr('data-top', offset.top);
		}

		if( $(this).scrollTop() && $('.subnav').attr('data-top') - $('.subnav').outerHeight() <= $(this).scrollTop()) {
				$('.subnav').addClass('subnav-fixed');
		} else {
				$('.subnav').removeClass('subnav-fixed');
		}
	}

		/**
		 * a transition was clicked
		 */
	function onTransitionClicked( event) {
		var transition = angular.element( this).scope().transition;
		var controller = $( this).closest( '.ampere-app').ampere();

		!controller.ui.isBlocked() && controller.proceed( transition, [event]);

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
			var location = event.originalEvent.source.location;
			if( onMessage.handlers[ location]) {
				onMessage.handlers[ location]( event.originalEvent.data, event.originalEvent.source);
			}
		}
		onMessage.handlers = {};

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

			$( window).on( 'message', onMessage);

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

			$( window).off( 'message', onMessage);
		};

		this.flash = function( message, /* optional */options) {
			if( arguments.length) {
				options = options || {};
				var flash = this.flash.getElement();

				switch( options.type) {
					case 'progress' :
						flash.find( '.alert').removeClass( 'alert-error').addClass( 'alert-info');
						flash.find('.progress').show()
						.find( '.bar').css( 'width', options.value);

						flash.find( '.message').text( message);

						var deferred = options.deferred;
							// add abort button if the provided promise
							// is a deferred
						flash.find( 'button.close')[ deferred && $.isFunction( deferred.reject) ? 'show' : 'hide']();

						break;
					case 'error' :
							// reset flash style to default
						flash.find( '.alert').removeClass( 'alert-info').addClass( 'alert-error');
						flash.find('.progress').hide();

						flash.find( '.message').text( 'Error occured : ' + message);
						if( options.value) {
							var retry = $('<button class="btn retry"><i class="icon-refresh"></i>Retry</button>');
							retry.click( function() {
								flash.hide();
								options.value();
							});
							flash.find( '.message').append( retry);
						}
						flash.find( 'button.close').hide();
						break;
					default :
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

			return  this.flash;
		};
		this.flash.getElement = function() {
			return controller.element.find( '.flash');
		};
		this.flash.progress = function( message, progress, deferred) {
			return self.flash( message || 'Operation in progress ...', {
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
		};

		this.unblock = function() {
			this.controller.element.removeClass( 'overlay').find( '.overlay').removeClass( 'block');
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
			this.flash.error( message, onRetry);
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
												ui          : controller.ui,
						view     : view,
							/*
							 * module.current.reset is calling this
							 * function without providing a template
							 * so we take the already used one as fallback
							 */
						template : template==='' ? template : template || scope.$ampere.template
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
					self.flash( arguments[0]);
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