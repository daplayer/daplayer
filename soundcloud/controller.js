'use strict';

const BaseController  = require('../app/base/controller')
const SoundCloudModel = require('./model')

module.exports = class SoundCloudController extends BaseController {
  static activities(token) {
    return SoundCloudModel.activities(token).then((activities) => {
      return this.render('soundcloud/activities', activities, token)
    });
  }

  static tracks(token) {
    return SoundCloudModel.tracks(token).then((tracks) => {
      return this.render('soundcloud/tracks', tracks, token)
    });
  }

  static likes(token) {
    return SoundCloudModel.likes(token).then((likes) => {
      return this.render('soundcloud/likes', likes, token)
    });
  }

  static playlists(token) {
    return SoundCloudModel.playlists(token).then((playlists) => {
      return this.render('soundcloud/playlists', playlists, token)
    })
  }

  static searchResults() {
    return Service.for('soundcloud').search().then((results) => {
      return this.render('soundcloud/search_results', results);
    });
  }

  static connection() {
    return this.render('soundcloud/connection', {});
  }

  static get service() {
    return Service.for('soundcloud');
  }
}
