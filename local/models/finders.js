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

        return results;
      });
    });
  }
}
