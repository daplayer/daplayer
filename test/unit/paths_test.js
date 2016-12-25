require('../test_helper');

describe('Paths', () => {
  describe('#join', () => {
    it('should join all the given strings', () => {
      var result = Paths.join('/home/jacky', 'Musics', 'Cherokee - American Spirit', 'Imagine.mp3');

      assert.equal(result, '/home/jacky/Musics/Cherokee - American Spirit/Imagine.mp3');
    });
  });

  describe('#resolve', () => {
    it('should delegate to the `path.resolve` method', () => {
      var result = Paths.resolve(Paths.join(__dirname, '../unit'));

      assert.equal(result, __dirname);
    });
  });

  describe('#exists', () => {
    it('should return true if a full path exists on the file system', () => {
      assert(Paths.exists(__dirname));
    });
  });

  describe('getters', () => {
    var key, value;

    before(() => {
      key   = process.platform == 'win32' ? 'USERPROFILE' : 'HOME';
      value = process.env[key];

      process.env[key] = 'foo';
    });

    after(() => {
      process.env[key] = value;
    });

    it('should have the proper value for `home`', () => {
      assert.equal(Paths.home, 'foo');
    });

    it('should have the proper value for `user`', () => {
      assert.equal(Paths.user, 'foo/.daplayer');
    });

    it('should have the proper value for `default_artwork`', () => {
      assert.equal(Paths.default_artwork, 'assets/images/default_artwork.svg');
    });

    it('should have the proper value for `covers`', () => {
      assert.equal(Paths.covers, 'foo/.daplayer/covers');
    });

    it('should have the proper value for `playlists`', () => {
      assert.equal(Paths.playlists, 'foo/.daplayer/playlists');
    });

    it('should have the proper value for `youtube_history`', () => {
      assert.equal(Paths.youtube_history, 'foo/.daplayer/playlists/youtube-history.jspf');
    });
  });
});
