'use strict';

const LocalModel = require('./model');
const fs         = require('fs');

module.exports = class LocalService {
  /**
   * Delegates to the `defineTags` method and displays
   * a notification once everything is done.
   *
   * @param  {Media}  media
   * @param  {Object} tags
   * @return {null}
   */
  static tag(media, tags) {
    this.defineTags(media, tags).then(() => {
      Notification.show({
        action: I18n.t('meta.actions.tagged'),
        title:  tags.artist ? (tags.title + ' - ' + tags.artist) : tags.title,
        icon:   tags.icon
      });
    });
  }

  /**
   * Renames an artist inside the library, making sure that
   * all of their files are properly re-tagged and asking
   * the user for confirmation before merging two artists.
   *
   * @param  {String}  name     - Current artist's name.
   * @param  {String}  new_name - Possible new name.
   * @return {Promise}
   */
  static rename(name, new_name) {
    return Model.for('local').artists().then((artists) => {
      if (artists.find(a => a.name.downcase() == new_name.downcase()))
        return Ui.Dialog.confirm(name, new_name);
      else
        return true;
    }).then((changed) => {
      if (!changed)
        return false;

      return Model.for('local').artists().then((artists) => {
        var collection = artists.find(a => a.name.downcase() == name.downcase())
                                .flatten();
        var files      = collection.map(r => r.id);

        return this.defineTags(files, {
          artist: new_name
        }, true).then(() => {
          Ui.loaded();

          return true;
        });
      });
    });
  }

  /**
   * Redefines the tags on disk of a single record or a whole
   * collection of files.
   *
   * This rougly delete all the given files from the library,
   * changes their tags on disk and then update the library
   * through `get` and bust the cache.
   *
   * @param  {Media|Array} file_or_set - The file(s) to tag.
   * @param  {Object}      tags        - The tags to associate.
   * @param  {Boolean=}    feedback    - Whether to display the
   *                                     current progress or not.
   * @return {Promise}
   */
  static defineTags(file_or_set, tags, feedback) {
    if (file_or_set instanceof Array)
      var collection = file_or_set;
    else
      var collection = [file_or_set.id];

    // We require the file from inside the function
    // since requiring it from the top of the file
    // would produce errors running test as the library
    // would be built against the wrong Chromium version.
    const TaggingService = require('../app/services/tagging');

    return TaggingService.loadLibrary().then((existing) => {
      // We remove any occurence of the previous media(s)
      // from the library.
      existing.library.remove(collection);

      // Then we change its tags on disk
      collection.forEach((id, index) => {
        if (feedback) {
          Page.loading('local.feedback.tagging', {
            current: index+1,
            total:   collection.length
          });
        }

        TaggingService.define(id, tags);
      });

      // Then read its tags from disk so the library
      // will properly creates a new artist if needed, etc.
      existing.library.get(collection, Paths.covers);

      // Then we bust the cache.
      Model.for('local').processFiles(existing.library);

      // Finally, we save the new library to disk.
      fs.writeFile(TaggingService.library_file, JSON.stringify(existing.library));

      return true;
    });
  }

  /**
   * Fetches all the unknown artist arts.
   *
   * @param  {Array} artists - All the artists.
   * @return {null}
   */
  static fetchUnknownArtists(artists) {
    var known   = Object.keys(Service.for('artist_arts').arts());
    var unknown = artists.filter(a => !known.includes(a.name));

    if (unknown.length)
      require('../app/services/artist_arts').fetchArtists(unknown);
  }

  /**
   * Copies a given file as an artist's art.
   *
   * @param  {String} file   - The file's location.
   * @param  {String} artist - The artist's name.
   * @return {null}
   */
  static copy(file, artist) {
    var location = Paths.join(Paths.artists, artist + '.jpeg');

    fs.createReadStream(file).pipe(fs.createWriteStream(location));
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
