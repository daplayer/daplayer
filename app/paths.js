'use strict';

const path = require('path');

module.exports = class Paths {
  /**
   * Delegates to `path#join`.
   *
   * @return {String}
   */
  static join() {
    return path.join.apply(this, arguments);
  }

  /**
   * Delegates to `path#resolve`.
   *
   * @return {String}
   */
  static resolve(location) {
    return path.resolve(location);
  }

  /**
   * Path to the project's root.
   *
   * @return {String}
   */
  static get root() {
    if (!process.resourcesPath)
      return path.resolve('');
    else if (process.resourcesPath.indexOf('node_modules') != -1)
      return path.resolve('');
    else
      return path.join(process.resourcesPath, 'app');
  }

  /**
   * Path to the user's data folder (e.g. "/home/john/.player").
   *
   * @return {String}
   */
  static get user() {
    var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];

    return path.join(home, '.player');
  }

  /**
   * Path to the default artwork image.
   *
   * @return {String}
   */
  static get default_artwork() {
    return 'assets/images/default_artwork.svg'
  }

  /**
   * Path to the folder containing cover images.
   *
   * @return {String}
   */
  static get covers() {
    return path.join(this.user, 'covers');
  }

  /**
   * Path to the file storing our SQLite3 database.
   *
   * @return {String}
   */
  static get database() {
    return path.join(this.user, 'playlists.sqlite3');
  }
}
