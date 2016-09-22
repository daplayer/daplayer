'use strict';

const fs   = require('fs');
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
   * Path to the folder containing playlists.
   *
   * @return {String}
   */
  static get playlists() {
    return path.join(this.user, 'playlists');
  }

  /**
   * Paths to the "Listen later" playlist file.
   *
   * @return {String}
   */
  static get listen_later() {
    return path.join(this.playlists, 'listen-later.jspf');
  }

  /**
   * Check whether a given path exist or not. We are just
   * refering to the name of the getter in this object,
   * we are not giving an actual path.
   *
   * `Paths.exists('user')` will return true only if
   * `Paths.user` exists on the file system.
   *
   * @param  {String} name - The getter to call.
   * @return {Boolean}
   */
  static exists(name) {
    // Swallowing an error can be pretty expensive but this
    // allows us to block the event loop and do check in-line
    // instead of passing a callback.
    try {
      fs.accessSync(this[name], fs.F_OK);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Creates a new directory getting the wanted path
   * delegating to the given getter's name.
   *
   * `Paths.mkdir('user')` will create the `Paths.user`
   * folder.
   *
   * We are relying on the synchronous counter-part of
   * `mkdir` since we want to block the event loop
   * creating folders.
   *
   * @param  {String} name - The getter to call.
   * @return {null}
   */
  static mkdir(name) {
    fs.mkdirSync(this[name]);
  }

  /**
   * Touches the JSPF file for the "Listen later" playlist.
   *
   * We are not relying on the `LocalModel#savePlaylist` method
   * as this would do extra computation to guess the file name
   * and we want to save this file synchronously to avoid race
   * conditions plus we don't have to require anything else
   * apart from this file in the `main.js` one.
   *
   * @return {null}
   */
  static touchListenLaterFile() {
    fs.writeFileSync(this.listen_later, JSON.stringify({
      title: 'Listen later',
      track: []
    }));
  }
}
