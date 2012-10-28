/*global module:false*/
module.exports = function(grunt) {
	var js = {
		libs  : [
			'jquery-1.8.2.js',
			'bootstrap-2.1.1/js/bootstrap.min.js',
			'jquery.sortable.js',
			'datepicker/js/bootstrap-datepicker.js',
			'colorpicker/js/bootstrap-colorpicker.js',

			'angular/angular-1.0.1.min.js',
			'angular/angular-cookies-1.0.1.min.js',
			'angular/angular-loader-1.0.1.min.js',
			'angular/angular-resource-1.0.1.min.js'
		].map( function( item) {
		return 'libs/' + item;
	}),
	src  : [
		'compat.js',
		'json.js',
		'namespace.js',
		'entity.js',
		'jquery.upload.js',
		'ampere.js',
		'ampere-util.js',
		'ampere-ui-twitterbootstrap.js',
		'ampere-ui-hotkey.js'
		 ].map( function( item) {
				 return 'src/' + item;
		 })
	};

	// Project configuration.
	grunt.initConfig({
		pkg: '<json:jquery.orangevolt-ampere.jquery.json>',
		meta: {
			banner: '/*!\n' +
				' * <%= pkg.title || pkg.name %>\n *\n' +
				' * version : <%= pkg.version %>\n' +
				' * created : <%= grunt.template.today("yyyy-mm-dd") %>\n' +
				' * source  : <%= pkg.homepage %>\n *\n' +
				' * author  : <%= pkg.author.name %> (<%= pkg.author.email %>)\n' +
				' * homepage: <%= pkg.author.url %>\n' +
				' *\n' +
				' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
				' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n */'
		},
		/*
		qunit: {
				files: []
		},
		*/
		jasmine: {
			all: {
				src : [ 'test/index.html'],
				errorReporting: true
			}
		},
		lint: {
			files: [
				'grunt.js', 'src/**/*.js', 'test/**/*.js'
			]
		},
		clean: ['dist'],
		copy : {
				debug : {
						files : {
							'dist/debug/libs/' : 'libs/*.js',
							'dist/debug/libs/angular/' : 'libs/angular/**/*.min.*',
							'dist/debug/libs/Font-Awesome/' : [ 'libs/Font-Awesome/css/**', 'libs/Font-Awesome/font/*'],
							'dist/debug/libs/bootstrap-2.1.1/' : 'libs/bootstrap-2.1.1/**/*.min.*',
							'dist/debug/libs/colorpicker/' : ['libs/colorpicker/css/**', 'libs/colorpicker/js/**', 'libs/colorpicker/img/**'],
							'dist/debug/libs/datepicker/' : ['libs/datepicker/css/**', 'libs/datepicker/js/**'],
							'dist/debug/' : js.src
						}
				},
				min : {
						files : {
							'dist/min/libs/' : 'dist/debug/libs/**/*'
						}
				}
		},
		less: {
				debug : {
					options : {
						paths: ["src"],
						compress : false
					},
					files: {
						"dist/debug/ampere-ui-twitterbootstrap.css" : "src/ampere-ui-twitterbootstrap.css",
						"dist/debug/ampere-ui-twitterbootstrap.less.css" : "src/ampere-ui-twitterbootstrap.less"
					}
				},
		min : {
					options : {
						paths: ["src"],
						compress : true
					},
			files: {
				"dist/min/<%= pkg.name %>.min.css" : [
					"src/ampere-ui-twitterbootstrap.css",
					"src/ampere-ui-twitterbootstrap.less"
				]
			}
		}
	},
	/*
		concat: {
			min: {
				src: [
						'<banner:meta.banner>',
						'dist/min/<%= pkg.name %>.min.css'
				],
				dest: 'dist/min/<%= pkg.name %>.min.css'
			}
		},
		*/
		min: {
			min: {
				src: [ /* '<banner:meta.banner>', */ js.src],
				dest: 'dist/min/<%= pkg.name %>.min.js'
			}
		},
		watch: {
			files: '<config:lint.files>',
			tasks: 'default'
		},
		jshint: {
			options: {
				smarttabs:true,
				curly: true,
				eqeqeq: false,
				immed: false,
				latedef: true,
				newcap: false,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true,
				browser: true,
				expr : true,
				multistr:true,
				debug   : true,
				nonew   : true,
				jQuery  : true,
				evil : true /* otherwise document.write is prohibited */
			},
			globals: {
				jQuery  : true,
				require : true,
				console : true,
				angular : true,
					// this is for jasmine tests to be "lintable"
				describe : true,
				it	     : true,
				expect   : true
			}
		},
		uglify: {
			mangle: {
				except: [ 'Ampere', 'Module', 'Transition', 'State', 'View', 'History', 'Options', 'Ui', 'UiController', 'Entity']
			}
		}
	});

			// some dist debug specific operations
	grunt.registerTask( 'finish',  'Custom build finish build (adding banners, generate oval.js version, etc).', function() {
		var banner = grunt.helper( 'banner');

			// read templates
		var path = require('path');
		var ampere_templates = {};
		grunt.file.expandFiles( 'src/*.tmpl').forEach( function( item) {
			var basename = path.basename( item);
			var content = grunt.file.read( item);
			ampere_templates[ basename] = content;
		});

				// generate debug version of oval.js
		var _ = require( 'underscore');
		var oval_js = _.template( grunt.file.read( 'etc/oval.js.template'));
		grunt.file.write(
			'dist/debug/oval.js',
			oval_js({
				css		: [
					'libs/bootstrap-2.1.1/css/bootstrap.min.css',
					'libs/bootstrap-2.1.1/css/bootstrap-responsive.min.css',
					'libs/Font-Awesome/css/font-awesome.css',
					'libs/colorpicker/css/colorpicker.css',
					'libs/datepicker/css/datepicker.css',
					'ampere-ui-twitterbootstrap.css',
					'ampere-ui-twitterbootstrap.less.css'
				],
				less	: [],
					js : [
						'libs/coffeescript-1.3.3.js',
						'libs/lesscss-1.3.0.js'
					]
					.concat( js.libs)
					.concat(
						js.src.map( function( item) {
							return path.basename( item);
						})
					),
					templates : ampere_templates,
					scripts   : []
				})
		);

			// generate oval.js for min
		grunt.file.write(
			'dist/min/oval.js',
			oval_js({
				css       : [
					'libs/bootstrap-2.1.1/css/bootstrap.min.css',
					'libs/bootstrap-2.1.1/css/bootstrap-responsive.min.css',
					'libs/Font-Awesome/css/font-awesome.css',
					'libs/colorpicker/css/colorpicker.css',
					'libs/datepicker/css/datepicker.css',
					grunt.config( 'pkg.name') + '.min.css'
				],
				less      : [],
				js         : [
					'libs/coffeescript-1.3.3.js',
					'libs/lesscss-1.3.0.js'
					]
					.concat( js.libs)
					.concat([
						 grunt.config( 'pkg.name') + '.min.js'
					]
				),
				templates : ampere_templates,
					scripts   : [
						"\t/* disable console debug output */\n\
$.ov.namespace.filter = function( severity, namespace) { return severity!='debug'; };"
					]
				})
		);

			// prepend banner to debug sources
		grunt.file.expandFiles( 'dist/debug/*')
		.concat( grunt.file.expandFiles( 'dist/min/*'))
		.forEach( function( item) {
				// Concat specified files.
			var src = banner + grunt.helper( 'concat', [ '<file_strip_banner:' + item + '>']);
			grunt.file.write( item, src);

				// Fail task if errors were logged.
			if( this.errorCount) { return false; }

				// Otherwise, print a success message.
				grunt.log.writeln('Prepended banner to "' + item + '"');
		});
	});

		// Redefining the "server" task for this project. Note that the output
		// displayed by --help will reflect the new task description.
	grunt.registerTask('server', 'Start a custom static web server.', function() {
			// without aquiring the async lock
			// grunt would immediately exit after executing server.js
		var done = this.async();
		require( './server');
	});

		// Default task.
	grunt.registerTask( 'default', 'clean lint jasmine copy less min finish');

	grunt.loadNpmTasks('grunt-contrib');
	grunt.loadNpmTasks('grunt-jasmine-task');
};
