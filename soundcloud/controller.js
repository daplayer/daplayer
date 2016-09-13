'use strict';

const SoundCloudModel = require('./model');

module.exports = class SoundCloudController {
  static activities(href) {
    return SoundCloudModel.activities(href).then((activities) => {
      this.render('soundcloud/activities', {
        activities: activities,
        href: href
      });
    });
  }

  static tracks(href) {
    return SoundCloudModel.tracks(href).then((tracks) => {
      this.render('soundcloud/tracks', {
        tracks: tracks,
        href: href
      });
    });
  }

  static likes(href) {
    return SoundCloudModel.likes(href).then((likes) => {
      this.render('soundcloud/likes', {
        likes: likes,
        href: href
      })
    });
  }

  static userPlaylists(href) {
    return SoundCloudModel.userPlaylists(href).then((user_playlists) => {
      this.render('soundcloud/user_playlists', {
        user_playlists: user_playlists,
        href: href
      });
    });
  }

  static likedPlaylists(href) {
    return SoundCloudModel.likedPlaylists(href).then((liked_playlists) => {
      this.render('soundcloud/liked_playlists', {
        liked_playlists: liked_playlists,
        href: href
      });
    })
  }

  static searchResults() {
    return MetaModel.searchResults().then((results) => {
      this.render('soundcloud/search_results', results);
    });
  }

  static render(view, context) {
    var href = context.href;
    var meth = href ? 'append' : 'render';

    View[meth](view, context);
  }
}
