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

  describe('icon', () => {
    it('should return an icon based on the type of activity', () => {
      var mapping = {
        'track-repost':    'retweet',
        'playlist-repost': 'retweet',
        'track':           'music',
        'playlist':        'list',
      }

      Object.keys(mapping).forEach(key => {
        var activity = new Activity({track: {}, type: key, user: {}})
        var icon     = activity.icon()

        assert.include(icon, 'glyphicon ')
        assert.include(icon, `glyphicon-${mapping[key]}`)
      })
    })
  })

  describe('description', () => {
    beforeEach(() => {
      I18n.load('en')
    })

    it('should return a translated message with the proper information', () => {
      var types = ['track-repost', 'playlist-repost', 'track', 'playlist']

      types.forEach(type => {
        var activity = new Activity({
          track: { title: 'FKJ - Skyline', user: { username: 'FKJ' }},
          user: { username: 'Darius', avatar_url: 'foo.png' },
          type: type
        })
        var description = activity.description().string

        assert.include(description, 'style="background-image: url(foo.png)"')
        assert.include(description, 'class="image"')
        assert.include(description, I18n.t(`sc.activities.${type}`, { user: 'Darius'}))
      })
    })
  })
});
