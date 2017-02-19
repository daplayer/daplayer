'use strict';

/**
 * This class manages some application logic.
 */
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
      // By default we assume that the player's window
      // is the focused one.
      this.focused = true;

      $(document).ready(on_ready);
    });
  }

  /**
   * Makes sure that we have the necessary files created when
   * we run the application (e.g. for the first time or if
   * the user accidentally deleted the "cache" folder).
   *
   * @return {null}
   */
  static ensurePathsExist() {
    const Paths = require('./paths')

    Paths.to_make.forEach((folder) => {
      if (!Paths.exists(folder))
        Paths.mkdir(folder);
    })

    if (!Paths.exists('youtube_history'))
      Paths.touchYouTubeHistory()
  }
}
