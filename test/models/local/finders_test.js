require('../../test_helper');

const LocalModel = require('../../../local/model');
const Record     = require('../../../app/record');

describe('LocalModel::Finders', () => {
  describe('#findBy for "genre"', () => {
    beforeEach(() => {
      Cache.initialize();

      Cache.add('local', 'singles', [
        {id: 'foo', genre: 'Metal'},
        {id: 'bar', genre: 'Core'},
        {id: 'baz', genre: 'Hardcore'}
      ]);

      Cache.add('local', 'albums', [
        Record.local({id: 'foo', album: true, items: [{genre: 'Electro Jazz'}]}),
        Record.local({id: 'bar', album: true, items: [{genre: 'House'}]}),
        Record.local({id: 'baz', album: true, items: [{genre: 'French House'}]})
      ]);
    });

    afterEach(() => {
      // The method's name doesn't show the purpose here
      // but we want to clear the actual cached data.
      Cache.initialize();
    });

    it('should find musics by genre in singles', () => {
      return LocalModel.findBy('genre', 'Metal').then((results) => {
        assert.equal(results.singles.length, 1);
        assert.equal(results.singles.first().id, 'foo');
      });
    });

    it('should find albums that are tagged under the given genre', () => {
      return LocalModel.findBy('genre', 'Electro Jazz').then((results) => {
        assert.equal(results.albums.length, 1);
        assert.equal(results.albums.first().id, 'foo');
      });
    });

    it('should check by exact match for singles', () => {
      return LocalModel.findBy('genre', 'Core', (results) => {
        assert.equal(results.singles.length, 1);
        assert.equal(results.singles.first().id, 'bar');
      });
    });

    it('should check by exact match for albums', () => {
      return LocalModel.findBy('genre', 'House', (results) => {
        assert.equal(results.albums.length, 1);
        assert.equal(results.albums.first().id, 'bar');
      });
    });
  });

  describe('#findBy for "artist"', () => {
    beforeEach(() => {
      Cache.add('local', 'singles', [
        {id: 'foo', artist: 'Rage Against The Machine'},
        {id: 'bar', artist: 'Bring Me The Horizon'}
      ]);

      Cache.add('local', 'albums', [
        Record.local({id: 'foo', album: true, items: [{artist: 'Kaytranda'}]}),
        Record.local({id: 'bar', album: true, items: [{artist: 'Darius'}]})
      ]);
    });

    afterEach(() => {
      Cache.initialize();
    })

    it('should check by inclusion for singles', () => {
      return LocalModel.findBy('artist', 'rage against').then((results) => {
        assert.equal(results.singles.length, 1);
        assert.equal(results.singles.first().id, 'foo');
      });
    });

    it('should check by inclusion for albums', () => {
      return LocalModel.findBy('artist', 'kaytra').then((results) => {
        assert.equal(results.albums.length, 1);
        assert.equal(results.albums.first().id, 'foo');
      });
    });
  });
});
