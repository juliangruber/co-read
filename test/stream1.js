var test = require('tape');
var read = require('..');
var co = require('co');
var through = require('through');

test('stream1: read', function(t) {
  var times = 3;
  t.plan(2 + times);

  co(function*() {
    var stream = through();

    process.nextTick(function() {
      (function next() {
        stream.queue('foo');
        if (--times) setTimeout(next, 10);
        else stream.end();
      })();
    });

    var chunk;
    while (chunk = yield read(stream)) {
      t.equal(chunk, 'foo', 'data event');
    }

    t.ok(true, 'ended');
  }, t.error.bind(t));
});

test('stream1: error', function(t) {
  t.plan(2);

  co(function*() {
    var stream = through();

    process.nextTick(function() {
      stream.emit('error', new Error('bad'));
    });

    try {
      yield read(stream);
    } catch(err) {
      t.ok(err);
    }
  }, t.error.bind(t));
});

