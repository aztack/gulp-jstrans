var gulp = require('gulp');
var rename = require('gulp-rename');
var crypto = require('crypto');
var jstrans = require('./index.js');

function md5sum(str) {
  var fakeData = new Date().getTime().toString();
  return crypto.createHash('md5').update(fakeData).digest("hex");
}

gulp.task('default', function(){
  gulp.src('./examples/sample.js')
    .pipe(jstrans(function(node, UglifyJS, data){
      /**
       * function call, function name is '$modal'
       */
      if (node instanceof UglifyJS.AST_Call && node.expression.name == '$modal'){
        /**
         * only one arguments and is an object with more than one key
         */
        if (node.args.length === 1 && node.args[0].properties.length > 0) {
          node.args[0].properties.forEach(function(prop){
            var filepath = prop.value.value;
            /**
             * append md5 of js code to url if key is 'template'
             */
            if (prop.key === 'template') {
              if (prop.value instanceof UglifyJS.AST_String && prop.value.value.match(/\.html$/)) {
                console.log("found " + filepath);
                if (filepath.indexOf('?v=') > 0) return;
                prop.value.value += "?v=" + md5sum(data.code).substr(0,6);
              } else {
                console.log("template url is not a url but `" + prop.value.print_to_string() + "`")
              }
            }
          });
        } else {
          console.log('Call $modal without template name?');
        }
      }
    }, {
      beautify: true
    })).pipe(rename('./examples/sample.trans.js')).pipe(gulp.dest('.'));
});
