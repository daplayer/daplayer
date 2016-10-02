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

      // Here, we are either dealing with a normal V2 API result
      // (i.e. with a `collection` and `next_href` field) or either
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
        collection: collection.map((record) => {
          if (action == 'activities')
            return new Activity(record);
          else if (cache_key == 'user_playlists')
            return Playlist.soundcloud(record);
          else if (cache_key == 'liked_playlists' && record.type == 'playlist-like')
            return Playlist.soundcloud(record.playlist);
          else if (record.track)
            return Media.soundcloud(record.track);
          else if (record.title)
            return Media.soundcloud(record);
        }).filter(record => record)
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
          result.collection.forEach((playlist, index) => {
            playlist.items = items[index];
            playlist.items.forEach(item => item.set = playlist);
          });

          return {
            collection: result.collection,
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
        collection: results.collection.map(record => Media.soundcloud(record)),
        next_token: results.next_href,
        net:        true
      }
    });
  }
}
