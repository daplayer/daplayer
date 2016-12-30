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

    it('should generate a collection from a playlist', () => {
      var playlist   = new Playlist();
      playlist.title = 'foo';
      playlist.items = [1, 2, 3];

      var context = new Context(playlist);

      assert.deepEqual(context.collection, playlist.items);
    });

    it('should generate a collection from a collection of playlists', () => {
      var playlist1 = new Playlist();
      var playlist2 = new Playlist();

      playlist1.items = [1, 2, 3];
      playlist2.items = [4, 5, 6];

      var context = new Context({playlists: [playlist1, playlist2]});

      assert.deepEqual(context.collection, [1, 2, 3, 4, 5, 6]);
    });

    it('should ignore the `next_token` key', () => {
      var context = new Context({next_token: undefined});

      assert.deepEqual(context.collection, []);
    });
  });
});
