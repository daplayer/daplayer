'use strict';

require('../test_helper');

describe('Config', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('#default', () => {
    it('should have proper default values for the meta section', () => {
      assert.equal('en', Config.default.meta.locale);
    });

    it('should have proper default values for SoundCloud', () => {
      assert.equal('bar', Config.default.soundcloud.download);
      assert.equal(1, Config.default.soundcloud.volume);
      assert.equal('activities', Config.default.soundcloud.stream_view);
      assert.equal('liked_playlists', Config.default.soundcloud.playlists_view);
    });

    it('should have proper default values for YouTube', () => {
      assert.equal('baz', Config.default.youtube.download);
      assert.equal('medium', Config.default.youtube.quality);
      assert.equal(1, Config.default.youtube.volume);
      assert.deepEqual({}, Config.default.youtube.related_playlists);
    });

    it('should have proper default values for the local section', () => {
      assert.equal('foo', Config.default.local.path);
      assert.equal(true, Config.default.local.lock_download);
      assert.equal(1, Config.default.local.volume);
      assert.equal('single_files', Config.default.local.files_view);
    });
  });

  describe('#read', () => {
    it('should read default values', () => {
      assert.equal('en', Config.read('meta', 'locale'));
    });

    it('should return the values set by the user', () => {
      assert.equal('en', Config.read('meta', 'locale'));
      Config.store('meta', 'locale', 'fr');
      assert.equal('fr', Config.read('meta', 'locale'));
    });
  });

  describe('#store', () => {
    it('should add a `_config` suffix', () => {
      Config.store('local', 'path', 'bar');

      assert.equal('bar', JSON.parse(localStorage.getItem('local_config')).path);
    });

    it('should not erase the existing keys', () => {
      Config.store('local', 'path', 'bar');
      Config.store('local', 'volume', 0.5);

      var values = JSON.parse(localStorage.getItem('local_config'));

      assert.equal('bar', values.path);
      assert.equal(0.5, values.volume);
    });
  });
});
