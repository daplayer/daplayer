'use strict';

const BaseController = require('../app/base/controller');

module.exports = class MetaController extends BaseController {
  index() {
    return this.render('meta/index', {});
  }

  configuration() {
    return this.render('meta/configuration', {
      soundcloud: {
        connected: Service.for('soundcloud').isConnected()
      },
      youtube: {
        connected: Service.for('youtube').isConnected()
      }
    });
  }

  downloads() {
    return this.render('meta/downloads', {
      downloads: Downloads.queue,
      history:   Downloads.history
    });
  }
}
