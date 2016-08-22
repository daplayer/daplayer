require('../test_helper');

const Record = require('../../app/record');

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

    it('should set the `human_time` field', () => {
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

    it('should set the `human_time` field', () => {
      assert.equal('4:03', record.human_time);
    });

    it('should set the `service` field', () => {
      assert.equal('youtube', record.service);
    });
  });

  describe('#fromLocalFile', () => {
    var hash = {
      title: 'Maliblue',
      artist: 'Darius',
      genre: 'French House',
      album: 'Velour',
      track: 4,
      duration: 259
    };

    var record = Record.fromLocalFile(hash);

    it('should copy fields verbatim', () => {
      for (key in hash)
        assert.equal(hash[key], record[key]);
    });

    it('should set the `human_time` field', () => {
      assert.equal('4:19', record.human_time);
    });

    it('should set the `service` field', () => {
      assert.equal('local', record.service);
    });

    it('should set the `file://` protocol for non-default icons', () => {
      var record = Record.fromLocalFile({
        icon: 'path/to/icon'
      });

      assert.equal('file://path/to/icon', record.icon);
    });
  });
});
