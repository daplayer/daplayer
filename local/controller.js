'use strict';

const LocalModel = require('./model');

module.exports = class LocalController {
  static singles() {
    return LocalModel.singles().then((singles) => {
      View.render('local/singles', {
        singles: singles,
      });
    });
  }

  static albums() {
    return LocalModel.albums().then((albums) => {
      View.render('local/albums', {
        albums: albums
      })
    });
  }

  static artists() {
    return LocalModel.artists().then((artists) => {
      View.render('local/artists', {
        artists: artists
      })
    });
  }

  static listenLater() {
    return LocalModel.listenLater().then((records) => {
      View.render('local/listen_later', {
        records: records
      });
    })
  }

  static playlists() {
    return LocalModel.playlists().then((playlists) => {
      View.render('local/playlists', {
        playlists: playlists
      });
    });
  }

  static searchResults() {
    return MetaModel.searchResults().then((results) => {
      View.render('local/search_results', results);
    });
  }
}
