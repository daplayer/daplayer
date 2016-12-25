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
      Cache.add('local', 'files', ['foo', 'bar']);

      return Cache.local.files.then((cached) => {
        assert.deepEqual(cached, ['foo', 'bar']);
      });
    });

    it('should concatenate previous collection with the given one', () => {
      var first  = { collection: ['foo'] };
      var second = { collection: ['bar'] };

      return Cache.add('soundcloud', 'likes', first).then(() => {
        return Cache.add('soundcloud', 'likes', second);
      }).then(() => {
        return Cache.soundcloud.likes.then((cached) => {
          return assert.deepEqual(cached.collection, ['foo', 'bar']);
        });
      });
    });

    it('should erase the previous token with the new one', () => {
      var first =  {collection: ['foo'], next_token: '123'};
      var second = {collection: ['foo'], next_token: '456'};

      return Cache.add('soundcloud', 'likes', first).then(() => {
        return Cache.add('soundcloud', 'likes', second);
      }).then(() => {
        return Cache.soundcloud.likes.then((cached) => {
          return assert.equal(cached.next_token, '456');
        });
      });
    });

    it('should store YouTube video ids', () => {
      Cache.add('youtube', 'video_urls', { id: 'bar' });

      return Cache.youtube.video_urls.bar.then((cached) => {
        assert.deepEqual(cached, {id: 'bar'});
      })
    });
  });
})
