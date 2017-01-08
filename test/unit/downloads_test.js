require('../test_helper');

const Downloads = require('../../app/downloads');

describe('Downloads', () => {
  describe('#queue', () => {
    it('should initialize an empty queue when first accessed', () => {
      assert.deepEqual(Downloads.queue, []);
    });
  });

  describe('#size', () => {
    it('should initialize the size of the queue to zero', () => {
      assert.strictEqual(Downloads.size, 0);
    })
  });

  describe('#progression', () => {
    it('should initialize the progression of the queue to zero', () => {
      assert.strictEqual(Downloads.progression, 0);
    })
  });

  describe('#history', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should read from local storage and JSON-parse the content', () => {
      localStorage.setItem('downloads_history', '[1, 2, 3]');

      assert.deepEqual(Downloads.history, [1, 2, 3]);
    });

    it('should return an empty array by default', () => {
      assert.deepEqual(localStorage.getItem('downloads_history'), undefined);
      assert.deepEqual(Downloads.history, []);
    });
  });

  describe('#enqueue', () => {
    beforeEach(() => {
      Downloads._queue = [];
    })

    it('should add elements to the queue', () => {
      assert.equal(Downloads.queue.length, 0);

      Downloads.enqueue({foo: 'bar'});

      assert.deepEqual(Downloads.queue.first(), {foo: 'bar'});
    });
  });

  describe('#dequeue', () => {
    var hash = {id: 'foo'};

    beforeEach(() => {
      Downloads._queue = [];
      Downloads.enqueue(hash);
    });

    it('should remove elements from the queue and return it', () => {
      var pop = Downloads.dequeue('foo');

      assert.deepEqual(Downloads.queue, []);
      assert.deepEqual(pop, hash);
    });
  });

  describe('#grow', () => {
    beforeEach(() => {
      Downloads._size = undefined;
    });

    it('should increase the size of the queue by the given number', () => {
      assert.equal(Downloads.size, 0);

      Downloads.grow(10);
      assert.strictEqual(Downloads.size, 10);

      Downloads.grow(20);
      assert.strictEqual(Downloads.size, 30);
    });

    it('should sum with a zero when called with `_size` undefined', () => {
      Downloads.grow(10);

      assert.strictEqual(Downloads.size, 10);
    });

    it('should convert the given value to integer', () => {
      Downloads.grow('040');
      assert.strictEqual(Downloads.size, 40);
    });
  });

  describe('#progress', () => {
    beforeEach(() => {
      Downloads._progression = undefined;
    });

    it('should increase the progression of the queue by the given number', () => {
      assert.equal(Downloads.progression, 0);

      Downloads.progress(10);
      assert.strictEqual(Downloads.progression, 10);

      Downloads.progress(30);
      assert.strictEqual(Downloads.progression, 40);
    });

    it('should sum with a zero with `_progression` undefined', () => {
      Downloads.progress(20);

      assert.strictEqual(Downloads.progression, 20);
    })

    it('should convert the given value to integer', () => {
      Downloads.progress('040');
      assert.strictEqual(Downloads.progression, 40);
    });
  });

  describe('#addToHistory', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should add the element to the local storage with a date field', () => {
      Downloads.addToHistory({foo: 'bar'});

      assert.deepEqual(Downloads.history.first(), {
        foo: 'bar',
        date: Timing.currentTimestamp()
      });
    });

    it('should make sure that the history contains at most 20 elements', () => {
      localStorage.setItem('downloads_history', JSON.stringify(new Array(20)));

      assert.equal(Downloads.history.length, 20);

      Downloads.addToHistory({foo: 'bar'});

      assert.equal(Downloads.history.length, 20);
      assert.deepEqual(Downloads.history.first(), {
        foo: 'bar',
        date: Timing.currentTimestamp()
      });
    });
  });
});
