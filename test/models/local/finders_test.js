require('../../test_helper');

const LocalModel = require('../../../local/model');

describe('LocalModel::Finders', () => {
  describe('#findByGenre', () => {
    beforeEach(() => {
      Cache.initialize();

      Cache.add('local', 'singles', [
        {id: 'foo', genre: 'Metal'},
        {id: 'bar', genre: 'Core'},
        {id: 'baz', genre: 'Hardcore'}
      ]);

      Cache.add('local', 'albums', [
        {id: 'foo', items: [{genre: 'Electro Jazz'}]},
        {id: 'bar', items: [{genre: 'House'}]},
        {id: 'baz', items: [{genre: 'French House'}]}
      ]);
    });

    afterEach(() => {
      // The method's name doesn't show the purpose here
      // but we want to clear the actual cached data.
      Cache.initialize();
    });

    it('should find musics by genre in singles', () => {
      return LocalModel.findByGenre('Metal').then((results) => {
        assert.equal(results.singles.length, 1);
        assert.equal(results.singles.first().id, 'foo');
      });
    });

    it('should find albums that are tagged under the given genre', () => {
      return LocalModel.findByGenre('Electro Jazz').then((results) => {
        assert.equal(results.albums.length, 1);
        assert.equal(results.albums.first().id, 'foo');
      });
    });

    it('should check by exact match for singles', () => {
      return LocalModel.findByGenre('Core', (results) => {
        assert.equal(results.singles.length, 1);
        assert.equal(results.singles.first().id, 'bar');
      });
    });

    it('should check by exact match for albums', () => {
      return LocalModel.findByGenre('House', (results) => {
        assert.equal(results.albums.length, 1);
        assert.equal(results.albums.first().id, 'bar');
      });
    });
  });

  describe('#findByArtist', () => {
    beforeEach(() => {
      Cache.add('local', 'singles', [
        {id: 'foo', artist: 'Rage Against The Machine'},
        {id: 'bar', artist: 'Bring Me The Horizon'}
      ]);

      Cache.add('local', 'albums', [
        {id: 'foo', items: [{artist: 'Kaytranda'}]},
        {id: 'bar', items: [{artist: 'Darius'}]}
      ]);
    });

    afterEach(() => {
      Cache.initialize();
    })

    it('should check by inclusion for singles', () => {
      return LocalModel.findByArtist('rage against').then((results) => {
        assert.equal(results.singles.length, 1);
        assert.equal(results.singles.first().id, 'foo');
      });
    });

    it('should check by inclusion for albums', () => {
      return LocalModel.findByArtist('kaytra').then((results) => {
        assert.equal(results.albums.length, 1);
        assert.equal(results.albums.first().id, 'foo');
      });
    });
  });
});
