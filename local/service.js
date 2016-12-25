'use strict';

const LocalModel = require('./model');
const glob       = require('glob');
const fs         = require('fs');

module.exports = class LocalService {
  /**
   * Delegates to `TaggingService#define` and properly
   * updates the record in the cache.
   *
   * @param  {Media}  media
   * @param  {Object} tags
   * @return {null}
   */
  static tag(media, tags) {
    // We require the file from inside the function
    // since requiring it from the top of the file
    // would produce errors running test as the library
    // would be built against the wrong Chromium version.
    const TaggingService = require('../app/services/tagging');

    TaggingService.loadLibrary().then((existing) => {
      // We remove any occurence of the previous media
      // from the library.
      existing.library.remove([media.id]);

      // Then we change its tags on disk
      TaggingService.define(media.id, tags);

      // Then read its tags from disk so the library
      // will properly creates a new artist if needed, etc.
      existing.library.get([media.id], Paths.covers);

      // Then we bust the cache.
      Model.for('local').processFiles(existing.library);

      // Finally, we save the new library to disk.
      fs.writeFile(TaggingService.library_file, JSON.stringify(existing.library));
    });

    Notification.show({
      action: I18n.t('meta.actions.tagged'),
      title:  tags.artist ? (tags.title + ' - ' + tags.artist) : tags.title,
      icon:   tags.icon
    });
  }

  /**
   * Returns a list of the images stored inside the artist
   * arts folder.
   *
   * @return {Promise}
   */
  static artistArts() {
    if (!Cache.local.artist_arts) {
      var pattern = Paths.join(Paths.artists, '*.{jpeg,jpg,png}');
      Cache.local.artist_arts = glob.sync(pattern);
    }

    return Cache.local.artist_arts;
  }

  /**
   * Searches dispatching to the model's methods depending
   * on the syntax used by the user.
   *
   * @return {Promise}
   */
  static search() {
    var query = Cache.search.query;

    if (query.startsWith('#'))
      return LocalModel.findBy('genre', query.slice(1));
    else
      return LocalModel.findBy('title', query);
  }
}
