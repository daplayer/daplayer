require('../../test_helper');

describe('Artist', () => {
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
  });
})
