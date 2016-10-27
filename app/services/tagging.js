'use strict';

const Tagging = require('daplayer-tagging');
const Paths   = require('../paths');
const glob    = require('glob');

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
   * a given folder location.
   *
   * @param  {String}   location - The folder location.
   * @param  {Function} callback - Callback to call each time
   *                               an audio file has been read.
   * @return {Promise}
   */
  static extract(location, callback) {
    var pattern = Paths.join(location, '**/*.{mp3,ogg,m4a}');

    return new Promise((resolve, reject) => {
      glob(pattern, (err, files) => {
        if (err)
          reject(err);

        resolve(Tagging.get(files, Paths.covers, callback));
      })
    });
  }
}
