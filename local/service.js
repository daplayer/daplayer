'use strict';

const LocalModel = require('./model');
const Tagging    = require('daplayer-tagging');

module.exports = class LocalService {
  static tag(location_or_media, hash) {
    if (location_or_media instanceof Media) {
      // Update the record in cache.
      location_or_media.title  = hash.title;
      location_or_media.artist = hash.artist;
      location_or_media.genre  = hash.genre;

      Tagging.set(hash.id, hash);

      Notification.show({
        action: Translation.t('meta.actions.tagged'),
        title:  hash.artist ? (hash.title + ' - ' + hash.artist) : hash.title,
        icon:   hash.icon
      });
    } else {
      Tagging.set(location_or_media, hash);
    }
  }

  static tags(location) {
    return Tagging.get(location, Paths.covers);
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
    else if (query.startsWith('@'))
      return LocalModel.findBy('artist', query.slice(1));
    else
      return LocalModel.findBy('title', query);
  }
}
