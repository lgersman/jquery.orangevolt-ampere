/**
 * module wizard option "baseUrl" can be used to prefix the relative path 
 * to the wizard resources  
 */
window.$deferRun(
	function( $, options) {
		options.baseUrl || (options.baseUrl='');
		
		$.ampere( function() {
				/**
				 * module wizard supports the following options : 
				 * 	author (required) - author name,
				 * 	email (required)  - author email,
				 * 	existingWidgets   - array[string] containing names of existing widgets  
				 */
			this.module( function wizard() {
				this.ensure( this.options('existingWidgets'), 'option existingWidgets (array[string]) is required.');
				this.ensure( this.options('reservedNames'), 'option existingWidgets (array[string]) is required.');
				this.ensure( this.options('author'), 'option author (string) is required.');
					this.ensure( this.options('email'), 'option email (string) is required.');
				
				this.existingWidgets = this.options('existingWidgets');
				
				this
				.state( function main() {
				},{
					label : ''
				})
				
				.state( function name() {
					this.name = 'mywidget';
					this.isInvalid = function() {
						return !/^[a-z_][0-9a-z_]*$/i.test( this.state.name) 
						|| -1!=$.inArray( this.state.name.toLowerCase(), this.state.module.existingWidgets)
						|| -1!=$.inArray( this.state.name.toLowerCase(), this.state.module.options( 'reservedNames'));
					};
				})
				
				.state( function codegen() {
					// preselect transition parameter as default
					this.$transition = 'codegen_fromscratch';
				},{
					label : 'Code generation'
				})
				
				.state( function codegen_fromscratch() {
					this.paradigma = 'functional';
					this.structure = 'single';
					this.paradigmaEqualsOop = function() {
						return this.paradigma=='oop'; 
					};
				},{
					label : 'Project structure'
				})
				
				.state( function codegen_fromscratch_actions() {
					this.show 	= true;
					this.config = true;
				},{
					label : 'Choose widget actions'
				})
				
				.state( function codegen_fromtemplate() {
					this.module.existingWidgets.length && (this.template = this.module.existingWidgets[0]); 
				}, {
					label : 'Select template widget'	
				})
				
				.state( function preview() {
					this.generatefiles = function() {
						var files = { 
							'index.php'    : {
								description : "This is the the widget entrypoint. It is executed everytime a widget action is requested."
							},
							'show.phtml'   : {
								description : "The view template for the show action. It is assumed to produce html output representing the widget"
							}
						};
						
						var paradigma = this.module.states.codegen_fromscratch.paradigma;
						var structure = this.module.states.codegen_fromscratch.structure;
						var codegen_fromscratch_actions = this.module.states.codegen_fromscratch_actions;
						
						if( paradigma=='functional' && structure=='multiple') {
							files['show.php'] = {
								description : "show.php is executed when the show action is requested."
							};
							
							if( codegen_fromscratch_actions.create) {
								files['create.php'] = {
									description : "create.php is executed when the widget gets created."
								};	
							}
							
							if( codegen_fromscratch_actions.destroy) {
								files['destroy.php'] = {
									description : "destroy.php is executed when the widget gets destroyed."
								};	
							}
							
							if( codegen_fromscratch_actions.thumbnail) {
								files['thumbnail.php'] = {
									description : "thumbnail.php is executed when the thumbnail action is requested."
								};	
							}
						}
						
						if( codegen_fromscratch_actions.config) {
							files['config.phtml'] = {
								description : "The view template for the config action. It is assumed to produce html output representing the widget configuration form."
							};
							
							if( paradigma=='functional' && structure=='multiple') {
								files['config.php'] = {
									description : "config.php is executed when the config action is requested."
								};
							}
						}
						
						if( codegen_fromscratch_actions.todo) {
							files['todo.phtml'] = {
								description : "The view template for the todo action."
							};
							
							if( paradigma=='functional' && structure=='multiple') {
								files['todo.php'] = {
									description : "todo.php is executed when the todo action is requested."
								};
							}
						}
						
						if( codegen_fromscratch_actions.notifications) {
							files['notifications.phtml'] = {
								description : "The view template for the notifications action."
							};
							
							if( paradigma=='functional' && structure=='multiple') {
								files['notifications.php'] = {
									description : "notifications.php is executed when the notifications action is requested."
								};
							}
						}
						
						if( codegen_fromscratch_actions.short_notifications) {
							files['short_notifications.phtml'] = {
								description : "The view template for the short notifications action."
							};
							
							if( paradigma=='functional' && structure=='multiple') {
								files['short_notifications.php'] = {
									description : "short_notifications.php is executed when the short notification action is requested."
								};
							}
						}
						
						if( codegen_fromscratch_actions.layout) {
							files['layout.phtml'] = {
								description : "The view template for the layout action."
							};
							
							if( paradigma=='functional' && structure=='multiple') {
								files['layout.php'] = {
									description : "layout.php is executed when the layout action is requested."
								};
							}
						}
						
						for( var file in files) { 
							var source = $.ampere.modules.wizard.defaults.generators[ file].call(
								this.module, {
									'author' : this.module.options( 'author'),
									'date'   : $.global.format( new Date(), 'yyyy-MM-dd HH:mm'),
									'email'  : this.module.options( 'email')
								}
							);
							files[ file].source = source;
						}
						
						return files;
					};
					
					this.generatecode = function( element, options) {
						var files = this.data.state.generatefiles.call( this.data.state);

						var ul = $( '<ul>').appendTo( element);
						for( var file in files) { 
							ul.append( 
								$( '<li>')
								.append( 
									$('<div class="file">')
									.append( 
										$( '<h3 class="head">')
										.append( 
											$('<a href="#">')
											.text( file)
										)
									)
									.append( 
										$( '<div class="body">')
										.append( $( '<pre class="syntax php-script">').text( files[file].source))
										.append( $( '<div class="description">').text( files[file].description))
									)
								)
							);
						}
						$.syntax( { blockLayout: 'plain'});
						element.find( '.file').accordion({
							collapsible : true,
							active	    : false,
							autoHeight  : false
						});
					};
					
					this.disabled = function() {
						return this.module.states.codegen.$transition!='codegen_fromscratch';
					};
				}, {
					icon : 'ui-icon-zoomin'
				})
				
				.state( function finish() {
					
				})
				
				.state( function finished() {
					this.transition( this.module.states.name, {
						label  : 'Create another widget',
						action : function() {
							this.state.module.existingWidgets.push( this.state.module.states.name.name);
							this.state.module.states.name.name = '';
							delete this.state.response;
						} 
					});
				});
				
				this.states.name
				.transition( this.states.codegen, {
					disabled : this.states.name.isInvalid 
				})
				.transition( this.states.preview, {
					disabled : this.states.name.isInvalid
				})
				.transition( this.states.finish, {
					icon 	  : 'ui-icon-flag',
					disabled : this.states.name.isInvalid
				});
				
				this.states.codegen
				.transition( this.states.codegen_fromscratch,{
					label  : 'from scratch',
					type   : 'secondary'
				})
				.transition( null, { 
					label  : 'Next',
					target : '$transition'
				})
				.transition( this.states.codegen_fromtemplate, {
					label	  : 'from template',
					type   	  : 'secondary',
					disabled  : function() {
						return this.state.module.existingWidgets.length==0;
					}
				})
				.transition( this.states.preview)
				.transition( this.states.finish, {
					icon 	  : 'ui-icon-flag'
				});

				this.states.codegen_fromscratch
				.transition( this.states.codegen_fromscratch_actions)
				.transition( this.states.preview)
				.transition( this.states.finish, {
					icon 	  : 'ui-icon-flag'
				});				
				
				this.states.codegen_fromscratch_actions
				.transition( this.states.preview)
				.transition( this.states.finish, {
					icon 	  : 'ui-icon-flag'
				});
				
				this.states.codegen_fromtemplate
				.transition( this.states.preview)
				.transition( this.states.finish, {
					icon 	  : 'ui-icon-flag'
				});
							
				this.states.main.transition( this.states.name, {
					type  : 'secondary',
					label : 'Proceed'
				});
				
				this.states.preview
				.transition( this.states.finish, {
					icon 	  : 'ui-icon-flag'
				});
				
				this.states.finish
				.transition( this.states.finished, {
					type  	: 'secondary',
					label 	: 'Create widget', 
					icon 	: 'ui-icon-gear',
					action 	: function() {
						var transition = this;
						
						var data = {
							name  : transition.state.module.states.name.name
						};
						if( this.state.module.states.codegen.$transition=='codegen_fromscratch') {
							data['files'] = transition.state.module.states.preview.generatefiles();
						} else {
							data['template'] = transition.state.module.states.codegen_fromtemplate.template;
						}
						
							// create the widget sources
						$.ajax({
							type 	: 'post',
							cache   : false,
							async   : false,  	
							url  	: transition.state.module.options( 'endpoint'), 
							data 	: { data : JSON.stringify( data)},
							success : function( data, status, request) {
								transition.log( 'data received = ', data);
								transition.ensure( !data.options || !data.options.error, data.message);
								transition.target.response = data;
							}, 
							error	: function( xhr, textStatus, errorThrown) {
								transition.ensure( false, errorThrown);
							},
						 	dataType: 'json'
						});
					}		
				});
			},
			$.extend({ 
				label    		: 'CM4ALL Widget wizard',
				icon  			: 'ui-icon-star',
				generators 		: undefined,			/* will be defined by resources.templates function. see below */
				existingWidgets : undefined,			// should be overwritten as instance option
				widgetactions	: {
					show				: {
						description : "Action rendering the widget",
						params		: { 
							'instance' : 'the widget instance',
							'return  ' : 'nothing (default).\nA returned string will be interpreted as the name of the view template name to use.\nReturning false means view template processing should be prevented.'	
						},
						code		: "//example : define a variable processed in the view\n$instance->foo = 'bar';"
					},
					config				: {
						description : "Gets called when widget configuration is requested.",
						params		: { 
							'instance' : 'the widget instance'
						},
						code		: "// declare configuration dialog should be guilib'ized\n$instance->widget( /*widget configuration dialog options goes here*/)->guilib( /*guilib options goes here*/);"
					},	
					thumbnail			: {
						description : "Gets called to render the widget instance state as thumbnail.\nThe action is expected to output image data.\n( ... Don't forget to set the matching image mimetype header before sending the image.)",
						params		: { 
							'instance' : 'the widget instance'
						},
						code		: "// example usage delivering an static image as thumbnail\n$instance->headers['Content-Type']='image/jpg';\n$instance->headers['Content-Length']=filesize( 'res/myimage.jpg');\nfopen( 'res/myimage.jpg', 'r');\necho stream_get_contents( $fh);\nfclose( $fh);"
					},	
					preview			: {
						description : "Gets called to render the widget instance preview.\nThis action can be used to render the widget different while it gets configured.",
						params		: { 
							'instance' : 'the widget instance',
							'return  ' : 'nothing (default).\nA returned string will be interpreted as the name of the view template name to use.\nReturning false means view template processing should be prevented.'
						},
						code		: "// optional : prepare widget data for rendering here"
					},	
					todo 				: {
						description : "Gets called to return the widget instance todo.",
						params		: { 'instance' : 'the widget instance'},
						code		: "// your code here"
					},	
					notifications		: {
						description : "Gets called to return the widget instance notifications.",
						params		: { 'instance' : 'the widget instance'},
						code		: "// your code here"
					},	
					short_notifications	: {
						description : "Gets called to return the widget instance notifications in short form.",
						params		: { 'instance' : 'the widget instance'},
						code		: "// your code here"
					},	
					layout				: {
						description : "Gets called to return the widget layout.",
						params		: { 'instance' : 'the widget instance'},
						code		: "// your code here"
					},	
					create				: {
						description : "create() is called when the widget gets created.\nGiven widget initialization parameters can be accessed by accessing object array $instance->params.\nYou can set widget parameters by assign properties to $instance->params.\nSet widget parameters are automatically stored for the widget instance.",
						params		: { 
							'instance' : 'the widget instance', 
							'return  ' : 'true or nothing (default).\nReturns false if widget is should open the configuration dialog immediately after creation.'},
						code		: "//define default widget parameter myvalue\n$instance->myvalue = 'my default value';"
					},	
					destroy				: {
						description : "destroy() be called when the widget gets destroyed.\ndestroy can be used to cleanup custom instance related data in databases/files etc.",
						params		: { 'instance' : 'the widget instance'},
						code		: "// your code here"
					}		
				},
				resources		: {
					styles  	: [ options.baseUrl + 'wizard.css'],
					scripts 	: function() {
						var basepath = options.baseUrl + 'jquery-syntax/';
						return $.getScript( basepath + "jquery.syntax.min.js").done( function () {
								// preload syntax highlighter
				            $.syntax({root: basepath});
								// dummy highlighting to force php brushes loaded		
							$('body').syntax({brush: 'php'},$.noop);
				        });
					},
					templates	: [
					    options.baseUrl + 'wizard.tmpl',
					    function() {
					    	var module = this;
					    	var ensure = $.ampere.util.ensure( $.ampere.ensure.namespace + '(' + module.defaults.name + ')'); 
					    	var deferred = $.ajax({
								url 	 : options.baseUrl + 'sources.tmpl',
								dataType : 'html',
								cache 	 : !$.ampere.options.debug,
								success  : function( data, textStatus, XMLHttpRequest) {
									var e = $( data);
									ensure( e.length, 'could not transform data to html : ', data);
									e.appendTo( 'head');
									
									var obj = {};
									var sources = $( 'head script[type="text/x-source-tmpl"]');
									sources.each( function() {
										ensure( this.id, 'no id given');
										var t = $(this).text();
											// remove trailing '<!--' and '-->'
										t = t.replace( /^\s*(<!--)|(-->)\s*$/g, '');
											// tmpl removes \n so we are forced to replace \n to restore it later on
										t = t.replace( /\n/mg, '\\n').replace( /\t/mg, '\\t');
										t = $.template( null, t);
										
										obj[ this.id/*.replace( /(.*)_(\w+)$/, '$1.$2')*/] = function( options) {
											var encode = $.encode;
											$.encode = function( s) { return s;};
											
											var source = t.call( this, jQuery, { data : { module : this, options : options}}).join( '');
											source = $.trim( source.replace( /\\n/mg, '\n').replace( /\\t/mg, '\t'));
											
											source = source.replace( /\n(( |\t)|\n)+\n/mg, '\n\n');		
											$.encode = encode;
											
											return source;
										};
									});
									
									module.defaults.generators = obj;
								}
							});
					    	
					    	return deferred;
						}
					]
				}
			}, options));
		});
	},
	{
		depends : 'ampere'
	}
);
