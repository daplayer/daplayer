require('../../test_helper');

describe('Artist', () => {
  before(() => {
    Cache.initialize();
    Cache.local.artist_arts = ['path/to/Trivium.jpeg'];
  });

  describe('constructor', () => {
    it('should properly set the name', () => {
      var artist = new Artist('Daft Punk', {});

      assert.equal(artist.name, 'Daft Punk');
    });

    it('should properly define the albums', () => {
      var artist = new Artist('Kaytranada', {'99.9%': [{
        artist: 'Kaytranada',
        genre:  'Fushion'
      }]});

      assert(artist.albums instanceof Array);
      assert(artist.albums.first() instanceof Album);

      assert.equal(artist.albums.first().title, '99.9%');
      assert.equal(artist.albums.first().artist.name, artist.name);
    });

    it('should infer any existing art for that artist', () => {
      var artist = new Artist('Trivium', {});

      assert.equal(artist.picture, 'path/to/Trivium.jpeg');
    });
  });
})
