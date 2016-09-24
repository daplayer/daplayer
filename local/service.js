'use strict';

const LocalModel = require('./model');
const Tagging    = require('daplayer-tagging');

module.exports = class LocalService {
  static tag(location, hash) {
    Tagging.set(location, hash);

    if (Cache.current.module != 'local')
      return;

    var body = hash.title;

    if (hash.artist)
      body += ' - ' + hash.artist;

    new Notification(Translation.t('meta.actions.tagged'), {
      body: body,
      icon: hash.image
    });

    var element = $(`.music[data-id="${hash.id.replace('"', "\\\"")}"]`);

    var title_span  = element.find('.title');
    var artist_link = element.find('.artist');

    title_span.html(hash.title);
    title_span.attr('title', hash.title);

    artist_link.html(hash.artist);
    artist_link.attr('title', hash.artist);
    artist_link.data('id', hash.artist);

    LocalModel.findRecord(hash.id, Cache.current.action).then((record) => {
      record.title  = hash.title;
      record.artist = hash.artist;
      record.genre  = hash.genre;
    });
  }

  static tags(location) {
    return Tagging.get(location, Paths.covers);
  }

  /**
   * Searches dispatching to the model's methods depending
   * on the syntax used by the user.
   *
   * @param  {String} value - The value to look for.
   * @return {Promise}
   */
  static search(value) {
    if (value.startsWith('#'))
      return LocalModel.findBy('genre', value.slice(1));
    else if (value.startsWith('@'))
      return LocalModel.findBy('artist', value.slice(1));
    else
      return LocalModel.findBy('title', value);
  }
}
