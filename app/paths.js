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
   * Path to the user's folder.
   *
   * @return {String}
   */
  static get home() {
    if (process.platform == 'win32')
      return process.env['USERPROFILE'];
    else
      return process.env['HOME'];
  }

  /**
   * Inferred path containing the user's musics.
   *
   * @return {String}
   */
  static get music_folder() {
    if (this.exists(path.join(this.home, 'My Music')))
      return path.join(this.home, 'My Music');
    else if (this.exists(path.join(this.home, 'Music')))
      return path.join(this.home, 'Music');
    else if (this.exists(path.join(this.home, 'Musique')))
      return path.join(this.home, 'Musique');
    else
      return '';
  }

  /**
   * Path to the user's data folder (e.g. "/home/john/.daplayer").
   *
   * @return {String}
   */
  static get user() {
    return path.join(this.home, '.daplayer');
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
   * Path to the folder containing artist images.
   *
   * @return {String}
   */
  static get artists() {
    return path.join(this.user, 'artists');
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
   * Path to the "YouTube History" playlist file
   *
   * @return {String}
   */
  static get youtube_history() {
    return path.join(this.youtube, 'history.jspf');
  }

  /* Local path to the SoundCloud-related data.
   *
   * @return {String}
   */
  static get soundcloud() {
    return path.join(this.user, 'soundcloud');
  }

  /* Local path to the YouTube-related data.
   *
   * @return {String}
   */
  static get youtube() {
    return path.join(this.user, 'youtube');
  }

  /* Local path to the local-related data.
   *
   * @return {String}
   */
  static get local() {
    return path.join(this.user, 'local');
  }

  /**
   * List of paths to ensure are created when the application
   * boots up as we may try to access to them.
   *
   * @return {Array}
   */
  static get to_make() {
    return ['user', 'covers', 'playlists', 'soundcloud', 'local', 'youtube'];
  }

  /**
   * Check whether a given path exists or not.
   *
   * `Paths.exists('user')` will return true only if
   * `Paths.user` exists on the file system.
   *
   * `Paths.exists('/home/jacky/foo.mp3')` will return true
   * if the file exists on system.
   *
   * @param  {String} location - The getter to call or a
   *                             full path.
   * @return {Boolean}
   */
  static exists(location) {
    location = path.isAbsolute(location) ? location : this[location];

    // Swallowing an error can be pretty expensive but this
    // allows us to block the event loop and do check in-line
    // instead of passing a callback.
    try {
      fs.accessSync(location, fs.F_OK);
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
   * Touches the JSPF file for the YouTube history.
   *
   * We are not relying on the `LocalModel#savePlaylist` method
   * as this would do extra computation to guess the file name
   * and we want to save this file synchronously to avoid race
   * conditions plus we don't have to require anything else
   * apart from this file in the `main.js` one.
   *
   * @return {null}
   */
  static touchYouTubeHistory() {
    fs.writeFileSync(this.youtube_history, JSON.stringify({
      title: 'history',
      track: []
    }));
  }

  /**
   * Returns the exact file's path to store a
   * file that's going to be downloaded based on
   * the title, the artist and the service.
   *
   * @param  {String}  title     - The media's title.
   * @param  {String}  artist    - The media's artist.
   * @param  {String}  service   - The download service.
   * @param  {String=} extension - The file's extension.
   * @return {String}
   */
  static for(title, artist, service, extension) {
    var folder    = Config.read(service, 'download');
    var file_name = title + (extension || ".mp3");

    // Include the artist if there's none already
    // specified (i.e. if there's no '-').
    if (title.indexOf(' - ') == -1 && service == 'soundcloud')
      file_name = artist + ' - ' + file_name;

    return this.join(folder, file_name);
  }
}
