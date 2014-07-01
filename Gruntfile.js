'use strict';


module.exports = function (grunt) {
  require('time-grunt')(grunt);

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');


  grunt.initConfig({


    less: {
      development: {
        files: {
          "public/css/main.css": "less/main.less"
        }
      },
      production: {
        options: {
          compress: true
        },
        files: {
          "public/css/main.min.css": "less/main.less"
        }
      }
    },

    watch: {
      css: {
        files: 'less/*',
        tasks: ['less']
      }
    },

  });


  grunt.registerTask('default', ['less']);
};
