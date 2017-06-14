'use strict';

const BaseController = require('../app/base/controller')
const LocalModel     = require('./model')

module.exports = class LocalController extends BaseController {
  constructor() {
    super()

    this.defineAction('singles')
    this.defineAction('artists')
    this.defineAction('playlists')

    this.defineSearchAction()
  }

  artist(name) {
    return LocalModel.artist(name).then((artist) => {
      return this.render('local/artist', artist, null, name)
    })
  }

  get module() {
    return 'local'
  }

  get model() {
    return LocalModel
  }

  get authenticable() {
    return false
  }
}
