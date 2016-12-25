'use strict';

require('../test_helper');

describe('Config', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('#default', () => {
    it('should have proper default values for the meta section', () => {
      assert.equal(Config.default.meta.locale, 'en');
      assert.equal(Config.default.meta.dashboard_view, 'configuration');
    });

    it('should have proper default values for SoundCloud', () => {
      assert.equal(Config.default.soundcloud.download,    '');
      assert.equal(Config.default.soundcloud.volume,      1);
      assert.equal(Config.default.soundcloud.stream_view, 'activities');
    });

    it('should have proper default values for YouTube', () => {
      assert.equal(Config.default.youtube.download, '');
      assert.equal(Config.default.youtube.quality,  360);
      assert.equal(Config.default.youtube.volume,   1);

      assert.deepEqual(Config.default.youtube.related_playlists, {});
    });

    it('should have proper default values for the local section', () => {
      assert.equal(Config.default.local.path,       Paths.music_folder);
      assert.equal(Config.default.local.volume,     1);
      assert.equal(Config.default.local.files_view, 'single_files');
    });
  });

  describe('#read', () => {
    it('should read default values', () => {
      assert.equal(Config.read('meta', 'locale'), 'en');
    });

    it('should return the values set by the user', () => {
      assert.equal(Config.read('meta', 'locale'), 'en');
      Config.store('meta', 'locale', 'fr');
      assert.equal(Config.read('meta', 'locale'), 'fr');
    });
  });

  describe('#store', () => {
    it('should add a `_config` suffix', () => {
      Config.store('local', 'path', 'bar');

      assert.equal(JSON.parse(localStorage.getItem('local_config')).path, 'bar');
    });

    it('should not erase the existing keys', () => {
      Config.store('local', 'path', 'bar');
      Config.store('local', 'volume', 0.5);

      var values = JSON.parse(localStorage.getItem('local_config'));

      assert.equal(values.path,   'bar');
      assert.equal(values.volume, 0.5);
    });
  });
});
