'use strict';

const BaseController = require('../app/base/controller')
const LocalModel     = require('./model')

module.exports = class LocalController extends BaseController {
  static singles() {
    return LocalModel.singles().then((singles) => {
      return this.render('local/singles', singles)
    });
  }

  static artists() {
    return LocalModel.artists().then((artists) => {
      return this.render('local/artists', artists)
    });
  }

  static artist(name) {
    return LocalModel.artist(name).then((artist) => {
      return this.render('local/artist', artist, null, name);
    });
  }

  static playlists() {
    return LocalModel.playlists().then((playlists) => {
      return this.render('local/playlists', playlists)
    });
  }

  static searchResults() {
    return Service.for('local').search().then((results) => {
      return this.render('local/search_results', results);
    });
  }
}
