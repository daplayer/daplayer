'use strict';

const YouTubeModel = require('./model');

module.exports = class YouTubeController extends BaseController {
  static playlists(token) {
    return YouTubeModel.playlists(token).then((page) => {
      return this.render('youtube/playlists', {
        playlists: page,
        token: token
      })
    })
  }

  static history() {
    return YouTubeModel.history().then((history) => {
      return this.render('youtube/history', {
        history: history
      });
    });
  }

  static likes(token) {
    return YouTubeModel.likes(token).then((page) => {
      return this.render('youtube/likes', {
        likes: page,
        token: token
      });
    })
  }

  static playlistItems(id) {
    return YouTubeModel.playlistItems(id).then((playlist) => {
      return this.render('youtube/playlist', playlist, id);
    });
  }

  static searchResults() {
    return Service.for('youtube').search().then((results) => {
      this.render('youtube/search_results', results);
    });
  }
}
