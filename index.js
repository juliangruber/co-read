
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
    if (!stream.readable) return done();

    stream.on('data', ondata);
    stream.on('error', onerror);
    stream.on('end', onend);
    stream.resume();

    function ondata(data) {
      stream.pause();
      cleanup();
      done(null, data);
    }

    function onerror(err) {
      cleanup();
      done(err);
    }

    function onend(data) {
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
      return done();
    }

    function onreadable() {
      cleanup();
      check();
    }

    function onend() {
      cleanup();
      done(null, null);
    }

    function onerror(err) {
      cleanup();
      done(err);
    }

    function listen() {
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
        done(null, buf);
      } else {
        listen();
      }
    }

    check();
  };
}
