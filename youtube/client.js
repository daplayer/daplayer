'use strict';

const Credentials = require('../app/credentials');
const request     = require('request');


module.exports = class YT {
  /**
   * Convenient place to store the different URLs that are
   * given by the YouTube Data API or just related to YouTube.
   *
   * @return {Object}
   */
  static get url() {
    return {
      token:  'https://accounts.google.com/o/oauth2/token',
      auth:   'https://accounts.google.com/o/oauth2/auth',
      data:   'https://www.googleapis.com/youtube/v3/',
      revoke: 'https://accounts.google.com/b/0/IssuedAuthSubTokens',
      info:   'http://www.youtube.com/get_video_info',
      mp3:    'http://youtube-mp3.org/',
      watch:  'https://www.youtube.com/watch?v='
    }
  }

  /**
   * Facility to fetch data from the YouTube API.
   *
   * @param  {String}           resource - The YouTube data API endpoint.
   * @param  {Object=|Function} options  - Some options or the callback.
   * @param  {Function=}        callback - The callback function.
   * @return {null}
   */
  static fetch(resource, options, callback) {
    // Refresh the token whenever we try to hit the API but
    // the current access token is no longer valid.
    YouTubeService.connect();

    // Mapping between resource and options
    var mapping = {
      channels:  { part: 'snippet,contentDetails', mine: true },
      items:     { part: 'snippet' },
      search:    { part: 'snippet' },
      playlists: { part: 'snippet,contentDetails' },
      videos:    { part: 'snippet,contentDetails'}
    };

    if (!callback) {
      callback = options;
      options  = mapping[resource];
    } else {
      Object.assign(options, mapping[resource]);
    }

    // Shorthand for playlistItems
    if (resource == 'items')
      resource = 'playlistItems';

    options.access_token = Credentials.user.youtube.access_token;

    var url = this.url.data + resource;

    // Send the request with the parameters
    request.get(url, { qs: options }, (error, response, body) => {
      if (error)
        console.error(error);

      callback(JSON.parse(body));
    });
  }

  /**
   * Facility to insert an element inside a playlist gven its
   * id.
   *
   * @param  {String} playlist_id - The playlist's id.
   * @param  {String} record_id   - The element to add's id.
   * @return {Promise}
   */
  static insert(playlist_id, record_id) {
    return new Promise((resolve, reject) => {
      var options  = {
        url: this.url.data + 'playlistItems',
        qs: {
          part: 'snippet',
          key:  Credentials.youtube.client_id
        },
        json: {
          snippet: {
            playlistId: playlist_id,
            resourceId: {
              videoId: record_id,
              kind: 'youtube#video'
            }
          }
        },
        headers: {
          Authorization: 'Bearer ' + Credentials.user.youtube.access_token
        }
      };

      request.post(options, (err, res, body) => {
        if (err)
          reject(err);

        if (body.error)
          reject(body.error);
        else
          resolve(true);
      });
    });
  }

  /**
   * Returns the list of playlists that the user owns.
   *
   * @param  {String=} page_token - The page token.
   * @return {Promise}
   */
  static playlists(page_token) {
    return new Promise((resolve) => {
      var options = { mine: true };

      if (page_token)
        options.pageToken = page_token;

      this.fetch('playlists', options, (data) => {
        resolve({
          page_token: data.nextPageToken,
          items: data.items
        });
      });
    });
  }

  /**
   * Returns the "History" playlist items.
   *
   * @param  {String=} page_token - The page token.
   * @return {Promise}
   */
  static history(page_token) {
    return YT.items(Config.youtube.related_playlists.watchHistory, false, page_token);
  }

  /**
   * Returns the liked videos playlist items.
   *
   * @param  {String=} page_token - The page token.
   * @return {Promise}
   */
  static likes(page_token) {
    return YT.items(Config.youtube.related_playlists.likes, false, page_token);
  }

  /**
   * Facility to fetch items of a specific playlist. By
   * default it will only fetch the 5 first items if the `full`
   * parameter is not specified. Otherwise, it will fetch
   * all the playlist items.
   *
   * @param  {String}  id         - The playlist's id.
   * @param  {Bool=}   full       - Specify whether we want to
   *                                load the full playlist or not.
   * @param  {String=} page_token - The next page token.
   * @param  {Array=}  collection - Holds the collection as we
   *                                call the method recursively.
   * @return {Promise}
   */
  static fetchItems(id, full, page_token, collection) {
    return new Promise((resolve) => {
      var options = { playlistId: id };

      if (page_token)
        options.pageToken = page_token;

      if (!collection)
        collection = [];

      this.fetch('items', options, (data) => {
        collection = collection.concat(data.items);

        if (data.nextPageToken && full)
          this.fetchItems(id, full, data.nextPageToken, collection).then((data) => {
            resolve(data);
          });
        else
          resolve({
            id: id,
            items: collection,
            page_token: data.nextPageToken
          });
      });
    });
  }

  /**
   * Fetches the different fields related to a list of items.
   *
   * @param  {String}  id         - The playlist's id.
   * @param  {Bool=}   full       - Delegated to `fetchItems`.
   * @param  {String=} page_token - Delegated to `fetchItems`.
   * @return {Promise}
   */
  static items(id, full, page_token) {
    return new Promise((resolve) => {
      this.fetchItems(id, full, page_token).then((collection) => {
        page_token = collection.page_token;

        return collection.items.map((item) => {
          return item.snippet.resourceId.videoId;
        });
      }).then((ids) => {
        this.fetch('videos', { id: ids.join(",") }, (data) => {
          data.page_token = page_token;
          data.id         = id;
          resolve(data);
        });
      });
    });
  }

  /**
   * Searches for records given a query.
   *
   * @param  {String} query - The value to look for.
   * @return {Promise}
   */
  static search(query) {
    return new Promise((resolve) => {
      this.fetch('search', { q: query, part: 'snippet' }, (data) => {
        resolve(data);
      })
    });
  }

  /**
   * Fetches the related playlists attached to the current
   * account and stores them inside the configuration file
   * and the cache.
   *
   * It saves us from a request, everytime we want to access
   * to the user's related playlists and they aren't going to
   * change anytime.
   *
   * @return {null}
   */
  static fetchRelatedPlaylists() {
    this.fetch('channels', (data) => {
      let playlists = data.items[0].contentDetails.relatedPlaylists;

      Config.store('youtube', 'related_playlists', playlists);
    });
  }
}
