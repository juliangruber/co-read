var Readable = require('stream').Readable;
var through = require('through');
var assert = require('assert');
var equal = assert.equal;
var wait = require('co-wait');
var read = require('./');
var co = require('co');

describe('read(stream)', function(){
  describe('push streams', function(){
    it('should read', function(done){
      var stream = through();
      
      co(function*() {
        equal(yield read(stream), 'foo');
        equal(yield read(stream), 'bar');
        equal(yield read(stream), undefined);
      }, done);
      
      co(function*(){
        stream.queue('foo');
        stream.queue('bar');
        stream.queue(null);
      })();
    });
    
    it('should throw errors', function(done){
      var stream = through();
      
      co(function*() {
        yield read(stream);
      }, function(err){
        assert(err);
        done();
      });
      
      co(function*(){
        stream.emit('error', new Error);
      })();
    });
    
    it('should handle backpressure', function(done){
      var stream = through();
      
      co(function*() {
        equal(yield read(stream), 'foo');
        equal(yield read(stream), 'bar');
        equal(yield read(stream), undefined);
      }, done);
      
      co(function*(){
        yield wait();
        stream.queue('foo');
        yield wait();
        stream.queue('bar');
        yield wait();
        stream.queue(null);
      })();
    });
  });
  
  describe('pull streams', function(){
    it('should read', function(done){
      var times = 3;
      
      co(function*(){
        var stream = Readable();
        stream._read = function(){
          if (!times--) return stream.push(null);
          setTimeout(function() {
            stream.push('foo');
          });
        };
        
        equal(yield read(stream), 'foo');
        equal(yield read(stream), 'foo');
        equal(yield read(stream), 'foo');
        equal(yield read(stream), null);
      })(done);
    });
    
    it('should read', function(done){
      var times = 2;
      
      co(function*(){
        var stream = Readable();
        stream._read = function(){
          setTimeout(function() {
            if (times-- > 0) {
              stream.push('foo');
              stream.push('bar');
            } else {
              stream.push(null);
            }
          });
        };
        
        equal(yield read(stream), 'foo');
        equal(yield read(stream), 'bar');
        equal(yield read(stream), 'foo');
        equal(yield read(stream), 'bar');
        equal(yield read(stream), null);
      })(done);
    });
    
    it('should end', function(done){
      co(function*() {
        var stream = Readable();
        stream.push(null);
        
        equal(yield read(stream), null);
        equal(yield read(stream), null);
      }, done);
    });
    
    it('should throw', function(done){
      co(function*(){
        var stream = Readable();
        stream._read = function() {
          stream.emit('error', new Error);
        };
        
        yield read(stream);
      }, function(err){
        assert(err);
        done();
      });
    });
  });
});