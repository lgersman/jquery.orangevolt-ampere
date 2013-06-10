/*global module:false*/
module.exports = function(grunt) {
	var js = {
		libs  : [
			'jquery-2.0.0.js',
			'jquery-ui-sortable-1.10.3/jquery-ui-1.10.3.custom.min.js',
			'bootstrap-2.3.2/js/bootstrap.min.js',
			//'jquery.sortable.js',
			'datepicker/js/bootstrap-datepicker.js',
			'cache.js',

			'angular-1.1.4/angular.min.js',
			'angular-1.1.4/angular-cookies.min.js',
			'angular-1.1.4/angular-loader.min.js',
			'angular-1.1.4/angular-resource.min.js'
		].map( function( item) {
		return 'libs/' + item;
	}),
	src  : [
		'compat.js',
		'json.js',
		'namespace.js',
		'entity.js',
		'jquery.upload.js',
		'jquery.html5validation.js',
		'ampere.js',
		'ampere-util.js',
		'ampere-crud.js',
		'ampere-ui-twitterbootstrap.js',
		'ampere-ui-hotkey.js'
		].map( function( item) {
			return 'src/' + item;
		})
	};

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON("jquery.orangevolt-ampere.jquery.json"),
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
				jquery  : true,
				evil : true, /* otherwise document.write is prohibited */
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
			all: [ 'grunt.js', 'src/**/*.js', 'test/**/*.js']
		},
		clean: ['dist'],
		copy : {
			debug : {
				files : [
					{ dest: 'dist/debug/', src : [
						'libs/*.js', 
						'libs/angular-1.1.4/**/*.min.*',
						'libs/font-awesome-3.1.1/css/**', 
						'libs/font-awesome-3.1.1/font/*',
						'libs/bootstrap-2.3.2/**/*.min.*',
						'libs/jquery-ui-sortable-1.10.0/**/*.min.*',
						'libs/datepicker/css/**', 'libs/datepicker/js/**'
					]},
					{ dest: 'dist/debug/', expand : true, flatten:true, src : [ js.src]}
				]
			},
			min : {
				files : [
					{ dest: 'dist/min/libs/', expand: true, cwd:'dist/debug/libs/', src : ['**/*']}
				]
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
			}
		},
		cssmin : {
			min : {
				options : {
					paths: ["src"],
					compress : true
				},
				files: {
					"dist/min/<%= pkg.name %>.min.css" : [
						"dist/debug/ampere-ui-twitterbootstrap.css",
						"dist/debug/ampere-ui-twitterbootstrap.less.css"
					]
				}
			}
		},
		watch: {
			files: [ js.src, 'test/*.js'],
			tasks: ['default']
		},
		uglify: {
			min: {
				options : {
					mangle: {
						except: [ 'Ampere', 'Module', 'Transition', 'State', 'View', 'History', 'Options', 'Ui', 'UiController', 'Component', 'Entity', 'Projection', 'CachePriority', 'Cache']
					}
				},	
				src: [ /* '<banner:meta.banner>', */ js.src],
				dest: 'dist/min/<%= pkg.name %>.min.js',
			}
		}
	});

			// some dist debug specific operations
	grunt.registerTask( 'finish',  'Custom build finish build (adding banners, generate oval.js version, etc).', function() {
			// read templates
		var path = require('path');
		var ampere_templates = {};
		//grunt.file.expandFiles( 'src/*.tmpl').forEach( function( item) {
		grunt.file.expand( 'src/*.tmpl').forEach( function( item) {
			var basename = path.basename( item);
			var content = grunt.file.read( item);
			ampere_templates[ basename] = content;
		});

		var banner = grunt.config( 'meta.banner');

				// generate debug version of oval.js
		var _ = require( 'underscore');
		var oval_js = _.template( grunt.file.read( 'etc/oval.js.template'));
		grunt.file.write(
			'dist/debug/oval.js',
			oval_js({
				banner    : banner,
				css		: [
					'libs/bootstrap-2.3.2/css/bootstrap.min.css',
					'libs/bootstrap-2.3.2/css/bootstrap-responsive.min.css',
					'libs/font-awesome-3.1.1/css/font-awesome.css',
					'libs/datepicker/css/datepicker.css',
					'ampere-ui-twitterbootstrap.css',
					'ampere-ui-twitterbootstrap.less.css'
				],
				less	: [],
					js : [
						'libs/coffeescript-1.3.3.js',
						'libs/lesscss-1.3.3.js'
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
				banner    : banner,
				css       : [
					'libs/bootstrap-2.3.2/css/bootstrap.min.css',
					'libs/bootstrap-2.3.2/css/bootstrap-responsive.min.css',
					'libs/font-awesome-3.1.1/css/font-awesome.css',
					'libs/datepicker/css/datepicker.css',
					grunt.config( 'pkg.name') + '.min.css'
				],
				less      : [],
				js         : [
					'libs/coffeescript-1.3.3.js',
					'libs/lesscss-1.3.3.js'
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
		
		//grunt.file.expandFiles( 'dist/debug/*')
		grunt.file.expand( 'dist/debug/*')
		//.concat( grunt.file.expandFiles( 'dist/min/*'))
		.concat( grunt.file.expand('dist/min/*'))
		.filter( function( item) {
			return grunt.file.isFile( item);
		})
		.forEach( function( item) {
			var src = banner + grunt.file.read( item).replace( /\/\*[\s\S]*?\*\//, '');
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
		require( './server.js');
	});

		// Default task.
	grunt.registerTask( 'default', ['clean', 'jshint', 'jasmine', 'copy', 'less', 'cssmin', 'uglify', 'finish']);

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
};
