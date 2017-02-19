'use strict';

const YT         = require('./client');
const LocalModel = require('../local/models/playlists');

module.exports = class YouTubeModel {
  static history() {
    if (Cache.youtube.history)
      return Cache.fetch('youtube', 'history');

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
    return this.fetch('items', id, true);
  }

  static fetch(action, token_or_id, full) {
    // Early return if we already have fetched the playlist's
    // items or the given action and we are not trying to
    // load a different page.
    if (action == 'items' && Cache.youtube.items.includes(token_or_id))
      return this.findPlaylist(token_or_id);
    else if (Cache.youtube[action] && !token_or_id)
      return Cache.fetch('youtube', action)

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
      if (action == 'items') {
        return this.findPlaylist(token_or_id).then((playlist) => {
          playlist.items = result.collection;
          playlist.items.forEach(item => item.set = playlist);

          // Keep track of the already-loaded playlists to avoid
          // useless requests.
          Cache.youtube.items.unshift(token_or_id);

          return playlist;
        });
      } else {
        // Add the result to cache; we can safely do this
        // call here as the method would've early returned if no
        // h-ref was provided.
        Cache.add('youtube', action, result);

        return result;
      }
    });
  }

  static findPlaylist(id) {
    return this.playlists().then((playlists) => {
      return playlists.collection.find(item => item.id == id);
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
          var hash = {
            collection: data.items.map(result => Media.youtube(result)),
            next_token: results.next_token,
            net:        true
          };

          Cache.add('youtube', 'search_results', hash);

          resolve(hash);
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
    if (Cache.youtube.items[id])
      Cache.fetch('youtube', 'playlists').then((cached) => {
        var playlist = cached.collection.find(playlist => playlist.id == id);

        playlist.items.push(record);
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
