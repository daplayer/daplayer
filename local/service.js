'use strict';

const LocalModel = require('./model');

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
    media.title  = tags.title;
    media.artist = tags.artist;
    media.genre  = tags.genre;

    require('../app/services/tagging').define(tags.id, tags);

    Notification.show({
      action: Translation.t('meta.actions.tagged'),
      title:  tags.artist ? (tags.title + ' - ' + tags.artist) : tags.title,
      icon:   tags.icon
    });
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
