'use strict';

const Credentials = require('../app/credentials');
const SC          = require('./client');

module.exports = class SoundCloudModel {
  static mixins() {
    include(SoundCloudModel, '../soundcloud/models/fetch');
  }

  static activities(token) {
    return this.fetch('activities', token);
  }

  static tracks(token) {
    return this.fetch('tracks', token);
  }

  static likes(token) {
    return this.fetch('likes', token, 20);
  }

  static playlists(token) {
    return this.fetch('playlists/liked_and_owned', token, 5, 'playlists');
  }

  /**
   * Adds an element to a playlist given its id and updates
   * the cache accordingly.
   *
   * @param  {Number} id     - The playlist's id.
   * @param  {Record} record - The element to add.
   * @return {Promise}
   */
  static addToPlaylist(id, record) {
    return this.userPlaylists().then((cached) => {
      var playlist = cached.collection.find(record => record.id == id);
      var items    = playlist.items;

      items.push(record);

      return SC.insert(playlist, record.id);
    });
  }

  /**
   * Creates a brand new playlist given a title. This methods
   * delegates to the client and updates the cache accordingly.
   *
   * @param  {String} title - The playlist's title.
   * @return {Promise}
   */
  static createPlaylist(title) {
    return SC.create(title).then((hash) => {
      var record = Playlist.soundcloud(hash);

      return this.userPlaylists().then((playlists) => {
        playlists.collection.unshift(record);

        return record;
      });
    });
  }
}

module.exports.mixins();
