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
        js: 'www/dist/js',
        css: 'www/dist/css',
        img: 'www/dist/img'
      }
    },
    
    js_lib: [
      '<%= dir.src.jslib %>/modernizr-2.6.2.min.js',
      '<%= dir.src.jslib %>/jquery-1.10.2.min.js',
      '<%= dir.src.jslib %>/bootstrap.min.js'
    ],
    
    // Minify, for the user's sake
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

    // Concat libraries
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

    // Clean CSS
    sass: {
      // Dev
      dev: {
        options: { style: 'expanded' },
        files: { '<%= dir.dist.css %>/lilfrog.css' : '<%= dir.src.sass %>/lilfrog.scss' }
      },
      dist: {
        options: { style: 'compressed' },
        files: { '<%= dir.dist.css %>/lilfrog.css' : '<%= dir.src.sass %>/lilfrog.scss' }
      }      
    },
    
    // Monitoring for Development
    watch: {
      files: ['<%= dir.src.js %>/**', '<%= dir.src.sass %>/**'],
      tasks: ['concat:dev', 'sass:dev'],
      options: { }
    },
    
    // Copy images
    copy: {
      main: {
        cwd: '<%= dir.src.img %>/',
        expand: true, 
        src: '**', 
        dest: '<%= dir.dist.img %>/', 
        filter: 'isFile'
      }
    }
    
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-ftpush');
  grunt.registerTask('default', ['uglify']);
  grunt.registerTask('dev', ['copy', 'concat:dev', 'sass:dev', 'watch']);
  grunt.registerTask('dist', ['copy', 'concat:dist', 'uglify:dist', 'sass:dist', 'ftp_push:dist']);
};
