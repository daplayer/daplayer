'use strict';

require('../test_helper');

describe('Cache', () => {
  before(() => {
    Cache.initialize();
  });

  describe('#initialize', () => {
    it('should set default values', () => {
      assert.deepEqual(Cache.playing, {});
      assert.deepEqual(Cache.local, {});
      assert.deepEqual(Cache.soundcloud, {});
      assert.deepEqual(Cache.templates, {});
      assert.deepEqual(Cache.search_results, {});
    });

    it('should set deeper fields for YouTube', () => {
      assert.deepEqual(Cache.youtube.playlist_items, {});
      assert.deepEqual(Cache.youtube.video_urls, {});
    });

    it('should set default scope', () => {
      assert.equal(Cache.current.module, 'meta');
      assert.equal(Cache.current.action, 'index');
    });
  });

  describe('#add', () => {
    it('should add records to their specific section', () => {
      Cache.add('local', 'files', {collection: ['foo', 'bar']});

      return Cache.local.files.then((cached) => {
        assert.deepEqual(cached, {collection: ['foo', 'bar']});
      });
    });

    it('should concatenate previous collection with the given one', () => {
      Cache.add('local', 'files', {collection: ['foo']});
      Cache.add('local', 'files', {collection: ['bar']});

      return Cache.local.files.then((cached) => {
        assert.deepEqual(cached, {collection: ['foo', 'bar']});
      });
    });

    it('should store YouTube playlist items', () => {
      Cache.add('youtube', 'playlist_items', { id: 'foo' });

      assert.deepEqual(Cache.youtube.playlist_items.foo, Promise.resolve({id: 'foo'}));
    });

    it('should store YouTube video ids', () => {
      Cache.add('youtube', 'video_urls', { id: 'bar' });

      assert.deepEqual(Cache.youtube.video_urls.bar, Promise.resolve({id: 'bar'}));
    });
  });
})
