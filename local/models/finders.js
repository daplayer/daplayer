'use strict';

module.exports = class LocalModelFinders {
  /**
   * Finds all records that are tagged under a specific
   * genre. The match is exact here, we are not relying
   * on any sort of regex or Levenstein distance since
   * styles maybe composed of each other (e.g. core and
   * hardcore, which are mostly different).
   *
   * @return {Object}
   */
  static findByGenre(value) {
    return this.singles().then((singles) => {
      return singles.filter((record) => {
        if (record.genre.toLowerCase() == value.toLowerCase())
          return record;
      });
    }).then((singles) => {
      return this.albums().then((albums) => {
        return albums.filter((album) => {
          if (album.items.first().genre.toLowerCase() == value.toLowerCase())
            return album;
        });
      }).then((albums) => {
        return {
          albums:  albums,
          singles: singles
        }
      });
    });
  }

  static findByArtist(value) {
    var query = new RegExp(value, 'i');

    return this.singles().then((singles) => {
      return singles.filter((record) => {
        if (record.artist.match(query))
          return record;
      });
    }).then((singles) => {
      return this.albums().then((albums) => {
        return albums.filter((album) => {
          if (album.items.first().artist.match(query))
            return album;
        });
      }).then((albums) => {
        return {
          albums:  albums,
          singles: singles
        }
      });
    });
  }

  static findByTitle(value) {
    var query = new RegExp(value, 'i');

    return this.files().then((files) => {
      return files.filter((file) => {
        if (file.title.match(query))
          return file;
      });
    }).then((singles) => {
      return this.albums().then((albums) => {
        return albums.filter((album) => {
          if (album.title.match(query))
            return album;
        })
      }).then((albums) => {
        return {
          albums:  albums,
          singles: singles
        };
      })
    });
  }

  static findById(id, section, playlist) {
    if (playlist instanceof $)
      return this.findPlaylist(playlist).then((playlist) => {
        return this.findInPlaylist(id, playlist);
      });
    else if (playlist instanceof Record)
      return this.findInPlaylist(id, playlist);
    else
      return this.findRecord(id, section);
  }

  static findPlaylist(element) {
    var id = element.data('id');

    if (typeof id === 'string' && id.includes('album'))
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
      record:   playlist.items.find((item) => {
        return item.id == id;
      })
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
