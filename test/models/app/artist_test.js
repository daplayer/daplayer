require('../../test_helper');

describe('Artist', () => {
  before(() => {
    Cache.initialize();
    Cache.local.artist_arts = {Trivium: true};
  });

  describe('constructor', () => {
    it('should properly set the name', () => {
      var artist = new Artist('Daft Punk', {}, []);

      assert.equal(artist.name, 'Daft Punk');
    });

    it('should properly define the albums and singles', () => {
      var artist = new Artist('Kaytranada', {'99.9%': [{
        artist: 'Kaytranada',
        genre:  'Fushion'
      }]}, [{title: 'Modjo - Lady (Kaytranada Remix)'}]);

      assert(artist.albums instanceof Array);
      assert(artist.albums.first() instanceof Album);

      assert.equal(artist.albums.first().title, '99.9%');
      assert.equal(artist.albums.first().artist.name, artist.name);

      assert.equal(artist.singles.length, 1)
      assert.equal(artist.singles.first().title, 'Modjo - Lady (Kaytranada Remix)');
    });

    it('should infer any existing art for that artist', () => {
      var artist = new Artist('Trivium', {}, []);

      assert(artist.picture.endsWith('Trivium.jpeg'));
    });
  });
})
