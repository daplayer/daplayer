'use strict';

const BaseController = require('../app/base/controller')
const YouTubeModel   = require('./model')

module.exports = class YouTubeController extends BaseController {
  constructor() {
    super()

    this.defineAction('history')
    this.defineAction('playlists')
    this.defineAction('likes')

    this.defineSearchAction()
  }

  playlistItems(id) {
    return YouTubeModel.playlistItems(id).then((playlist) => {
      return this.render('youtube/playlist', playlist, null, id)
    });
  }

  get module() {
    return 'youtube'
  }

  get model() {
    return YouTubeModel
  }

  get authenticable() {
    return true
  }
}
