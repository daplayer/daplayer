'use strict';

const YouTubeModel = require('./model');

module.exports = class YouTubeController {
  static playlists(page_token) {
    return YouTubeModel.playlists(page_token).then((page) => {
      this.render('youtube/playlists', {
        playlists: page,
        page_token: page_token
      })
    }).then(() => {
      this.loadNextRecords()
    });
  }

  static history(page_token) {
    return YouTubeModel.history(page_token).then((page) => {
      this.render('youtube/history', {
        history: page,
        page_token: page_token
      });
    }).then(() => {
      this.loadNextRecords()
    });
  }

  static likes(page_token) {
    return YouTubeModel.likes(page_token).then((page) => {
      this.render('youtube/likes', {
        likes: page,
        page_token: page_token
      });
    }).then(() => {
      this.loadNextRecords()
    });
  }

  static playlistItems(id) {
    return YouTubeModel.playlists().then((playlists) => {
      return playlists.items.find((playlist) => {
        return playlist.id == id;
      });
    }).then((playlist) => {
      return YouTubeModel.playlistItems(id).then((collection) => {
        var context       = playlist;
            context.items = collection.items;

        this.render('meta/partials/playlist', context);
      });
    });
  }

  static searchResults() {
    return MetaModel.searchResults().then((results) => {
      this.render('youtube/search_results', results);
    });
  }

  static render(view, context, skip_caching) {
    var page_token = context.page_token;
    var meth       = page_token ? 'append' : 'render';

    View[meth](view, context);
  }

  static loadNextRecords() {
    if (Ui.dataShouldBeLoaded())
      Ui.loadNextRecords();
  }
}
