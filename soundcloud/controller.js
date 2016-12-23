'use strict';

const SoundCloudModel = require('./model');

module.exports = class SoundCloudController extends BaseController {
  static activities(token) {
    return SoundCloudModel.activities(token).then((activities) => {
      return this.render('soundcloud/activities', {
        activities: activities,
        token: token
      });
    });
  }

  static tracks(token) {
    return SoundCloudModel.tracks(token).then((tracks) => {
      return this.render('soundcloud/tracks', {
        tracks: tracks,
        token: token
      });
    });
  }

  static likes(token) {
    return SoundCloudModel.likes(token).then((likes) => {
      return this.render('soundcloud/likes', {
        likes: likes,
        token: token
      })
    });
  }

  static userPlaylists(token) {
    return SoundCloudModel.userPlaylists(token).then((user_playlists) => {
      return this.render('soundcloud/user_playlists', {
        user_playlists: user_playlists,
        token: token
      });
    });
  }

  static likedPlaylists(token) {
    return SoundCloudModel.likedPlaylists(token).then((liked_playlists) => {
      return this.render('soundcloud/liked_playlists', {
        liked_playlists: liked_playlists,
        token: token
      });
    })
  }

  static searchResults() {
    return Service.for('soundcloud').search().then((results) => {
      return this.render('soundcloud/search_results', results);
    });
  }

  static connection() {
    return this.render('soundcloud/connection');
  }

  static get service() {
    return Service.for('soundcloud');
  }
}
