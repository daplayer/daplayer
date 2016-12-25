'use strict';

const Tagging = require('daplayer-tagging');
const Paths   = require('../paths');
const crypto  = require('crypto');
const glob    = require('glob');
const fs      = require('fs');

module.exports = class TaggingService {
  /**
   * Defines the tag of a given media or file location.
   *
   * If an instance of `Media` is given, its id is taken
   * to update the audio tags on the file system and its
   * properties are properly update.
   *
   * If a file location is given, the tags are properly
   * updated on the file system.
   *
   * @param  {String} location
   * @param  {Object} tags
   * @return {null}
   */
  static define(location, tags) {
    Tagging.set(location, tags);
  }

  /**
   * Extracts the audio tags of all files contained inside
   * a given folder location and cache them on the file
   * system to make reading a folder faster it has already
   * been processed once.
   *
   * @param  {String}   location - The folder location.
   * @param  {Function} callback - Callback to call each time
   *                               an audio file has been read.
   * @return {Promise}
   */
  static extract(location, callback) {
    this.location = location;

    var pattern = Paths.join(location, '**/*.{mp3,ogg,m4a}');

    return new Promise((resolve, reject) => {
      glob(pattern, (err, files) => {
        if (err)
          reject(err);

        if (!Paths.exists(this.library_file) || !Paths.exists(this.file_names)) {
          var library = new Tagging.Library();

          library.get(files, Paths.covers, callback);

          fs.writeFile(this.library_file, JSON.stringify(library));
          fs.writeFile(this.file_names, JSON.stringify(files));

          resolve(library);
        } else {
          this.loadLibrary().then((existing) => {
            var library = existing.library;

            var new_files     = files.filter(f => existing.files.indexOf(f) == -1);
            var removed_files = existing.files.filter(f => files.indexOf(f) == -1);

            if (new_files.length)
              library.get(new_files, Paths.covers, callback);
            if (removed_files.length)
              library.remove(removed_files);

            if (new_files.length || removed_files.length) {
              fs.writeFile(this.library_file, JSON.stringify(library));
              fs.writeFile(this.file_names, JSON.stringify(files));
            }

            resolve(library);
          }).catch((e) => {
            console.log(e);
          });
        }
      })
    });
  }

  /**
   * Loads the library files (i.e. the hash and the files array).
   * It relies on the `file_names` and `library_file` getters to
   * determine which files should be read.
   *
   * @return {Promise}
   */
  static loadLibrary() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.file_names, 'utf-8', (err, content) => {
        if (err)
          reject(err);

        var files = JSON.parse(content);

        fs.readFile(this.library_file, (err, content) => {
          if (err)
            reject(err);

          var library = JSON.parse(content);

          resolve({
            files:   files,
            library: new Tagging.Library(library)
          });
        });
      });
    });
  }

  /**
   * Returns a SHA-1 version of the user's music folder path.
   *
   * This is handy as it always generate the same output with
   * the same string and we don't have to handle OS specific
   * disparities (like slash on *nix and and back-slash on
   * Windows).
   *
   * @return {String}
   */
  static get hash() {
    if (!this._hash) {
      if (typeof Config !== 'undefined')
        var location = Config.local.path;
      else
        var location = this.location;

      this._hash = crypto.createHash('sha1').update(location).digest('hex');
    }

    return this._hash;
  }

  /**
   * Returns the absolute path to the JSON file containing
   * the already-computed music library.
   *
   * @return {String}
   */
  static get library_file() {
    return Paths.join(Paths.user, this.hash + "-lib.json");
  }

  /**
   * Returns the absolute path to the JSON file containing
   * the already-computed music files.
   *
   * @return {String}
   */
  static get file_names() {
    return Paths.join(Paths.user, this.hash + "-files.json");
  }
}
