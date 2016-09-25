'use strict';

const Credentials = require('../app/credentials');
const SC          = require('./client');

module.exports = class SoundCloudModel {
  static mixins() {
    include(SoundCloudModel, '../soundcloud/models/finders');
    include(SoundCloudModel, '../soundcloud/models/fetch');
  }

  static resolve(url) {
    return SC.get('/resolve', {
      url: url,
      client_id: Credentials.soundcloud.client_id
    }).then((result) => {
      return Record.soundcloud(result);
    });
  }

  static activities(href) {
    return this.fetch('activities', href);
  }

  static tracks(href) {
    return this.fetch('tracks', href);
  }

  static likes(href) {
    return this.fetch('likes', href, 20);
  }

  static userPlaylists(href) {
    return this.fetch('playlists', href, 5, 'user_playlists');
  }

  static likedPlaylists(href) {
    return this.fetch('playlists/liked_and_owned', href, 5, 'liked_playlists');
  }

  /**
   * Facility to access to the cached search results that
   * are normally under the `meta` section of the cache.
   *
   * @return {Promise}
   */
  static searchResults() {
    return MetaModel.searchResults().then((hash) => {
      return hash.soundcloud;
    });
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
      var record = Record.soundcloud(hash);

      return this.userPlaylists().then((playlists) => {
        playlists.collection.unshift(record);

        return record;
      });
    });
  }
}

module.exports.mixins();
