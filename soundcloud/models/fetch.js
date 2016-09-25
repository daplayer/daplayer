'use strict';

const SC = require('../client');

module.exports = class SoundCloudModelFetch {
  static fetch(action, href, limit, cache_key) {
    if (Cache.soundcloud[cache_key || action] && !href)
      return Cache.soundcloud[cache_key || action];

    if (href && action == 'activities')
      var offset = href;
    else if (href)
      var offset = href.split(/&|=/)[1];
    else
      var offset = null;

    return SC.fetch(action, offset, limit).then((response) => {
      var collection;

      // Here, we are rather dealing with a normal V2 API result
      // (i.e. with a `collection` and `next_href` field) or rather
      // fetching a liked playlist (from V2 as well) which has a
      // `tracks` field or finally, with a V1 API call for the user's
      // playlists.
      if (response.collection)
        collection = response.collection.slice();
      else if (response.tracks)
        collection = response.tracks;
      else
        collection = response;

      return {
        next_token: response.next_href,
        collection: collection.map((record, i, t) => {
          if (action == 'activities') {
            if (record.track)
              var hash = record.track;
            else if (record.playlist)
              var hash = record.playlist;

            hash.origin = record.user;
            hash.type   = record.type;

            return Record.soundcloud(hash);
          } else {
            if (record.track)
              return Record.soundcloud(record.track);
            else if (cache_key == 'user_playlists' || record.title)
              return Record.soundcloud(record);
            else if (cache_key == 'liked_playlists' && record.type == 'playlist-like')
              return Record.soundcloud(record.playlist);
          }
        }).filter((record) => {
          if (record)
            return record;
        }).map(MetaModel.mapRecords)
      };
    }).then((result) => {
      // If we are fetching liked playlists, SoundCloud is only
      // giving us the URI to fetch their items so we need to do
      // some extra work to get them.
      if (cache_key == 'liked_playlists') {
        var collections = result.collection.map((playlist) => {
          return this.fetch(playlist.uri).then(items => items.collection);
        });

        return Promise.all(collections).then((items) => {
          return result.collection.map((playlist, index) => {
            if (!playlist.icon)
              playlist.icon = items[index].first().icon.size('t300x300');

            playlist.items = items[index];

            return playlist;
          });
        }).then((collection) => {
          return {
            collection: collection,
            next_token: result.next_token
          }
        });
      } else {
        return result;
      }
    }).then((result) => {
      // Add the computed result to cache; we can safely do this
      // call here as the method would've early returned if no
      // h-ref was provided.
      Cache.add('soundcloud', (cache_key || action), result);

      return result;
    }).catch((e) => {
      throw e;
    });
  }

  /**
   * Performs a search directly on SoundCloud rather than in
   * the user's collection and allows us to deal with
   * instances of `Record` rather than JSON hashes.
   *
   * @param  {String} value - The value to look for.
   * @return {Promise}
   */
  static netSearch(value) {
    return SC.search(value).then((results) => {
      return {
        collection: results.collection.map(record => Record.soundcloud(record)),
        next_token: results.next_href,
        net:        true
      }
    });
  }
}
