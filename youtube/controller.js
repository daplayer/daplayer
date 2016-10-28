'use strict';

const YouTubeModel = require('./model');

module.exports = class YouTubeController extends BaseController {
  static playlists(token) {
    return YouTubeModel.playlists(token).then((page) => {
      this.render('youtube/playlists', {
        playlists: page,
        token: token
      })
    }).then(() => {
      this.loadNextRecords()
    });
  }

  static history() {
    return YouTubeModel.history().then((history) => {
      this.render('youtube/history', {
        history: history
      });
    });
  }

  static likes(token) {
    return YouTubeModel.likes(token).then((page) => {
      this.render('youtube/likes', {
        likes: page,
        token: token
      });
    }).then(() => {
      this.loadNextRecords()
    });
  }

  static playlistItems(id) {
    return YouTubeModel.playlistItems(id).then((playlist) => {
      this.render('meta/partials/set_box', playlist);
    });
  }

  static searchResults() {
    return Service.for('youtube').search().then((results) => {
      this.render('youtube/search_results', results);
    });
  }

  static loadNextRecords() {
    if (Ui.dataShouldBeLoaded())
      Ui.loadNextRecords();
  }
}
