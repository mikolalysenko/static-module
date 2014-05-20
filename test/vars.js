var test = require('tape');
var concat = require('concat-stream');
var quote = require('quote-stream');
var staticModule = require('../');
var fs = require('fs');
var path = require('path');

test('multi-vars', function (t) {
    t.plan(2);
    
    var expected = [ 'beep boop!' ];
    var sm = staticModule({
        fs: {
            readFileSync: function (file, enc) {
                return fs.createReadStream(file).pipe(quote());
            }
        }
    }, { vars: { __dirname: path.join(__dirname, 'mixed') } });
    
    readStream('source.js').pipe(sm).pipe(concat(function (body) {
        Function(['console'],body)({ log: log });
        t.equal(
            body.toString('utf8'),
            'var html = "beep boop!"\nconsole.log(html);\n'
        );
        function log (msg) { t.equal(msg, expected.shift()) }
    }));
});

function readStream (file) {
    return fs.createReadStream(path.join(__dirname, 'vars', file));
}
