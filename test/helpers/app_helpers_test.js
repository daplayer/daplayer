require('../test_helper');
require('../../app/helpers');

describe('App helpers', () => {
  before(() => {
    Translation.load('en');
  });

  describe('#menu', () => {
    it('should generate a div with a "navbar" class', () => {
      var output = Handlebars.helpers.menu('soundcloud', 'search_results');

      assert(output instanceof Handlebars.SafeString);
      assert.include(output, '<div class="navbar">');
    });

    describe('for the dashbaord', () => {
      it('should create a link for each section', () => {
        var output = Handlebars.helpers.menu('meta', 'dashboard', '');

        assert.include(output, '<a href="meta/configuration">');
        assert.include(output, '<a href="meta/downloads">');

        assert.include(output, Translation.t('meta.dashboard.configuration'));
        assert.include(output, Translation.t('meta.dashboard.downloads'));
      });

      it('should set an active class for the current action', () => {
        var output = Handlebars.helpers.menu('meta', 'dashboard', 'downloads');

        assert.include(output, '<a href="meta/configuration">');
        assert.include(output, '<a href="#" class="active">');
      });
    });

    describe('for SoundCloud stream', () => {
      it('should create a link for each section', () => {
        var output = Handlebars.helpers.menu('soundcloud', 'stream', '');

        assert.include(output, '<a href="soundcloud/activities">');
        assert.include(output, '<a href="soundcloud/tracks">');

        assert.include(output, Translation.t('soundcloud.stream.activities'));
        assert.include(output, Translation.t('soundcloud.stream.tracks'));
      });

      it('should set an active class for the current action', () => {
        var output = Handlebars.helpers.menu('soundcloud', 'stream', 'tracks');

        assert.include(output, '<a href="soundcloud/activities">');
        assert.include(output, '<a href="#" class="active">');
      });
    });

    describe('for SoundCloud playlists', () => {
      it('should create a link for each section', () => {
        var output = Handlebars.helpers.menu('soundcloud', 'playlists', '');

        assert.include(output, '<a href="soundcloud/liked_playlists">');
        assert.include(output, '<a href="soundcloud/user_playlists">');

        assert.include(output, Translation.t('soundcloud.playlists.liked_playlists'));
        assert.include(output, Translation.t('soundcloud.playlists.user_playlists'));
      });

      it('should set an active class for the current action', () => {
        var output = Handlebars.helpers.menu('soundcloud', 'playlists', 'user_playlists');

        assert.include(output, '<a href="soundcloud/liked_playlists">');
        assert.include(output, '<a href="#" class="active">');
      });
    });

    describe('for local files', () => {
      it('should create a link for each section', () => {
        var output = Handlebars.helpers.menu('local', 'files', '');

        assert.include(output, '<a href="local/singles">');
        assert.include(output, '<a href="local/artists">');

        assert.include(output, Translation.t('local.files.singles'));
        assert.include(output, Translation.t('local.files.artists'));
      });

      it('should set an active class for the current action', () => {
        var output = Handlebars.helpers.menu('local', 'files', 'singles');

        assert.include(output, '<a href="#" class="active">');
        assert.include(output, '<a href="local/artists">');
      });

      it('should link if the active action is "artist"', () => {
        var output = Handlebars.helpers.menu('local', 'files', 'artists');

        assert.include(output, '<a href="local/singles">');
        assert.include(output, '<a href="local/artists" class="active">');
      });
    });

    describe('for search_results', () => {
      before(() => {
        Translation.load('en');
      });

      it('should generate a link for each module', () => {
        var output = Handlebars.helpers.menu('', 'search_results', '');

        assert.include(output, '<a href="soundcloud/search_results">');
        assert.include(output, '<a href="youtube/search_results">');
        assert.include(output, '<a href="local/search_results">');

        assert.include(output, Translation.t('sc.name'));
        assert.include(output, Translation.t('yt.name'));
        assert.include(output, Translation.t('local.name'));
      });

      it('should set the active class for the given module', () => {
        var output = Handlebars.helpers.menu('youtube', 'search_results', 'youtube');

        assert.include(output, '<a href="soundcloud/search_results">');
        assert.include(output, '<a href="#" class="active">');
        assert.include(output, '<a href="local/search_results">');
      });
    });
  });
});
