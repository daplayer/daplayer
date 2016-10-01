'use strict';

module.exports = class LocalModelFinders {
  /**
   * Finds all records given a field and a value.
   *
   * For search by tags, the match is exact, we are not
   * relying on any sort of regex or Levenstein distance
   * since styles maybe composed of each other (e.g. core
   * and hardcore, which are mostly different).
   *
   * @param  {String} field - The record's field to do the
   *                          search against.
   * @param  {String} query - The value to look for.
   * @return {Promise}
   */
  static findBy(field, query) {
    if (field == 'genre')
      var match = (value) => { return value.toLowerCase() == query.toLowerCase() };
    else
      var match = (value) => { return value.match(new RegExp(query, 'i')) };

    // When we are searching by title, we may have eponymous musics
    // (e.g. 'All Hope Is Gone') so we want to look for every files
    // *and* albums. But when we are searching by artist or genre,
    // we don't want musics coming from albums.
    var source = field == 'title' ? this.files() : this.singles();

    return source.then((singles) => {
      return singles.filter(record => match(record[field]));
    }).then((singles) => {
      return this.albums().then((albums) => {
        return albums.filter(album => match(album[field]));
      }).then((albums) => {
        return {
          albums:  albums,
          singles: singles
        }
      });
    });
  }

  static findById(id, section, playlist) {
    if (playlist instanceof $)
      return this.findPlaylist(playlist).then((playlist) => {
        return this.findInPlaylist(id, playlist);
      });
    else if (playlist instanceof Playlist)
      return this.findInPlaylist(id, playlist);
    else
      return this.findRecord(id, section);
  }

  static findPlaylist(element) {
    if (element.data('album'))
      return this.albums().then((albums) => {
        return albums.find((album) => {
          return album.id == element.data('id');
        });
      });
    else
      return this.playlists().then((playlists) => {
        return playlists.find((playlist) => {
          return playlist.id == element.data('id');
        });
      });
  }

  static findInPlaylist(id, playlist) {
    return Promise.resolve({
      playlist: playlist,
      record:   playlist.items.find(item => item.id == id)
    });
  }

  static findRecord(id, section) {
    return this[section.camel()]().then((cached) => {
      // If we are trying to find a record on the search page
      // and we are hitting these lines, it's because no playlists
      // were given so we are just searching for a single.
      if (section == 'search_results')
        return cached.singles.find((record) => {
          return record.id == id;
        });
      else
        return cached.find((record) => {
          return record.id == id;
        });
    }).then((record) => {
      if (record.album) {
        return this.albums().then((albums) => {
          return {
            record: record,
            playlist: albums.find((album) => {
              return record.album  == album.title
                  && record.artist == album.items.first().artist;
            })
          };
        });
      } else {
        return record;
      }
    });
  }
}
