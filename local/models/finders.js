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
      var match = (record) => { return record[field].toLowerCase() == query.toLowerCase() };
    else
      var match = (record) => { return record[field].match(new RegExp(query, 'i')) };

    return Promise.resolve({}).then((results) => {
      return this.singles().then((singles) => {
        results.singles = singles.filter(match);

        return results;
      }).then((results) => {
        this.artists().then((artists) => {
          results.artists = []
          results.albums  = [];

          artists.forEach((artist) => {
            if (artist.name.match(new RegExp(query, 'i')))
              results.artists.push(artist);

            artist.albums.forEach((album) => {
              if (match(album))
                results.albums.push(album);

              // There may be eponymous musics (e.g. 'All Hope Is Gone')
              // so we want to look for every files *and* albums. But when
              // we are searching by artist or genre, we want the album as
              // a whole, not every single music.
              if (field == 'title')
                results.singles = results.singles.concat(album.items.filter(match));
            });
          });
        });

        Cache.add('local', 'search_results', results);

        return results;
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
      return this.artist(element.data('artist')).then((artist) => {
        return artist.albums.find(album => album.id == element.data('id'));
      });
    else
      return this.playlists().then((playlists) => {
        return playlists.find((playlist) => {
          return playlist.id == element.data('id');
        });
      });
  }

  static findInPlaylist(id, playlist) {
    return Promise.resolve(playlist.items.find(item => item.id == id));
  }

  static findRecord(id, section) {
    // If we are hitting these lines, we know for sure that
    // the user wants to play a single because otherwise,
    // the record would've been found by the `findById` method.

    // If the user is on an artist page, we just need to look
    // first inside all the artists to find the current one.
    if (section == 'artist')
      section = 'artists';

    return this[section.camel()]().then((cached) => {
      if (section == 'artists')
        return cached.find(artist => artist.name == Cache.current.id).singles
                     .find(single => single.id == id);
      else if (section == 'search_results')
        return cached.singles.find(record => record.id == id);
      else
        return cached.find(record => record.id == id);
    });
  }
}
