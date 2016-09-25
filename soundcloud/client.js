'use strict';

const request     = require('request');
const Credentials = require('../app/credentials');

module.exports = class SC {
  static get url() {
    return {
      default:    'https://soundcloud.com',
      signin:     'https://soundcloud.com/signin',
      signout:    'https://soundcloud.com/logout',
      me:         `https://api-v2.soundcloud.com/users/${Credentials.user.soundcloud.user_id}/`,
      activities: 'https://api-v2.soundcloud.com/stream',
      search:     'https://api-v2.soundcloud.com/search',
      playlists:  'https://api-v2.soundcloud.com/playlists'
    };
  }

  static activities(href) {
    var options = {
      url: href || this.url.activities,
      qs: {
        user_urn:  'soundcloud:users:' + Credentials.user.soundcloud.user_id,
        client_id: Credentials.soundcloud.client_id,
        app_id:    Credentials.soundcloud.app_id,
        limit:     10
      },
      headers: {
        Authorization: Credentials.user.soundcloud.oauth_token,
        Origin:        this.url.default
      }
    };

    return this.resolve(options);
  }

  static fetch(endpoint, offset, limit) {
    if (endpoint == 'activities')
      return this.activities(offset);

    var url;

    if (endpoint.startsWith('http'))
      url = endpoint;
    else
      url = this.url.me + endpoint;

    if (endpoint == 'playlists')
      url = url.replace('api-v2', 'api');

    var options = {
      url: url,
      qs: {
        client_id: Credentials.soundcloud.client_id,
        app_id:    Credentials.soundcloud.app_id,
        offset:    offset,
        limit:     limit || 10
      },
      headers: {
        Authorization: Credentials.user.soundcloud.oauth_token,
        Origin:        this.url.default
      }
    };

    return this.resolve(options);
  }

  static stream(id) {
    var options = {
      url: `https://api.soundcloud.com/i1/tracks/${id}/streams`,
      qs: {
        client_id: Credentials.soundcloud.client_id,
        app_id:    Credentials.soundcloud.app_id
      },
      headers: {
        Origin: this.url.default
      }
    };

    return this.resolve(options).then((response) => {
      return response.http_mp3_128_url;
    })
  }

  /**
   * Performs a get to the `search` endpoint on the SoundCloud
   * API to find records that the user doesn't have in their
   * collection.
   *
   * @param  {String} value - The value to look for.
   * @return {Promise}
   */
  static search(value) {
    var options = {
      url: this.url.search,
      qs: {
        q:         value,
        limit:     10,
        client_id: Credentials.soundcloud.client_id,
        app_id:    Credentials.soundcloud.app_id
      },
      headers: {
        Authorization: Credentials.user.soundcloud.oauth_token,
        Origin:        this.url.default
      }
    };

    return this.resolve(options);
  }

  static resolve(options) {
    return new Promise((resolve, reject) => {
      var response   = '';
      var req_object = request.get(options);

      req_object.on('data', (chunck) => {
        response += chunck;
      });

      req_object.on('end', () => {
        resolve(JSON.parse(response));
      });

      req_object.on('error', (e) => {
        reject(e);
      });
    });
  }

  /**
   * Facility to insert an element inside a playlist given
   * the playlist and the record's id.
   *
   * @param  {Record} playlist  - The playlist to update.
   * @param  {Number} record_id - The record to add's id.
   * @return {Promise}
   */
  static insert(playlist, record_id) {
    return new Promise((resolve, reject) => {
      var tracks = playlist.items.map(record => record.id);

      tracks.push(record_id);

      var options = {
        url: this.url.playlists + '/' + playlist.id,
        method: 'PUT',
        qs: {
          client_id:   Credentials.soundcloud.client_id,
          app_version: Credentials.soundcloud.app_id
        },
        json: {
          playlist: {
            tracks: tracks
          }
        },
        headers: {
          Authorization: Credentials.user.soundcloud.oauth_token,
          Origin:        this.url.default
        }
      };

      request(options, (err, res, body) => {
        if (err)
          reject(err);

        resolve(true);
      });
    });
  }

  /**
   * Facility to create a playlist on SoundCloud given
   * a title.
   *
   * @param  {String} title - The playlist's title.
   * @return {Promise}
   */
  static create(title) {
    return new Promise((resolve, reject) => {
      var options = {
        url: this.url.playlists,
        method: 'POST',
        qs: {
          client_id:   Credentials.soundcloud.client_id,
          app_version: Credentials.soundcloud.app_id
        },
        json: {
          playlist: {
            title:          title,
            sharing:        'public',
            duration:       0,
            tracks:         [],
            _resource_type: 'playlist'
          }
        },
        headers: {
          Authorization: Credentials.user.soundcloud.oauth_token,
          Origin:        this.url.default
        }
      };

      request(options, (err, res, body) => {
        if (err)
          reject(err);

        resolve(body);
      });
    });
  }
}
