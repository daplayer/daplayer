'use strict';

const SoundCloudModel = require('./model');

module.exports = class SoundCloudController {
  static activities(token) {
    return SoundCloudModel.activities(token).then((activities) => {
      this.render('soundcloud/activities', {
        activities: activities,
        token: token
      });
    });
  }

  static tracks(token) {
    return SoundCloudModel.tracks(token).then((tracks) => {
      this.render('soundcloud/tracks', {
        tracks: tracks,
        token: token
      });
    });
  }

  static likes(token) {
    return SoundCloudModel.likes(token).then((likes) => {
      this.render('soundcloud/likes', {
        likes: likes,
        token: token
      })
    });
  }

  static userPlaylists(token) {
    return SoundCloudModel.userPlaylists(token).then((user_playlists) => {
      this.render('soundcloud/user_playlists', {
        user_playlists: user_playlists,
        token: token
      });
    });
  }

  static likedPlaylists(token) {
    return SoundCloudModel.likedPlaylists(token).then((liked_playlists) => {
      this.render('soundcloud/liked_playlists', {
        liked_playlists: liked_playlists,
        token: token
      });
    })
  }

  static searchResults() {
    return Service.for('soundcloud').search().then((results) => {
      this.render('soundcloud/search_results', results);
    });
  }

  static render(view, context) {
    var token = context.token;
    var meth  = token ? 'append' : 'render';

    View[meth](view, context);
  }
}
