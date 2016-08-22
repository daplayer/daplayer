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
      stream:     ''
    };
  }

  static activities() {
    var options = {
      url: this.url.activities,
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
      return this.activities();

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
}
