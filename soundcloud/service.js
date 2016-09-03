'use strict';

const SoundCloudModel = require('./model');
const Credentials     = require('../app/credentials');
const SubWindow       = require('../app/sub_window');
const querystring     = require('querystring');
const request         = require('request');
const Tagging         = require('daplayer-tagging');
const SC              = require('./client');

module.exports = class SoundCloudService {
  /**
   * Shorthand to check whether the user account is connected.
   *
   * @return {Boolean}
   */
  static isConnected() {
    return Credentials.user.soundcloud.connected;
  }

  /**
   * Opens up a window that allows the user to specify their
   * credentials; then we read cookies and store the different
   * pieces of information that we need to use the API.
   *
   * @return {null}
   */
  static signin() {
    var auth_window = new SubWindow(1050, 540);
    var processed   = false;

    auth_window.load(SC.url.signin);
    auth_window.show();

    auth_window.on('redirect', (event, old_url, new_url) => {
      // We need to keep track of a `processed` variable to check
      // whether we already stored the token or not because several
      // redirects happen but we just want to store the credentials
      // once and destroy the window.
      if (new_url.includes('stream&ref=https') && !processed) {
        if (processed || auth_window.isDestroyed())
          return;

        var cookies = auth_window.webContents.session.cookies;
        var filters = { url: SC.url.default, name: 'oauth_token' };
          processed = true;

        cookies.get(filters, (error, cookies) => {
          let credentials = {
            connected:   true,
            oauth_token: 'OAuth ' + cookies[0].value,
            user_id:     cookies[0].value.split("-")[2]
          };

          Credentials.store('soundcloud', credentials);

          auth_window.close();
        });
      }
    });
  }

  /**
   * Disconnects the SoundCloud account from the application
   * by going to the sign-out url on SoundCloud and removing
   * the SoundCloud credentials in the local storage.
   *
   * @return {null}
   */
  static signout() {
    var auth_window = new SubWindow();
    var processed   = false;

    auth_window.load(SC.url.signout);

    auth_window.on('redirect', () => {
      if (processed || auth_window.isDestroyed())
        return;

      processed = true;

      Credentials.remove('soundcloud');
      auth_window.close();
    });
  }

  /**
   * Downloads the MP3 of a song based on its id. The other
   * parameters are only specified to display a notification
   * when the download begins/ends and for tagging purposes.
   *
   * @param  {String} id     - The song's id.
   * @param  {String} title  - The song's title.
   * @param  {String} artist - The song's artist.
   * @param  {String} genre  - The song's genre.
   * @param  {String} icon   - The song's icon.
   * @return {null}
   */
  static download(id, title, artist, genre, icon) {
    var hash = {
      id:     id,
      title:  title,
      artist: artist,
      icon:   icon
    };

    Downloads.enqueue(hash);
    Ui.downloadStart(hash);

    this.stream_url(id).then((url) => {
      var size, remaining;
      var location = Formatter.path(title, artist, 'soundcloud');

      MetaService.download(url, location, (request) => {
        request.on('response', (response) => {
          size      = response.headers['content-length'];
          remaining = size;

          Downloads.grow(size);
        });

        request.on('data', (chunck) => {
          remaining = remaining - chunck.length;

          Downloads.progress(chunck.length);
          Ui.downloadProgress(id, (size - remaining) / size * 100);
        });

        request.on('end', () => {
          Ui.downloadEnd(Downloads.dequeue(id));

          MetaService.downloadImage(icon, title, artist, (icon_path) => {
            Tagging.set(location, {
              title:  title,
              artist: artist,
              genre:  genre,
              icon:   icon_path
            });
          });
        });
      });
    });
  }

  /**
   * Delegates to the SoundCloud's client's `stream` method.
   *
   * @return {Promise}
   */
  static stream_url(id) {
    return SC.stream(id);
  }

  /**
   * Searches dispatching to the model's methods depending
   * on the syntax used by the user.
   *
   * If the source is 'local', then it will look for the
   * user's likes.
   *
   * If the source is 'internet', then it will look for records
   * directly on SoundCloud (mostly matching the behavior of
   * the SoundCloud's search bar).
   *
   * @param  {String} query  - The value to look for.
   * @param  {String} source - The source to look in.
   * @return {Promise}
   */
  static search(query, source) {
    if (source == 'internet')
      return SoundCloudModel.netSearch(query);

    if (query.startsWith('#'))
      return SoundCloudModel.findBy('tags', query.slice(1), source);
    else if (query.startsWith('@'))
      return SoundCloudModel.findBy('artist', query.slice(1), source);
    else
      return SoundCloudModel.findBy('title', query, source);
  }
}
