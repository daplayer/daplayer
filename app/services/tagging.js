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
    var pattern = Paths.join(location, '**/*.{mp3,ogg,m4a}');
    var hash    = crypto.createHash('sha1').update(location).digest('hex');

    return new Promise((resolve, reject) => {
      glob(pattern, (err, files) => {
        if (err)
          reject(err);

        var library_file = Paths.join(Paths.user, hash + "-lib.json");
        var file_names   = Paths.join(Paths.user, hash + "-files.json");

        if (!Paths.exists(library_file) || !Paths.exists(file_names)) {
          var library = Tagging.get(files, Paths.covers, callback);

          fs.writeFile(library_file, JSON.stringify(library));
          fs.writeFile(file_names, JSON.stringify(files));

          resolve(library);
        } else {
          fs.readFile(file_names, 'utf-8', (err, content) => {
            var processed = JSON.parse(content);

            var new_files     = files.filter(f => processed.indexOf(f) == -1);
            var removed_files = processed.filter(f => files.indexOf(f) == -1);

            fs.readFile(library_file, (err, content) => {
              var library = JSON.parse(content);

              if (new_files.length)
                Tagging.get(new_files, Paths.covers, library, callback);
              if (removed_files.length)
                this.remove(removed_files, library);

              if (new_files.length || removed_files.length) {
                fs.writeFile(library_file, JSON.stringify(library));
                fs.writeFile(file_names, JSON.stringify(files));
              }

              resolve(library);
            });
          });
        }
      })
    });
  }

  /**
   * Remove all the given files from the given library
   * by first looking inside the different singles and
   * then inside each album's track.
   *
   * This is terribly inefficient.
   *
   * @param  {Array}  files
   * @param  {Object} library
   * @return {null}
   */
  static remove(files, library) {
    // The most-likely scenario is that a single has been
    // removed from the music folder. We should still check
    // if a track hasn't been removed from the album but
    // this should be fairly rare.
    files.forEach((file) => {
      var index = library.singles.findIndex(single => single.id == file);

      if (index != -1)
        return library.singles.splice(index, 1);

      // If we haven't find any single, let's look into each
      // album.
      Object.keys(library.artists).some((name) => {
        var artist = library.artists[name];

        if (!artist.albums)
          return false;

        return Object.keys(artist.albums).find((title) => {
          var album = artist.albums[title];

          return album.find((track, i) => {
            if (track.id == file)
              return album.splice(i, 1);
            else
              return false;
          });
        });
      });
    });
  }
}
