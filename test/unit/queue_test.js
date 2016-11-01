require('../test_helper');

const Queue = require('../../app/queue');

describe('Queue', () => {
  describe('#start', () => {
    it('should fill the `current` and `playlist` fields', () => {
      Queue.start('foo', 'bar');

      assert.equal(Queue.current, 'foo');
    });

    it('should not set any mode', () => {
      Queue.start('foo', 'bar');

      assert.equal(Queue.mode, undefined);
    });
  });

  describe('#setMode', () => {
    it('should change the current mode', () => {
      Queue.setMode('random');

      assert.equal(Queue.mode, 'random');
    });
  });

  describe('#next', () => {
    var current, playlist;

    describe('in normal mode', () => {
      beforeEach(() => {
        Queue.setMode();

        current       = new Record(null);
        next          = new Record('foo');
        playlist      = new Record(null);
        next_playlist = new Record(null);

        next_playlist.items = [new Record('bar')];
        playlist.next       = next_playlist;
        current.set         = playlist;
      });

      it('should return the next record if it is present', () => {
        current.next = next;
        Queue.start(current, playlist);

        assert.equal(current.next.id, next.id);

        return Queue.next().then((record) => {
          assert.equal(record.id, next.id);
        });
      });

      it('should return the first record of the next playlist', () => {
        Queue.start(current, playlist);

        assert.equal(current.next, null);

        return Queue.next().then((record) => {
          assert.equal(record.id, next_playlist.items.first().id);
        });
      });

      it('should return an empty set with no neighbors nor playlist', () => {
        Queue.start(next);

        return Queue.next().then((record) => {
          assert.equal(record, null);
        });
      });
    });

    describe('in loop mode', () => {
      var first, second, playlist;

      beforeEach(() => {
        Queue.setMode('loop');

        first  = new Record('first');
        second = new Record('second');

        first.next      = second;
        second.previous = first;

        playlist       = new Record(null);
        playlist.items = [first, second];
        first.set      = playlist;
        second.set     = playlist;
      });

      it('should return the next record if it is present', () => {
        Queue.start(first, playlist);

        return Queue.next().then((record) => {
          assert.equal(record.id, second.id);
        });
      });

      it('should return the first track of the playlist otherwise', () => {
        Queue.start(second, playlist);

        return Queue.next().then((record) => {
          assert.equal(record.id, first.id);
        });
      });
    });

    describe('in random mode', () => {
      var first, second, third, fourth, playlist;

      beforeEach(() => {
        Queue.setMode('random');

        first  = new Record(1);
        second = new Record(2);

        playlist       = new Record(null);
        playlist.items = [new Record('foo'), new Record('bar'), new Record('baz')];

        [first, second].forEach(Record.link);
        [first, second].forEach(e => e.set = playlist);
      });

      it('should return a random track from the playlist', () => {
        Queue.start(second, playlist);

        return Queue.next().then((record) => {
          assert(['foo', 'bar', 'baz'].includes(record.id));
          assert.equal([1, 2, 3, 4].includes(record.id), false);
        });
      });
    });
  });

  describe('#previous', () => {
    var current, playlist;

    describe('in normal mode', () => {
      beforeEach(() => {
        Queue.setMode();

        current           = new Record(null);
        previous          = new Record('foo');
        playlist          = new Record(null);
        previous_playlist = new Record(null);

        previous_playlist.items = [new Record('bar')];
        playlist.previous       = previous_playlist;
        current.set             = playlist;
      });

      it('should return the previous record if it is present', () => {
        current.previous = previous;
        Queue.start(current, playlist);

        assert.equal(current.previous.id, previous.id);

        return Queue.previous().then((record) => {
          assert.equal(record.id, next.id);
        });
      });

      it('should return the first record of the previous playlist', () => {
        Queue.start(current, playlist);

        assert.equal(current.previous, null);

        return Queue.previous().then((record) => {
          assert.equal(record.id, previous_playlist.items[0].id);
        });
      });

      it('should return an empty set with no neighbors nor playlist', () => {
        Queue.start(previous);

        return Queue.previous().then((record) => {
          assert.equal(record, null);
        });
      });
    });

    describe('in loop mode', () => {
      var first, second, playlist;

      beforeEach(() => {
        Queue.setMode('loop');

        first  = new Record('first');
        second = new Record('second');
        third  = new Record('third');

        second.previous = first;
        third.previous  = second;

        playlist       = new Record(null);
        playlist.items = [first, second, third];
        first.set      = playlist;
        second.set     = playlist;
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
          assert.equal(record.id, third.id);
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
