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

  static artist(name) {
    return LocalModel.artist(name).then((artist) => {
      View.render('local/artist', artist);
    });
  }

  static listenLater() {
    return LocalModel.listenLater().then((playlist) => {
      View.render('local/listen_later', {
        records: playlist.items
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
    return Service.for('local').search().then((results) => {
      View.render('local/search_results', results);
    });
  }
}
