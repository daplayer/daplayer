'use strict';

const Credentials = require('../app/credentials');
const SC          = require('./client');

module.exports = class SoundCloudModel {
  static activities(token) {
    return this.fetch('activities', token);
  }

  static tracks(token) {
    return this.fetch('tracks', token);
  }

  static likes(token) {
    return this.fetch('likes', token, 20);
  }

  static playlists(token) {
    return this.fetch('playlists/liked_and_owned', token, 5, 'playlists');
  }

  /**
   * Adds an element to a playlist given its id and updates
   * the cache accordingly.
   *
   * @param  {Number} id     - The playlist's id.
   * @param  {Record} record - The element to add.
   * @return {Promise}
   */
  static addToPlaylist(id, record) {
    return this.userPlaylists().then((cached) => {
      var playlist = cached.collection.find(record => record.id == id);
      var items    = playlist.items;

      items.push(record);

      return SC.insert(playlist, record.id);
    });
  }

  /**
   * Creates a brand new playlist given a title. This methods
   * delegates to the client and updates the cache accordingly.
   *
   * @param  {String} title - The playlist's title.
   * @return {Promise}
   */
  static createPlaylist(title) {
    return SC.create(title).then((hash) => {
      var record = Playlist.soundcloud(hash);

      return this.userPlaylists().then((playlists) => {
        playlists.collection.unshift(record);

        return record;
      });
    });
  }

  /**
   * Fetches data relative to a specific action.
   *
   * This method is the entry point with the client class. It
   * processes results returned by the client and instantiates
   * the appropriate model class.
   *
   * As for playlists, it also fetches all of its items.
   *
   * @param  {String}  action    - The API endpoint.
   * @param  {String=} href      - Next token or href.
   * @param  {Number}  limit     - The number of elements to fetch.
   * @param  {String=} cache_key - An optional cache_key if it is
   *                               different from the endpoint.
   * @return {Promise}
   */
  static fetch(action, href, limit, cache_key) {
    if (Cache.soundcloud[cache_key || action] && !href)
      return Cache.fetch('soundcloud', (cache_key || action))

    if (href && action == 'activities')
      var offset = href
    else if (href)
      var offset = href.split(/&|=/)[1]
    else
      var offset = null

    return SC.fetch(action, offset, limit).then((response) => {
      var collection

      // Here, we are either dealing with a normal API result
      // (i.e. with a `collection` and `next_href` field) or either
      // fetching a playlist's items response which has a `tracks`
      // field.
      if (response.collection)
        collection = response.collection.slice()
      else
        collection = response.tracks

      return {
        next_token: response.next_href,
        collection: collection.map((record) => {
          if (action == 'activities')
            return new Activity(record)
          else if (cache_key == 'playlists')
            return Playlist.soundcloud(record.playlist)
          else if (record.track)
            return Media.soundcloud(record.track)
          else if (record.title)
            return Media.soundcloud(record)
        }).filter(record => record)
      }
    }).then((result) => {
      // If we are fetching playlists, SoundCloud is only giving
      // us the URI to fetch their items so we need to do some
      // extra work to get them.
      //
      // As for playlists in the news feed (i.e. activities),
      // SoundCloud will actually only fetch as many items in
      // as the specified `limit` query parameter.
      //
      // Thus, for playlists that have more than 10 items, we need
      // to take their URL, fetch the items and associate them with
      // the in-memory representation of the set.
      //
      // It is required to fetch the playlist items for playlists
      // fetched through the `playlists/liked_and_owned` endpoint.
      if (cache_key == 'playlists' || action == 'activities') {
        if (cache_key == 'playlists')
          var collection = result.collection
        else
          var collection = result.collection.map(e => e.item)
                                 .filter(e => e instanceof Playlist)
                                 .filter(p => p.track_count > 5)

        var collections = collection.map((playlist) => {
          return this.fetch(playlist.uri, null, playlist.track_count)
                     .then(items => items.collection)
        })

        return Promise.all(collections).then((items) => {
          collection.forEach((playlist, index) => {
            playlist.items = items[index]
            playlist.items.forEach(item => item.set = playlist)
          })

          return result
        })
      } else {
        return result
      }
    }).then((result) => {
      // Add the computed result to cache; we can safely do this
      // call here as the method would've early returned if no
      // h-ref was provided.
      Cache.add('soundcloud', (cache_key || action), result)

      return result
    })
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
      var hash = {
        collection: results.collection.map(record => Media.soundcloud(record)),
        next_token: results.next_href
      }

      Cache.add('soundcloud', 'search_results', hash)

      return hash
    })
  }
}
