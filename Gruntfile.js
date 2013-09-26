module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    // base directories
    dir: {
      src: {
        js:     'src/js',
        jslib:  'src/js/lib',
        sass:   'src/sass',
        img:    'src/img'
      },
      dist: {
        js: 'dist/js',
        css: 'dist/css',
        img: 'dist/img'
      }
    },
    
    js_lib: [
      '<%= dir.src.jslib %>/modernizr-2.6.2.min.js',
      '<%= dir.src.jslib %>/jquery-1.10.2.min.js',
      '<%= dir.src.jslib %>/bootstrap.min.js'
    ],
    
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      dist: {
        files: {
          '<%= dir.dist.js %>/lilfrog.js': ['src/js/lilfrog.js', 'src/js/activities/*.js']
        }
      }
    },

    concat: {
      options: { separator: ';' },
      dev: {
        // the files to concatenate
        files: {
          '<%= dir.dist.js %>/lilfrog.js' : ['src/js/lilfrog.js', 'src/js/activities/*.js'],
          '<%= dir.dist.js %>/lilfrog.lib.js' : [
            '<%= dir.src.jslib %>/modernizr-2.6.2.min.js',
            '<%= dir.src.jslib %>/jquery-1.10.2.min.js',
            '<%= dir.src.jslib %>/bootstrap.min.js'
          ]
        }
      },
      dist: {
        // the files to concatenate
        files: {
          '<%= dir.dist.js %>/lilfrog.lib.js' : [
            '<%= dir.src.jslib %>/modernizr-2.6.2.min.js',
            '<%= dir.src.jslib %>/jquery-1.10.2.min.js',
            '<%= dir.src.jslib %>/bootstrap.min.js'
          ]
        }
      }
    },

    sass: {
      // Dev
      dev: {
        options: { style: 'expanded' },
        files: { '<%= dir.dist.css %>/lilfrog.css' : 'src/sass/lilfrog.scss' }
      },
      dist: {
        options: { style: 'compressed' },
        files: { '<%= dir.dist.css %>/lilfrog.css' : 'src/sass/lilfrog.scss' }
      }      
    },
    
    watch: {
      files: ['src/js/**.js', 'src/sass/**.scss'],
      tasks: ['concat:dev', 'sass:dev'],
      options: { }
    }  

  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['uglify']);
  grunt.registerTask('dev', ['concat:dev', 'sass:dev', 'watch']);
  grunt.registerTask('dist', ['concat:dist', 'uglify:dist', 'sass:dist']);
};
