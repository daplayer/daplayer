'use strict';

module.exports = class SoundCloudModelFinders {
  static findById(id, section, playlist) {
    if (playlist instanceof $)
      return this.findPlaylist(playlist.data('id'), section).then((playlist) => {
        return this.findInPlaylist(id, section, playlist);
      });
    else if (playlist instanceof Playlist)
      return this.findInPlaylist(id, section, playlist);
    else
      return this.findRecord(id, section);
  }

  static findPlaylist(playlist_id, section) {
    return this[section.camel()]().then((cached) => {
      return cached.collection.find(playlist => playlist.id == playlist_id);
    });
  }

  static findInPlaylist(id, section, playlist) {
    return Promise.resolve(playlist.items.find(item => item.id == id));
  }

  static findRecord(id, section) {
    return this[section.camel()]().then((cache) => {
      return cache.collection.find(record => record.id == id);
    });
  }
}
