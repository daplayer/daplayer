'use strict';

const BaseController  = require('../app/base/controller')
const SoundCloudModel = require('./model')

module.exports = class SoundCloudController extends BaseController {
  constructor() {
    super()

    this.defineAction('activities')
    this.defineAction('tracks')
    this.defineAction('likes')
    this.defineAction('playlists')

    this.defineSearchAction()
  }

  get module() {
    return 'soundcloud'
  }

  get model() {
    return SoundCloudModel
  }

  get authenticable() {
    return true
  }
}
