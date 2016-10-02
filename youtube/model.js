'use strict';

const YT         = require('./client');
const LocalModel = require('../local/models/playlists');

module.exports = class YouTubeModel {
  static history() {
    if (Cache.youtube.history)
      return Cache.youtube.history;

    return LocalModel.loadPlaylist(Paths.youtube_history).then((history) => {
      return Cache.add('youtube', 'history', history);
    });
  }

  static addToHistory(record) {
    return this.history().then((history) => {
      var last_ten = history.items.slice(0, 9);

      if (last_ten.map(i => i.id).includes(record.id))
        return;

      history.items.unshift(record);

      return LocalModel.savePlaylist(history);
    });
  }

  static playlists(token) {
    return this.fetch('playlists', token);
  }

  static likes(token) {
    return this.fetch('likes', token);
  }

  static playlistItems(id) {
    return this.fetch('items', id, 'playlist_items', true);
  }

  static fetch(action, token_or_id, cache_key, full) {
    // Early return if we already
    if (action == 'items' && Cache.youtube.playlist_items[token_or_id])
      return Cache.youtube.playlist_items[token_or_id];
    else if (Cache.youtube[cache_key || action] && !token_or_id)
      return Cache.youtube[cache_key || action];

    return YT[action](token_or_id, full).then((set) => {
      return {
        id:         set.id,
        next_token: set.nextPageToken,
        collection: set.items.map((record) => {
          if (action == 'playlists')
            return Playlist.youtube(record);
          else
            return Media.youtube(record);
        })
      };
    }).then((result) => {
      // Add the result to cache; we can safely do this
      // call here as the method would've early returned if no
      // h-ref was provided.
      Cache.add('youtube', (cache_key || action), result);

      return result;
    });
  }

  static searchResults() {
    return MetaModel.searchResults().then((hash) => {
      return hash.youtube;
    });
  }

  static findById(id, section, playlist) {
    if (playlist instanceof $)
      return this.findPlaylist(playlist.data('id')).then((playlist) => {
        return this.findInPlaylist(id, section, playlist);
      });
    else if (playlist instanceof Playlist)
      return this.findInPlaylist(id, section, playlist);
    else
      return this.findRecord(id, section);
  }

  static findPlaylist(id) {
    return this.playlists().then((playlists) => {
      return playlists.collection.find(item => item.id == id);
    });
  }

  static findInPlaylist(id, section, playlist) {
    return Promise.resolve({
      playlist: playlist,
      record:   playlist.items.find(item => item.id == id)
    });
  }

  static findRecord(id, section) {
    return this[section.camel()]().then((cache) => {
      if (section == 'history')
        return cache.items.find(record => record.id == id);
      else
        return cache.collection.find(record => record.id == id);
    });
  }

  /**
   * Performs a search directly on YouTube rather than in
   * the user's collection and allows us to deal with
   * instances of `Record` rather than JSON hashes.
   *
   * @param  {String} value - The value to look for.
   * @return {Promise}
   */
  static netSearch(value) {
    return new Promise((resolve, reject) => {
      return YT.search(value).then((results) => {
        var ids = results.items.map(item => item.id.videoId);

        return YT.fetch('videos', { id: ids.join(",") }, (data) => {
          resolve({
            collection: data.items.map(result => Media.youtube(result)),
            next_token: results.next_token,
            net:        true
          });
        });
      });
    });
  }

  /**
   * Adds an element to a playlist given its id and updates
   * the cache accordingly.
   *
   * @param  {String} id     - The playlist's id.
   * @param  {Record} record - The element to add.
   * @return {Promise}
   */
  static addToPlaylist(id, record) {
    if (Cache.youtube.playlist_items[id])
      Cache.youtube.playlist_items[id].then((cached) => {
        cached.items.push(record);
      });

    return YT.insert(id, record.id);
  }

  /**
   * Creates a brand new playlist given a title. This methods
   * delegates to the client and updates the cache accordingly.
   *
   * @param  {String} title - The playlist's title.
   * @return {Promise}
   */
  static createPlaylist(title) {
    return YT.create(title).then((hash) => {
      var record = Playlist.youtube(hash);

      return this.playlists().then((playlists) => {
        playlists.items.unshift(record);

        return record;
      });
    });
  }
}
