require('../../test_helper');

describe('Context', () => {
  describe('constructor', () => {
    it('should have a collection of the given items', () => {
      var array   = [1, 2, 3, 4]
      var context = new Context(array)

      assert.deepEqual(context.collection, array)
    })

    it('should have a collection of items with a collection of playlists', () => {
      var context = new Context([
        Playlist.soundcloud({ tracks: [{id: 1}, {id: 2}], user: {} }),
        Playlist.soundcloud({ tracks: [{id: 3}, {id: 4}], user: {} })
      ])

      assert.deepEqual(context.collection.map(e => e.id), [1, 2, 3, 4])
    })

    it('should have a collection of items with a collection of `Activity`', () => {
      var context = new Context([
        new Activity({ track: { id: 'foo', user: {} }}),
        new Activity({ playlist: { tracks: [{id: 'bar'}], user: {} }})
      ])

      assert.equal(context.collection[0].id, 'foo')
      assert.equal(context.collection[1].id, 'bar')

      assert(context.collection[0] instanceof Media)
      assert(context.collection[1] instanceof Media)
    })
  })
})
