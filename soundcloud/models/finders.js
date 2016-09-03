'use strict';

module.exports = class SoundCloudModelFinders {
  static findById(id, section, playlist) {
    if (playlist instanceof $)
      return this.findInPlaylist(id, section, playlist.data('id'));
    else if (playlist instanceof Record)
      return this.findInPlaylist(id, section, playlist);
    else
      return this.findRecord(id, section);
  }

  static findPlaylist(playlist_id, section) {
    return this[section.camel()]().then((cached) => {
      return cached.collection.find((playlist) => {
        return playlist.id == playlist_id;
      });
    });
  }

  static findInPlaylist(id, section, playlist_or_id) {
    if (playlist_or_id instanceof Record)
      return Promise.resolve({
        playlist: playlist_or_id,
        record: playlist_or_id.items.filter((record) => {
          if (record.id == id)
            return record;
        })[0]
      });
    else
      return this.findPlaylist(playlist_or_id, section).then((playlist) => {
        return {
          playlist: playlist,
          record: playlist.items.filter((record) => {
            if (record.id == id)
              return record;
          })[0]
        };
      });
  }

  static findRecord(id, section) {
    return this[section.camel()]().then((cache) => {
      return cache.collection.find(record => record.id == id);
    });
  }

  /**
   * Finds all liked records given a field and a query.
   *
   * @param  {String} field - The record's field to do the
   *                          search against.
   * @param  {String} query - The value to look for.
   * @return {Promise}
   */
  static findBy(field, query) {
    var match = value => value.match(new RegExp(query, 'i'));

    return this.likes().then((likes) => {
      return {
        collection: likes.collection.filter(record => match(record[field]))
      };
    });
  }
}
