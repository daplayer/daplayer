require('../../test_helper');

describe('Context', () => {
  describe('constructor', () => {
    it('should generate a collection with all the keys', () => {
      var context = new Context({singles: [1, 2, 3], albums: [4, 5, 6] });

      assert.deepEqual(context.collection, [1, 2, 3, 4, 5, 6]);
    });

    it('should generate a collection from the collection key if it exists', () => {
      var context = new Context({likes: { collection: [1, 2, 3] }});

      assert.deepEqual(context.collection, [1, 2, 3]);
    });
  });
});
