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
      assert.equal(Router.from('local', 'artist'),  'local/artists');
    });
  });
});
