'use strict';

const YouTubeModel = require('./model');

module.exports = class YouTubeController {
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
    return YouTubeModel.findPlaylist(id).then((playlist) => {
      return YouTubeModel.playlistItems(id).then((collection) => {
        var context       = playlist;
            context.items = collection.collection;

        this.render('meta/partials/playlist', context);
      });
    });
  }

  static searchResults() {
    return MetaModel.searchResults().then((results) => {
      this.render('youtube/search_results', results);
    });
  }

  static render(view, context) {
    var token = context.token;
    var meth  = token ? 'append' : 'render';

    View[meth](view, context);
  }

  static loadNextRecords() {
    if (Ui.dataShouldBeLoaded())
      Ui.loadNextRecords();
  }
}
