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

  static watchLater(page_token) {
    return YouTubeModel.watchLater(page_token).then((page) => {
      this.render('youtube/watch_later', {
        watch_later: page,
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

        if (!Cache.youtube.playlist_items[id])
          Cache.add('youtube', 'playlist_items', collection);

        this.render('meta/partials/playlist', context, true);
      });
    });
  }

  static searchResults() {
    return MetaModel.searchResults().then((results) => {
      this.render('youtube/search_results', results, true);
    });
  }

  static render(view, context, skip_caching) {
    var page_token = context.page_token;
    var meth       = page_token ? 'append' : 'render';

    View[meth](view, context);

    if (skip_caching)
      return;

    for (var key in context) {
      if (key == 'page_token')
        continue;

      if (!Cache.youtube[key] || page_token)
        Cache.add('youtube', key, context[key]);
    }
  }

  static loadNextRecords() {
    if (Ui.dataShouldBeLoaded())
      Ui.loadNextRecords();
  }
}
