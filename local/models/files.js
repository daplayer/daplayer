'use strict';

module.exports = class LocalModelFiles {
  static files(section) {
    if (Cache.local[section])
      return Cache.local[section];

    return new Promise((resolve, reject) => {
      const cp    = require('child_process');
      const child = cp.fork(`${__dirname}/../files.js`, [Config.local.path]);

      child.on('message', (message) => {
        if (message instanceof Array)
          return Ui.fileProcessProgress(message);

        this.processFiles(message).then((collection) => {
          resolve(collection[section]);
        });
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Properly instantiates records based on the given hash.
   * The hash values are just plain objects but we want to
   * be able to deal with instances of `Album`, `Artist` and
   * `Media`.
   *
   * @param  {Object} hash - The hash returned by the tagging
   *                         library.
   * @return {Promise}
   */
  static processFiles(hash) {
    return new Promise((resolve, reject) => {
      var singles = hash.singles.map((single) => {
        return Media.local(single);
      });

      var artists = Object.keys(hash.artists).map((name) => {
        var raw_hash = hash.artists[name]
        var artist   = new Artist(raw_hash.name, raw_hash.albums);

        artist.singles = singles.filter(s => s.artist.toLowerCase() == name);

        return artist;
      });

      Cache.add('local', 'singles', singles.sortBy('title'));
      Cache.add('local', 'artists', artists.sortBy('name'));

      resolve({ singles: singles, artists: artists });
    });
  }

  /**
   * Returns all the singles stored inside the user's music
   * folder.
   *
   * @return {Promise}
   */
  static singles() {
    return this.files('singles');
  }

  /**
   * Returns all the artists stored inside the user's music
   * folder with all their know albums and singles attached.
   *
   * @return {Promise}
   */
  static artists() {
    return this.files('artists');
  }

  /**
   * Returns an artist given their name.
   *
   * @param  {String} name - The artist's name.
   * @return {Promise}
   */
  static artist(name) {
    return this.artists().then((artists) => {
      return artists.find(artist => artist.name == name);
    });
  }
}
