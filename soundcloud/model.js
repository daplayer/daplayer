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
    // Early return for cache hit as the name of the
    // endpoint doesn't match the name of the cache key.
    if (Cache.soundcloud.user_playlists && !href)
      return Cache.soundcloud.user_playlists;

    return this.fetch('playlists', href, 5);
  }

  static likedPlaylists(href) {
    // Normally, the cache check is done in `fetch` but since
    // the endpoint doesn't match with the cache key and since
    // we are doing some extra work for playlists' items, we
    // do the early return inside the method itself.
    if (Cache.soundcloud.liked_playlists && !href)
      return Cache.soundcloud.liked_playlists;

    return this.fetch('playlists/liked_and_owned', href, 5).then((playlists) => {
      var next_href = playlists.next_href;

      var uris = playlists.collection.map((playlist) => {
        return this.fetch(playlist.uri).then((items) => {
          return items.collection;
        });
      });

      return Promise.all(uris).then((items) => {
        return playlists.collection.map((playlist, index) => {
          if (!playlist.icon)
            playlist.icon = items[index].first().icon.size('t300x300');

          playlist.items = items[index];

          return playlist;
        });
      }).then((collection) => {
        return {
          collection: collection,
          next_href:  next_href
        }
      });
    });
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
}

module.exports.mixins();
