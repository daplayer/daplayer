require('../test_helper');

const Queue = require('../../app/queue');

describe('Queue', () => {
  beforeEach(() => {
    Cache.initialize();

    Cache.playing.context = {
      collection: [{id: 'foo'}, {id: 'bar'}, {id: 'baz'}]
    }
  });

  describe('#start', () => {
    it('should fill the `current` field', () => {
      Queue.start('foo');

      assert.equal(Queue.current, 'foo');
    });

    it('should automatically fill the `queue` attribute', () => {
      Queue.start();

      assert.deepEqual(Queue.queue, Cache.playing.context.collection);
    });

    it('should not set any mode', () => {
      Queue.start();

      assert.equal(Queue.mode, undefined);
    });

    it('should pick the context as a collection if it is an array', () => {
      Cache.playing.context = [1, 2, 3]

      Queue.start()

      assert.deepEqual(Queue.queue, Cache.playing.context)
    })
  });

  describe('#setMode', () => {
    it('should change the current mode', () => {
      Queue.setMode('loop');

      assert.equal(Queue.mode, 'loop');
    });
  });

  describe('#next', () => {
    describe('in normal mode', () => {
      beforeEach(() => {
        Queue.setMode();
      });

      it('should return the next record in the queue', () => {
        Queue.start({id: 'bar'});

        return Queue.next().then((record) => {
          assert.equal(record.id, 'baz');
        });
      });

      it('should return null if we are at the end of the queue', () => {
        Queue.start({id: 'baz'});

        return Queue.next().then((record) => {
          assert.equal(record, null);
        });
      });
    });

    describe('in loop mode', () => {
      var first, last;

      beforeEach(() => {
        Queue.setMode('loop');

        var set = {items: [{id: 'foo'}, {id: 'bar'}, {id: 'baz'}]};

        first = new Record('foo');
        last  = new Record('baz');

        first.set = set;
        last.set  = set;
      });

      it('should return the next record if it is present', () => {
        Queue.start(first);

        return Queue.next().then((record) => {
          assert.equal(record.id, 'bar');
        });
      });

      it('should return the first track of the playlist otherwise', () => {
        Queue.start(last);

        return Queue.next().then((record) => {
          assert.equal(record.id, first.id);
        });
      });
    });
  });

  describe('#previous', () => {
    describe('in normal mode', () => {
      beforeEach(() => {
        Queue.setMode();
      });

      it('should return the previous record if it is present', () => {
        Queue.start({id: 'bar'});

        return Queue.previous().then((record) => {
          assert.equal(record.id, 'foo');
        });
      });

      it('should return null if we are at the beginning of the queue', () => {
        Queue.start({id: 'foo'});

        return Queue.previous().then((record) => {
          assert.equal(record, null);
        });
      });
    });

    describe('in loop mode', () => {
      var first, second;

      beforeEach(() => {
        Queue.setMode('loop');

        var set = {items: [{id: 'foo'}, {id: 'bar'}, {id: 'baz'}]};

        first  = new Record('foo');
        second = new Record('bar');

        first.set  = set;
        second.set = set;
      });

      it('should return the previous record if it is present', () => {
        Queue.start(second);

        return Queue.previous().then((record) => {
          assert.equal(record.id, first.id);
        });
      });

      it('should return the last track of the playlist otherwise', () => {
        Queue.start(first);

        return Queue.previous().then((record) => {
          assert.equal(record.id, 'baz');
        });
      });
    });

    describe('in random mode', () => {
      beforeEach(() => {
        Queue.setMode('random');
        Queue.history.push(new Record('foo'));
      });

      it('should return the last track from history', () => {
        return Queue.previous().then((record) => {
          assert.equal(record.id, 'foo');
        });
      });
    });
  });
});
