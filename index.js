var read = require('stream-read');

module.exports = function(stream){
  if (typeof stream.read != 'function') stream.pause();
  return function(done){
    read(stream, done);
  };
};
