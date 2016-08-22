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
    return Cache.soundcloud[section].then((cache) => {
      return cache.collection.filter((record) => {
        if (record.id == id)
          return record;
      })[0];
    });
  }

  static search(query) {
    return SC.get('/tracks', { q: query }).then((net_results) => {
      return this.findBy('title', query).then((by_title) => {
        return {
          owned: by_title,
          net_results: net_results.map((result) => {
            return Record.fromSoundCloud(result)
          })
        };
      });
    }).then((structure) => {
      return this.findBy('artist', query).then((by_artist) => {
        structure.owned = structure.owned.concat(by_artist);
        structure.owned = structure.owned.filter((e, i) => {
          if (structure.owned.indexOf(e) == i)
            return e;
        });

        return structure;
      });
    });
  }

  static findBy(field, query) {
    return this.likes().then((likes) => {
      return Promise.all(likes.collection.filter((record) => {
        if (record[field].match(new RegExp(query, 'i')))
          return record;
      }));
    });
  }
}
