module.exports = class Application {
  /**
   * Handles all the necessary initializations and loads
   * before the application can properly boot-up (i.e.
   * register all its event handlers).
   *
   *
   * @param  {Function} on_ready - The function to call once
   *                               the application is ready.
   * @return {Promise}
   */
  static boot(on_ready) {
    return Promise.all([
      Cache.initialize(),
      Player.initialize(),
      I18n.load(Config.meta.locale),
      Service.for('youtube').connect()
    ]).then(() => {
      $(document).ready(on_ready);
    });
  }
}
