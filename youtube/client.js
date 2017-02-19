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
   * @param  {String}  resource - The YouTube data API endpoint.
   * @param  {Object=} options  - Some options.
   * @return {null}
   */
  static fetch(resource, options) {
    // Refresh the token whenever we try to hit the API but
    // the current access token is no longer valid.
    return Service.for('youtube').connect().then(() => {
      // Mapping between resource and options
      var mapping = {
        channels:  { part: 'snippet,contentDetails', mine: true },
        items:     { part: 'snippet' },
        search:    { part: 'snippet' },
        playlists: { part: 'snippet,contentDetails' },
        videos:    { part: 'snippet,contentDetails'}
      };

      if (!options)
        options = mapping[resource];
      else
        Object.assign(options, mapping[resource])

      // Shorthand for playlistItems
      if (resource == 'items')
        resource = 'playlistItems';

      options.access_token = Credentials.user.youtube.access_token;

      var url  = this.url.data + resource;
      var body = ''

      return new Promise((resolve, reject) => {
        var req = request.get(url, { qs: options })

        req.on('data', chunck => body += chunck)
        req.on('end', () => resolve(JSON.parse(body)))
        req.on('error', (e) => reject(e))
      })
    });
  }

  /**
   * Fetches a given resource recursively stopping once there
   * is enough data to fill the screen.
   *
   * @param  {String} resource   - The resource passed to `fetch`.
   * @param  {Object} options    - Options delegated to `fetch`.
   * @param  {Array=} collection - Already fetched collection.
   * @return {Promise}
   */
  static fetchWithLimit(resource, options, collection) {
    if (!collection)
      collection = []

    return this.fetch(resource, options).then((data) => {
      collection = collection.concat(data.items)
      options.pageToken = data.nextPageToken

      if (data.nextPageToken && collection.length < Ui.pageSize('video'))
        return this.fetchWithLimit(resource, options, collection)
      else
        return {
          nextPageToken: data.nextPageToken,
          items: collection
        }
    })
  }

  /**
   * Fetches a given playlist until all its items have been
   * fetched.
   *
   * @param  {String}  id         - The playlist's id.
   * @param  {String=} token      - The current page token.
   * @param  {Array=}  collection - Already fetched items.
   * @return {Promise}
   */
  static fetchFull(id, token, collection) {
    var options = { playlistId: id, pageToken: token }

    if (!collection)
      collection = []

    return this.fetch('items', options).then((data) => {
      collection = collection.concat(data.items)

      if (data.nextPageToken)
        return this.fetchFull(id, data.nextPageToken, collection)
      else
        return {
          id: id,
          items: collection,
          nextPageToken: data.nextPageToken
        }
    })
  }

  /**
   * Facility to insert an element inside a playlist given its
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
   * Facility to create a playlist on YouTube given
   * a title.
   *
   * @param  {String} title - The playlist's title.
   * @return {Promise}
   */
  static create(title) {
    return new Promise((resolve, reject) => {
      var options = {
        url: this.url.data + 'playlists',
        qs: {
          part: 'snippet'
        },
        json: {
          snippet: {
            title: title
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
          resolve(body);
      });
    });
  }

  /**
   * Returns the list of playlists that the user owns.
   *
   * @param  {String=} token - The next page token.
   * @return {Promise}
   */
  static playlists(token) {
    var options = { mine: true, pageToken: token }

    return this.fetchWithLimit('playlists', options)
  }

  /**
   * Returns the liked videos playlist items.
   *
   * @param  {String=} token - The page token.
   * @return {Promise}
   */
  static likes(token) {
    var id = Config.youtube.related_playlists.likes

    return this.items(id, false, token)
  }

  /**
   * Fetches the items of a given playlist.
   *
   * @param  {String}  id    - The playlist's id.
   * @param  {Bool=}   full  - Whether all items should be fetched.
   * @param  {String=} token - The next page token.
   * @return {Promise}
   */
  static items(id, full, token) {
    var options = { pageToken: token, playlistId: id }

    if (full)
      var promise = this.fetchFull(id, token)
    else
      var promise = this.fetchWithLimit('items', options)

    return promise.then((items) => {
      var ids = items.items.map(item => item.snippet.resourceId.videoId)

      return this.fetch('videos', { id: ids.join(",") }).then((data) => {
        data.nextPageToken = items.nextPageToken
        data.id            = id

        return data
      })
    })
  }

  /**
   * Searches for records given a query.
   *
   * @param  {String} query - The value to look for.
   * @return {Promise}
   */
  static search(query) {
    return this.fetch('search', { q: query, part: 'snippet' })
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
