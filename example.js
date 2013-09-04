var http = require('http');
var co = require('co');
var read = require('./');

co(function*() {
  var res = yield request('http://google.com/');
  var buf;
  while(buf = yield read(res)) {
    console.log(buf.toString());
  }
});

function request(url) {
  return function(done) {
    var req = http.get(url)
    req.on('response', function(res) {
      done(null, res);
    });
    req.on('error', function(err) {
      done(err);
    });
  }
}

