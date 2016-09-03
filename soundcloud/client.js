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
      search:     'https://api-v2.soundcloud.com/search'
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

    return new Promise((resolve, reject) => {
      var response = "";
      var req      = request.get(options);

      req.on('data', (chunck) => {
        response += chunck;
      });

      req.on('end', () => {
        resolve(JSON.parse(response));
      });

      req.on('error', (e) => {
        reject(e);
      });
    });
  }

  static fetch(endpoint, offset, limit) {
    if (endpoint == 'activities')
      return this.activities(offset);

    var url;

    if (endpoint.startsWith('http'))
      url = endpoint;
    else
      url = this.url.me + endpoint;

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

    return new Promise((resolve, reject) => {
      var response = "";
      var req      = request.get(options);

      req.on('data', (chunck) => {
        response += chunck;
      });

      req.on('end', () => {
        resolve(JSON.parse(response));
      });

      req.on('error', (e) => {
        reject(e);
      });
    });
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

    return new Promise((resolve, reject) => {
      var response = "";
      var req      = request.get(options)

      req.on('data', (chunck) => {
        response += chunck;
      });

      req.on('end', () => {
        resolve(JSON.parse(response).http_mp3_128_url);
      });

      req.on('error', (e) => {
        reject(e);
      });
    });
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
    return new Promise((resolve, reject) => {
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

      var response = '';
      var req      = request.get(options);

      req.on('data', (chunck) => {
        response += chunck;
      });

      req.on('end', () => {
        resolve(JSON.parse(response));
      });

      req.on('error', (e) => {
        reject(e);
      });
    });
  }
}
