require('../test_helper');

const Router = require('../../app/router');

describe('Router', () => {
  describe('#to', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should map SoundCloud stream to activities or tracks', () => {
      Config.store('soundcloud', 'stream_view',    'activities');
      assert.equal(Router.to('soundcloud/stream'), 'activities');

      Config.store('soundcloud', 'stream_view', 'tracks');
      assert.equal(Router.to('soundcloud/stream'), 'tracks');
    });

    it('should map local files to singles, albums or artists', () => {
      Config.store('local', 'files_view',    'singles');
      assert.equal(Router.to('local/files'), 'singles');

      Config.store('local', 'files_view',    'artists');
      assert.equal(Router.to('local/files'), 'artists');
    });

    it('should return the given action for non-special routes', () => {
      var href = "random/action";

      assert.equal(Router.to(href), 'action');
    });
  });

  describe('#from', () => {
    it('should map SoundCloud activites or tracks to `stream`', () => {
      assert.equal(Router.from('soundcloud', 'activities'), 'soundcloud/stream');
      assert.equal(Router.from('soundcloud', 'tracks'),     'soundcloud/stream');
    });

    it('should map singles, albums or artists to local `files`', () => {
      assert.equal(Router.from('local', 'singles'), 'local/files');
      assert.equal(Router.from('local', 'artists'), 'local/files');
      assert.equal(Router.from('local', 'artist'),  'local/files');
    });
  });
});
