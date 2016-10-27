require('../test_helper');

describe('core extensions', () => {
  describe('Array', () => {
    describe('#last', () => {
      it('should return the last element', () => {
        assert.equal(undefined, [].last());
        assert.equal(3, [1, 2, 3].last());
      });
    });

    describe('#first', () => {
      it('should return the first element', () => {
        assert.equal(undefined, [].first());
        assert.equal(1, [1, 2, 3].first());
      });
    });

    describe('#includes', () => {
      it('should return true for present elements', () => {
        assert.equal(true, [1, 2, 3].includes(2));
      });

      it('should return false for missing elements', () => {
        assert.equal(false, [1, 2, 3].includes(4));
      });
    });

    describe('#unique', () => {
      it('should strip out duplicates', () => {
        var array = [1, 2, 2, 2, 3, 1, 2, 3, 3, 1, 3, 1, 3, 1, 2, 2];

        assert.deepEqual(array.unique(), [1, 2, 3]);
      });
    });

    describe('#sortBy', () => {
      it('should sort elements by their given field', () => {
        var array = [{v: 3}, {v: 1}, {v: 2}].sortBy('v');

        assert.deepEqual(array, [{v:1}, {v: 2}, {v: 3}]);
      });
    })
  });

  describe('String', () => {
    describe('#size', () => {
      it('should change the actual format to the desired one', () => {
        ['badge', 'large', 't200x200', 't300x300'].forEach((format) => {
          assert.equal('foo', format.size('foo'));
        });
      });
    });

    describe('#last', () => {
      it('should return the last element of the string', () => {
        assert.equal(undefined, ''.last());
        assert.equal('o', 'foo'.last());
      });
    });

    describe('#includes', () => {
      it('should return true for present elements', () => {
        assert.equal(true, 'foo'.includes('oo'));
      });

      it('should return false for missing elements', () => {
        assert.equal(false, 'foo'.includes('bar'));
      });
    });

    describe('#camel', () => {
      it('should return a camel cased version of the string', () => {
        assert.equal('foo_bar_baz'.camel(), 'fooBarBaz');
      });

      it('should not change the string if it does not have any underscore', () => {
        assert.equal('foo'.camel(), 'foo');
      });
    });

    describe('#dasherize', () => {
      it('should return a dasherized and downcased version of the string', () => {
        assert.equal('Hello world'.dasherize(), 'hello-world');
      });

      it('should strip non alpha-numeric chars', () => {
        assert.equal("Oh, you're so smart !".dasherize(), 'oh-you-re-so-smart');
        assert.equal('Dealing_with_underscores'.dasherize(), 'dealing-with-underscores');
        assert.equal('With  multiple  ( spaces'.dasherize(), 'with-multiple-spaces');
      });
    });
  });
});
