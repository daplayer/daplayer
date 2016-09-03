'use strict';

const YT = require('./client');

module.exports = class YouTubeModel {
  static playlists(page_token) {
    if (Cache.youtube.playlists && !page_token)
      return Cache.youtube.playlists;

    return YT.playlists(page_token).then(this.recordify);
  }

  static watchLater(page_token) {
    if (Cache.youtube.watch_later && !page_token)
      return Cache.youtube.watch_later;

    return YT.watchLater(page_token).then(this.recordify);
  }

  static history(page_token) {
    if (Cache.youtube.history && !page_token)
      return Cache.youtube.history;

    return YT.history(page_token).then(this.recordify);
  }

  static playlistItems(id) {
    if (Cache.youtube.playlist_items[id])
      return Cache.youtube.playlist_items[id];

    return YT.items(id, true).then(this.recordify);
  }

  static searchResults() {
    return MetaModel.searchResults().then((hash) => {
      return hash.youtube;
    });
  }

  static findById(id, section, playlist) {
    if (playlist instanceof $)
      return this.findInPlaylist(id, section, playlist.data('id'));
    else if (playlist instanceof Record)
      return this.findInPlaylist(id, section, playlist);
    else
      return this.findRecord(id, section);
  }

  static findInPlaylist(id, section, playlist_or_id) {
    if (playlist_or_id instanceof Record)
      return Promise.resolve({
        playlist: playlist_or_id,
        record: playlist_or_id.items.filter((item) => {
          if (item.id == id)
            return item;
        })[0]
      });
    else
      return this.playlists().then((playlists) => {
        return playlists.items.filter((item) => {
          if (item.id == playlist_or_id)
            return item;
        })[0];
      }).then((playlist) => {
        return this.playlistItems(playlist_or_id).then((hash) => {
          return hash.items.filter((item) => {
            if (item.id == id)
              return item;
          }).map((item) => {
            hash.title = playlist.title;

            return {
              record: item,
              playlist: hash
            };
          })[0];
        });
      });
  }

  static findRecord(id, section) {
    return this[section.camel()]().then((cache) => {
      return cache.items.filter((record) => {
        if (record.id == id)
          return record;
      })[0];
    });
  }

  static recordify(set) {
    return Record.youtube(set);
  }

  static concatenate(existing, fetched) {
    return new Promise((resolve) => {
      // Make sure that our doubly-linked list has
      // the proper links between new elements.
      var last  = existing.items[existing.items.length -1];
      var first = fetched.items[0];

      last.next      = first;
      first.previous = last;

      resolve({
        page_token: fetched.page_token,
        items: existing.items.concat(fetched.items)
      });
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
            items:      data.items.map(result => Record.youtube(result)),
            page_token: results.page_token,
            net:        true
          });
        });
      });
    });
  }
}
