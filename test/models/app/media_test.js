require('../../test_helper.js');

describe('Media', () => {
  describe('#toJSPF', () => {
    it('should do a reversed mapping', () => {
      var hash = {
        title:    'Léopold - Sublime (She said disco Remix)',
        creator:  'She said disco',
        duration: 313,
        image:    '/path/to/artwork.jpg',
        location: '/path/to/sublime.mp3'
      };

      var media = Media.JSPF(hash);

      assert.deepEqual(media.toJSPF(), hash);
    });
  });

  describe('#kind', () => {
    it('should be a video for a YouTube media', () => {
      var media = new Media(null, 'youtube');

      assert.equal(media.kind, 'video');
    });

    it('should be a music for a local media', () => {
      var media = new Media(null, 'local');

      assert.equal(media.kind, 'music');
    });

    it('should be a music for a SoundCloud media', () => {
      var media = new Media(null, 'soundcloud');

      assert.equal(media.kind, 'music');
    });
  });

  describe('#url', () => {
    it('should return the `_url` attribute for a SoundCloud media', () => {
      var media      = new Media(null, 'soundcloud');
          media._url = 'foo';

      assert.equal(media.url, 'foo');
    });

    it('should compute the URL for a YouTube media based on its id', () => {
      var media = new Media('bar', 'youtube');

      assert.equal(media.url, 'https://www.youtube.com/watch?v=bar');
    });
  });

  describe('#album', () => {
    it('should return the album title if present', () => {
      var media = new Media('Imagine');
      media.set = {title: 'American Spirit'};

      assert.equal(media.album, 'American Spirit');
    });

    it('should return an empty string for singles', () => {
      var media = new Media("Don't Matter");

      assert.equal(media.album, '');
    });
  });

  describe('#real_artist', () => {
    it('should pick artist from title instead of any record account', () => {
      var media = new Media();

      media.title  = 'Darius - Helios';
      media.artist = 'RocheMusique'

      assert.equal(media.real_artist, 'Darius');

      media.title  = 'Pomo - Blue Soda';
      media.artist = 'THUMP';

      assert.equal(media.real_artist, 'Pomo');
    });

    it('should remove "(Official)" from the name', () => {
      var media = new Media();

      media.title  = 'Take Care of You';
      media.artist = 'Cherokee (Official)';

      assert.equal(media.real_artist, 'Cherokee');
    });

    it('should pick the artist who did the remix if it is one', () => {
      var media = new Media();

      media.title  = 'Alina Baraz & Galimatias - Fantasy (Pomo Remix)';
      media.artist = '';

      assert.equal(media.real_artist, 'Pomo');

      media.title  = 'Darius - Helios (Feat. Wayne Snow) (Myd Remix)';
      media.artist = '';

      assert.equal(media.real_artist, 'Myd');
    });
  });

  describe('#soundcloud', () => {
    var hash = {
      title: 'Faut qu\'on rentre bosser',
      artwork_url: 'path/to/artwork-large',
      duration: 300000,
      tag_list: ['foo', 'bar'],
      genre: 'Hip Hop',
      permalink_url: 'http://foo/bar',
      user: {
        username: 'Casseurs Flowteurs'
      },
      playback_count: 200,
      reposts_count: 100
    };

    var media = Media.soundcloud(hash);

    it('should map SoundCloud fields to our own ones', () => {
      assert.equal(media.title,  hash.title);
      assert.equal(media.artist, hash.user.username);
      assert.equal(media.tags,   hash.tag_list);
      assert.equal(media._url,   hash.permalink_url);
      assert.equal(media.genre,  hash.genre);

      assert.equal(media.reposts, hash.reposts_count)
      assert.equal(media.playbacks, hash.playback_count)
    });

    it('should pick the right icon dimension', () => {
      assert.equal(media.icon, 'path/to/artwork-t200x200');
    });

    it('should convert the duration to seconds', () => {
      assert.equal(media.duration, 300);
    });

    it('should set the right `service`', () => {
      assert.equal('soundcloud', media.service);
    });

    it('should set a default icon', () => {
      var media = Media.soundcloud({
        user: { username: 'foo' }
      });

      assert.equal(media.icon, Paths.default_artwork);
    });
  });

  describe('#youtube', () => {
    var hash = {
      id: 'foobar',
      snippet: {
        title: 'Kaytranada - Drive Me Crazy (ft. Vic Mensa)',
        channelTitle: 'XL Recordings',
        tags: ['foo', 'bar'],
        thumbnails: {
          medium: { url: 'foo/bar' }
        }
      },
      contentDetails: {
        duration: '4M3S'
      }
    };

    var media = Media.youtube(hash);

    it('should map YouTube fields to our own ones', () => {
      assert.equal(media.id,     hash.id);
      assert.equal(media.title,  hash.snippet.title);
      assert.equal(media.artist, hash.snippet.channelTitle);
      assert.equal(media.icon,   hash.snippet.thumbnails.medium.url);
      assert.equal(media.tags,   hash.snippet.tags);
    });

    it('should convert the duration to seconds', () => {
      assert.equal(media.duration, 243);
    });

    it('should set the right `service`', () => {
      assert.equal(media.service, 'youtube');
    });
  });

  describe('#local', () => {
    var hash = {
      title: 'Maliblue',
      artist: 'Darius',
      genre: 'French House',
      track: 4,
      duration: 259
    };

    var media = Media.local(hash);

    it('should copy fields verbatim', () => {
      for (key in hash)
        assert.equal(media[key], hash[key]);
    });

    it('should set a default icon', () => {
      assert.equal(media.icon, Paths.default_artwork);
    });

    it('should set the right `service`', () => {
      assert.equal(media.service, 'local');
    });

    it('should set the `file://` protocol for non-default icons', () => {
      var media = Media.local({
        icon: 'path/to/icon'
      });

      assert.equal(media.icon, 'file://path/to/icon');
    });
  });

  describe('#JSPF', () => {
    it('should map JSPF fields to our ones', () => {
      var hash = {
        location: '/path/to/mp3',
        title:    'Born in Winter',
        image:    'foo.png',
        creator:  'Gojira',
        duration: 231
      };

      var media = Media.JSPF(hash);

      assert.equal(media.id,       hash.location);
      assert.equal(media.title,    hash.title);
      assert.equal(media.artist,   hash.creator);
      assert.equal(media.icon,     hash.image);
      assert.equal(media.duration, hash.duration);
    });

    it('should infert the service based on the location', () => {
      var soundcloud = Media.JSPF({location: 176885985});
      var youtube    = Media.JSPF({location: 'InWxO9eDuIQ'});
      var local      = Media.JSPF({location: '/home/robin/Music/'});

      assert.equal(soundcloud.service, 'soundcloud');
      assert.equal(youtube.service,    'youtube');
      assert.equal(local.service,      'local');
    });
  });
});
