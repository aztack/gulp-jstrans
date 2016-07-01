var through = require('through2');
var gutil = require('gulp-util');
var UglifyJS = require('uglifyjs');
var PluginError = gutil.PluginError;

// function prefixStream(prefixText) {
//     var stream = through();
//     stream.write(prefixText);
//     return stream;
// }

function codetrans(before, options) {
    var options = options || {};
    options.comments = function(){
        return true;
    };
    return through.obj(function(file, enc, cb) {
        if (file.isNull()) {
            return cb(null, file);
        }
        var code = file.contents.toString();
        var transformer = new UglifyJS.TreeTransformer(function(node, descend){
            before(node, UglifyJS, {
                code: code,
                file: file
            });
            descend(node, this);
            return node;
        });
        
        if (file.isBuffer()) {
            var ast = UglifyJS.parse(code);
            ast.transform(transformer);
            file.contents = new Buffer(ast.print_to_string(options));
        }
        // if (file.isStream()) {
        //     file.contents = file.contents.pipe(prefixStream(prefixText));
        // }

        cb(null, file);
    });
}

module.exports = codetrans;
