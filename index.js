
/**
 * Module dependencies.
 */

var debug = require('debug')('co-read');

/**
 * Expose `read`.
 */

module.exports = read;

/**
 * Read from a readable `stream`.
 *
 * @param {Stream} stream
 * @return {Function}
 */

function read(stream) {
  return typeof stream.read == 'function'
    ? read2(stream)
    : read1(stream);
}

/**
 * Read from a readable streams1 `stream`.
 *
 * @param {Stream} stream
 * @return {Function}
 */

function read1(stream) {
  stream.pause();

  return function(done) {
    if (!stream.readable) {
      debug('not readable, all done');
      return done();
    }

    debug('waiting for data, error or end');
    stream.on('data', ondata);
    stream.on('error', onerror);
    stream.on('end', onend);

    debug('resuming');
    stream.resume();

    function ondata(data) {
      debug('read %sb', data.length);
      debug('pausing');
      stream.pause();
      cleanup();
      done(null, data);
    }

    function onerror(err) {
      debug('error %s', err);
      cleanup();
      done(err);
    }

    function onend(data) {
      debug('ended');
      cleanup();
      done(null, data);
    }

    function cleanup() {
      stream.removeListener('data', ondata);
      stream.removeListener('error', onerror);
      stream.removeListener('end', onend);
    }
  }
}

/**
 * Read from a readable streams2 `stream`.
 *
 * @param {Stream} stream
 * @return {Function}
 */

function read2(stream) {
  return function(done) {
    if (!stream.readable) {
      debug('not readable, all done');
      return done();
    }

    function onreadable() {
      debug('readable');
      cleanup();
      check();
    }

    function onend() {
      debug('ended');
      cleanup();
      done(null, null);
    }

    function onerror(err) {
      debug('got error %j', err);
      cleanup();
      done(err);
    }

    function listen() {
      debug('waiting for readable, end or error');
      stream.on('readable', onreadable);
      stream.on('end', onend);
      stream.on('error', onerror);
    }

    function cleanup() {
      stream.removeListener('readable', onreadable);
      stream.removeListener('end', onend);
      stream.removeListener('error', onerror);
    }

    function check() {
      var buf = stream.read();
      if (buf) {
        debug('read %sb', buf.length);
        done(null, buf);
      } else {
        debug('read -');
        listen();
      }
    }

    check();
  };
}
