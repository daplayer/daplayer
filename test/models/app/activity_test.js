require('../../test_helper.js');

describe('Activity', () => {
  describe('constructor', () => {
    describe('with a track', () => {
      it('should instantiate a media from the given track', () => {
        var hash = {
          track: {
            title: 'Crayon Feat. KLP - Give You Up (Darius Remix)',
            user: { username: 'Darius (Official)' }
          },
          user: { username: 'Crayon' },
          type: 'track-repost'
        };

        var activity = new Activity(hash);

        assert(activity.item instanceof Media);

        assert.equal(activity.hasTrack,   true);
        assert.equal(activity.type,       hash.type);
        assert.deepEqual(activity.origin, hash.user);
      });
    });

    describe('with a playlist', () => {
      it('should instantiate a playlist from the given one', () => {
        var hash = {
          playlist: {
            title: 'Tender Games EP',
            user: { username: 'Kartell' }
          },
          user: { username: 'Kartell' },
          type: 'playlist'
        };

        var activity = new Activity(hash);

        assert(activity.item instanceof Playlist);

        assert.equal(activity.hasTrack,   false);
        assert.equal(activity.type,       hash.type);
        assert.deepEqual(activity.origin, hash.user);
      });
    });
  });
});
