'use strict';

require('../test_helper');

describe('Cache', () => {
  beforeEach(() => {
    Cache.initialize();
  });

  describe('#initialize', () => {
    it('should set default values', () => {
      assert.deepEqual(Cache.playing, {});
      assert.deepEqual(Cache.local, {});
      assert.deepEqual(Cache.soundcloud, {});
      assert.deepEqual(Cache.templates, {});
      assert.deepEqual(Cache.search, {});
    });

    it('should set deeper fields for YouTube', () => {
      assert.deepEqual(Cache.youtube.items, []);
      assert.deepEqual(Cache.youtube.video_urls, {});
    });

    it('should set default scope', () => {
      assert.equal(Cache.current.module, 'meta');
      assert.equal(Cache.current.action, 'index');
    });
  });

  describe('#add', () => {
    it('should add records to the given section', () => {
      Cache.add('local', 'singles', ['foo', 'bar']);

      assert.deepEqual(Cache.local.singles, ['foo', 'bar']);
    });

    it('should always erase existing data for the local sections', () => {
      Cache.add('local', 'singles', ['foo', 'bar']);
      Cache.add('local', 'singles', ['baz', 'quux']);

      assert.deepEqual(Cache.local.singles, ['baz', 'quux']);
    });

    it('should concatenate previous collection with the given one', () => {
      var first  = { collection: ['foo'] };
      var second = { collection: ['bar'] };

      Cache.add('soundcloud', 'likes', first);
      Cache.add('soundcloud', 'likes', second);

      assert.deepEqual(Cache.soundcloud.likes.collection, ['foo', 'bar']);
    });

    it('should erase the previous token with the new one', () => {
      var first =  {collection: ['foo'], next_token: '123'};
      var second = {collection: ['foo'], next_token: '456'};

      Cache.add('soundcloud', 'likes', first);
      Cache.add('soundcloud', 'likes', second);

      assert.equal(Cache.soundcloud.likes.next_token, '456');
    });

    it('should store YouTube video ids', () => {
      Cache.add('youtube', 'video_urls', { id: 'bar' });

      return Cache.youtube.video_urls.bar.then((cached) => {
        assert.deepEqual(cached, {id: 'bar'});
      })
    });
  });

  describe('#fetch', () => {
    it('should wrap the given cache section within a Promise', () => {
      Cache.add('youtube', 'likes', [1, 2, 3]);

      return Cache.fetch('youtube', 'likes').then((cached) => {
        assert.deepEqual(cached, [1, 2, 3]);
      });
    });
  });
})
