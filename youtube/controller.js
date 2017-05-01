'use strict';

const BaseController = require('../app/base/controller')
const YouTubeModel   = require('./model')

module.exports = class YouTubeController extends BaseController {
  static playlists(token) {
    return YouTubeModel.playlists(token).then((page) => {
      return this.render('youtube/playlists', page, token)
    })
  }

  static history() {
    return YouTubeModel.history().then((history) => {
      return this.render('youtube/history', history)
    })
  }

  static likes(token) {
    return YouTubeModel.likes(token).then((page) => {
      return this.render('youtube/likes', page, token)
    })
  }

  static playlistItems(id) {
    return YouTubeModel.playlistItems(id).then((playlist) => {
      return this.render('youtube/playlist', playlist, null, id)
    });
  }

  static searchResults() {
    return Service.for('youtube').search().then((results) => {
      return this.render('youtube/search_results', results)
    });
  }

  static connection() {
    return this.render('youtube/connection', {});
  }

  static get service() {
    return Service.for('youtube');
  }
}
