'use strict';

const LocalModel = require('./model');

module.exports = class LocalController extends BaseController {
  static singles() {
    return LocalModel.singles().then((singles) => {
      return this.render('local/singles', {
        singles: singles,
      });
    });
  }

  static artists() {
    return LocalModel.artists().then((artists) => {
      return this.render('local/artists', {
        artists: artists
      })
    });
  }

  static artist(name) {
    return LocalModel.artist(name).then((artist) => {
      return this.render('local/artist', artist, name);
    });
  }

  static listenLater() {
    return LocalModel.listenLater().then((playlist) => {
      return this.render('local/listen_later', {
        records: playlist.items
      });
    })
  }

  static playlists() {
    return LocalModel.playlists().then((playlists) => {
      return this.render('local/playlists', {
        playlists: playlists
      });
    });
  }

  static searchResults() {
    return Service.for('local').search().then((results) => {
      return this.render('local/search_results', results);
    });
  }
}
