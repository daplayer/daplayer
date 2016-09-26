require('../test_helper');

describe('Record', () => {
  describe('#soundcloud', () => {
    var hash = {
      title: 'Faut qu\'on rentre bosser',
      artwork_url: 'path/to/artwork-large',
      duration: 300000,
      tag_list: ['foo', 'bar'],
      permalink_url: 'http://foo/bar',
      user: {
        username: 'Casseurs Flowteurs'
      }
    };

    var record = Record.soundcloud(hash);

    it('should map SoundCloud fields to our own ones', () => {
      var record = Record.soundcloud(hash);

      assert.equal(hash.title, record.title);
      assert.equal(hash.user.username, record.artist);
      assert.equal(hash.tag_list, record.tags);
      assert.equal(hash.permalink_url, record.url);
    });

    it('should pick the right icon dimension', () => {
      assert.equal('path/to/artwork-t200x200', record.icon);
    });

    it('should convert the duration to seconds', () => {
      assert.equal(300, record.duration);
    });

    it('should not set the `human_time` field', () => {
      assert.equal(false,  record.hasOwnProperty('human_time'))
      assert.equal('5:00', record.human_time);
    });

    it('should set the `service` field', () => {
      assert.equal('soundcloud', record.service);
    });

    it('should set a default icon', () => {
      var record = Record.soundcloud({
        user: { username: 'foo' }
      });

      assert.equal('assets/images/default_artwork.svg', record.icon);
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

    var record = Record.youtube(hash);

    it('should map YouTube fields to our own ones', () => {
      assert.equal(hash.snippet.title, record.title);
      assert.equal(hash.snippet.channelTitle, record.artist);
      assert.equal(hash.snippet.thumbnails.medium.url, record.icon);
      assert.equal(hash.snippet.tags, record.tags);
    });

    it('should convert the duration to seconds', () => {
      assert.equal(243, record.duration);
    });

    it('should compute the `human_time` field on demand', () => {
      assert.equal(false,  record.hasOwnProperty('human_time'))
      assert.equal('4:03', record.human_time);
    });

    it('should set the `service` field', () => {
      assert.equal('youtube', record.service);
    });
  });

  describe('#local', () => {
    var hash = {
      title: 'Maliblue',
      artist: 'Darius',
      genre: 'French House',
      album: 'Velour',
      track: 4,
      duration: 259
    };

    var record = Record.local(hash);

    it('should copy fields verbatim', () => {
      for (key in hash)
        assert.equal(hash[key], record[key]);
    });

    it('should not set `human_time` field', () => {
      assert.equal(false,  record.hasOwnProperty('human_time'))
      assert.equal('4:19', record.human_time);
    });

    it('should set the `service` field', () => {
      assert.equal('local', record.service);
    });

    it('should set the `file://` protocol for non-default icons', () => {
      var record = Record.local({
        icon: 'path/to/icon'
      });

      assert.equal('file://path/to/icon', record.icon);
    });
  });

  describe('#JSPF', () => {
    var hash = {
      title: 'Best of Gojira',
      track: [{
        location: '/path/to/mp3',
        title:    'Born in Winter',
        image:    'foo.png',
        creator:  'Gojira',
        duration: 231
      }]
    };

    var record = Record.JSPF(hash);

    it('should map JSPF fields to our ones', () => {
      var item  = record.items.first();
      var track = hash.track.first();

      assert.equal(record.title, hash.title);

      assert.equal(item.id,       track.location);
      assert.equal(item.title,    track.title);
      assert.equal(item.artist,   track.creator);
      assert.equal(item.icon,     track.image);
      assert.equal(item.duration, track.duration);
    });

    it('should set a default id based on the title', () => {
      assert.equal('best-of-gojira', record.id);
    })

    it('should set a default icon when there are no tracks', () => {
      assert.equal(Record.JSPF({title: 'Foo', track: []}).icon, Paths.default_artwork);
    });

    it('should not set `human_time` field', () => {
      var item = record.items.first();

      assert.equal(false,  item.hasOwnProperty('human_time'))
      assert.equal('3:51', item.human_time);
    });
  });

  describe('#toJSPF', () => {
    var item = Record.raw({
      id:       '/path/to/mp3',
      title:    'Surfacing',
      artist:   'Slipknot',
      icon:     'foo.png',
      duration: 218
    });

    var record = Record.raw({
      title: 'Best of Slipknot',
      items: [item]
    });

    var track    = Record.toJSPF(item);
    var playlist = Record.toJSPF(record);

    it('should map our fields to the JSPF ones', () => {
      assert.equal(playlist.title, record.title);
      assert.deepEqual(playlist.track.first(), track);

      assert.equal(track.location, item.id);
      assert.equal(track.title,    item.title);
      assert.equal(track.creator,  item.artist);
      assert.equal(track.image,    item.icon);
      assert.equal(track.duration, item.duration);
    });
  });

  describe('#raw', () => {
    var hash = {
      id:  'foo',
      foo: 'bar',
      baz: 'quux'
    };

    var record = Record.raw(hash);

    it('should return an instance of Record', () => {
      assert(record instanceof Record);
    });

    it('should copy fields verbatim', () => {
      assert.equal(record.id,  hash.id);
      assert.equal(record.foo, hash.foo);
      assert.equal(record.baz, hash.baz);
    });
  });

  describe('#link', () => {
    it('should set the `previous` and `next` attributes of the given record', () => {
      var record = {};

      Record.link(record, 1, [1, null, 2]);

      assert.equal(record.previous, 1);
      assert.equal(record.next, 2);
    });

    it('should not set the `previous` field for the first record', () => {
      var record = {};

      Record.link(record, 0, [record]);

      assert.equal(record.previous, null);
    });

    it('should not set the `next` field for the last record', () => {
      var record = {};

      Record.link(record, 0, [record]);

      assert.equal(record.next, null);
    });
  });
});
