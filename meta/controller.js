'use strict';

module.exports = class MetaController extends BaseController {
  static index() {
    return this.render('meta/index', {});
  }

  static configuration() {
    return this.render('meta/configuration', {
      soundcloud: {
        connected: Service.for('soundcloud').isConnected()
      },
      youtube: {
        connected: Service.for('youtube').isConnected()
      }
    });
  }

  static downloads() {
    return this.render('meta/downloads', {
      downloads: Downloads.queue,
      history:   Downloads.history
    });
  }
}
