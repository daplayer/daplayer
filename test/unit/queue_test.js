require('../test_helper');

const Queue = require('../../app/queue');

describe('Queue', () => {
  describe('#start', () => {
    it('should fill the `current` and `playlist` fields', () => {
      Queue.start('foo', 'bar');

      assert.equal(Queue.current,  'foo');
      assert.equal(Queue.playlist, 'bar');
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
        playlist.next        = next_playlist;
      });

      it('should return the next record if it is present', () => {
        current.next = next;
        Queue.start(current, playlist);

        assert.equal(current.next.id, next.id);

        return Queue.next().then((set) => {
          assert.equal(set[0].id, next.id);
        });
      });

      it('should return the first record of the next playlist', () => {
        Queue.start(current, playlist);

        assert.equal(current.next, null);

        return Queue.next().then((set) => {
          assert.equal(set[0].id, next_playlist.items[0].id);
        });
      });

      it('should return an empty set with no neighbors nor playlist', () => {
        Queue.start(next);

        assert.equal(Queue.playlist, null);

        return Queue.next().then((set) => {
          assert.equal(set.empty(), true);
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

        playlist = new Record(null);
        playlist.items = [first, second];
      });

      it('should return the next record if it is present', () => {
        Queue.start(first, playlist);

        return Queue.next().then((set) => {
          assert.equal(set[0].id, second.id);
        });
      });

      it('should return the first track of the playlist otherwise', () => {
        Queue.start(second, playlist);

        return Queue.next().then((set) => {
          assert.equal(set[0].id, first.id);
        });
      });
    });

    describe('in random mode', () => {
      var first, second, third, fourth, playlist;

      beforeEach(() => {
        Queue.setMode('random');

        first  = new Record(1);
        second = new Record(2);
        third  = new Record(3);
        fourth = new Record(4);

        [first, second, third, fourth].forEach((r, i, t) => {
          r.previous = (i == 0) ? null : t[i-1];
          r.next     = (i > t.length) ? null : t[i+1];
        });

        playlist        = new Record(null);
        playlist.items = [new Record('foo'), new Record('bar'), new Record('baz')];
      });

      it('should return a random track in the linked list if there is no playlist', () => {
        Queue.start(first);

        return Queue.next().then((set) => {
          assert([2, 3, 4].indexOf(set[0].id) != -1);
        });
      });

      it('should return a random track from the playlist', () => {
        Queue.start(second, playlist);

        return Queue.next().then((set) => {
          assert(['foo', 'bar', 'baz'].indexOf(set[0].id) != -1);
          assert([1, 2, 3, 4].indexOf(set[0].id) == -1);
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
      });

      it('should return the previous record if it is present', () => {
        current.previous = previous;
        Queue.start(current, playlist);

        assert.equal(current.previous.id, previous.id);

        return Queue.previous().then((set) => {
          assert.equal(set[0].id, next.id);
        });
      });

      it('should return the first record of the previous playlist', () => {
        Queue.start(current, playlist);

        assert.equal(current.previous, null);

        return Queue.previous().then((set) => {
          assert.equal(set[0].id, previous_playlist.items[0].id);
        });
      });

      it('should return an empty set with no neighbors nor playlist', () => {
        Queue.start(previous);

        assert.equal(Queue.playlist, null);

        return Queue.previous().then((set) => {
          assert.equal(set.empty(), true);
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

        playlist = new Record(null);
        playlist.items = [first, second];
      });

      it('should return the previous record if it is present', () => {
        Queue.start(first, playlist);

        return Queue.previous().then((set) => {
          assert.equal(set[0].id, second.id);
        });
      });

      it('should return the last track of the playlist otherwise', () => {
        Queue.start(first, playlist);

        return Queue.previous().then((set) => {
          assert.equal(set[0].id, second.id);
        });
      });
    });

    describe('in random mode', () => {
      var first, second, third, fourth, playlist;

      beforeEach(() => {
        Queue.setMode('random');

        first  = new Record(1);
        second = new Record(2);
        third  = new Record(3);
        fourth = new Record(4);

        [first, second, third, fourth].forEach((r, i, t) => {
          r.previous = (i == 0) ? null : t[i-1];
          r.next     = (i > t.length) ? null : t[i+1];
        });

        playlist        = new Record(null);
        playlist.items = [new Record('foo'), new Record('bar'), new Record('baz')];
      });

      it('should return a random track from the playlist', () => {
        Queue.start(first, playlist);

        return Queue.shift().then((next_set) => {
          assert.notEqual(next_set[0].id, first.id);

          return Queue.previous().then((previous_set) => {
            return assert.equal(previous_set[0].id, first.id);
          });
        });
      });
    });
  });
});
