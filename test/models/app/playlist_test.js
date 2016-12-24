require('../../test_helper.js');

describe('Playlist', () => {
  describe('#toJSPF', () => {
    it('should do a reversed mapping and serialize items as well', () => {
      var hash = {
        title: 'Best of Slipknot',
        track: [{
          title:    'Surfacing',
          creator:  'Slipknot',
          duration: 218,
          image:    '/path/to/artwork.jpg',
          location: '/path/to/surfacing.mp3'
        }]
      };

      var playlist = Playlist.JSPF(hash);

      assert.deepEqual(playlist.toJSPF(), hash);
    });
  });

  describe('#icon', () => {
    it('should pick the `_icon` attribute if it is present', () => {
      var playlist       = new Playlist();
          playlist._icon = 'my_awesome_icon.png';

      assert.equal(playlist._icon, playlist.icon);
    });

    it('should pick the first\'s item icon if it is present', () => {
      var playlist       = new Playlist();
          playlist.items = [{icon: 'my_awesome_icon.png'}];

      assert.equal(playlist.icon, playlist.items[0].icon);
    });

    it('should set the default artwork if there is no icon nor items', () => {
      var playlist = new Playlist();

      assert.equal(playlist.icon, Paths.default_artwork);
    });
  });

  describe('#item_count', () => {
    it('should pick the `_item_count` attribute if present', () => {
      var playlist = new Playlist();
          playlist._item_count = 10;

      assert.equal(playlist.item_count, 10);
    });

    it('should return the `items` length otherwise', () => {
      var playlist = new Playlist();
          playlist.items = [];

      assert.equal(playlist.item_count, 0);
    });
  });

  describe('#findById', () => {
    it('should find the item by its given id', () => {
      var playlist = new Playlist();

      playlist.items = [{id: 'foo', title: 'bar'}];

      assert.deepEqual(playlist.findById('foo'), {id: 'foo', title: 'bar'});
    });
  });

  describe('#flatten', () => {
    it('should return the items', () => {
      var playlist = new Playlist();

      playlist.items = [{id: 'foo', title: 'bar'}];

      assert.deepEqual(playlist.flatten(), playlist.items);
    });
  });

  describe('#soundcloud', () => {
    var hash = {
      artwork_url: 'path/to/artwork-large',
      title: 'Alina Baraz & Galimatias - Urban Flora EP',
      duration: 1847493,
      user: { username: 'Alina Baraz' },
      uri: 'foo/bar',
      tracks: [{user: {username: 'Alina Baraz'}}]
    };

    var playlist = Playlist.soundcloud(hash);

    it('should map SoundCloud fields with our own ones', () => {
      assert.equal(playlist.title,    hash.title);
      assert.equal(playlist.duration, hash.duration * Math.pow(10, -3));
      assert.equal(playlist.artist,   hash.user.username);
      assert.equal(playlist.uri,      hash.uri);

      assert(playlist.items.first() instanceof Media);
    });

    it('should specify the service as soundcloud', () => {
      assert.equal(playlist.service, 'soundcloud');
    });

    it('should pick the right icon dimension', () => {
      assert.equal(playlist._icon, 'path/to/artwork-t300x300');
    });
  });

  describe('#youtube', () => {
    var hash = {
      snippet: {
        title: 'Chill Out',
        thumbnails: { medium: { url: 'foo' }}
      },
      contentDetails: {
        itemCount: 3
      },
    };

    var playlist = Playlist.youtube(hash);

    it('should map YouTube fields with our own ones', () => {
      assert.equal(playlist.title,       hash.snippet.title);
      assert.equal(playlist._item_count, hash.contentDetails.itemCount);
      assert.equal(playlist._icon,       hash.snippet.thumbnails.medium.url);
    });

    it('should specify the service as youtube', () => {
      assert.equal(playlist.service, 'youtube');
    });
  });

  describe('#JSPF', () => {
    var hash = {
      title: 'Best of Gojira',
      track: [{location: '/foo'}]
    };

    var playlist = Playlist.JSPF(hash);

    it('should properly map fields with our own ones', () => {
      assert.equal(playlist.title, hash.title);

      assert(playlist.items.first() instanceof Media);
    });

    it('should set a default id based on the title', () => {
      assert.equal(playlist.id, 'best-of-gojira');
    });

    it('should specify the service as local', () => {
      assert.equal(playlist.service, 'local');
    });
  });
});
