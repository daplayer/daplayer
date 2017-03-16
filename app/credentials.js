'use strict';

/**
 * This class manages the credentials used inside the
 * application.
 *
 * It both deals with API credentials and the user's one.
 * The API ones are hard stored in this file and the
 * user's ones are managed through `localStorage`.
 */
module.exports = class Credentials {
  /**
   * Returns the API credentials for SoundCloud.
   *
   * @return {Object}
   */
  static get soundcloud() {
    return {
      client_id: '2t9loNQH90kzJcsFCODdigxfp325aq4z',
      app_id:    1489574664
    };
  }

  /**
   * Returns the API credentials for YouTube.
   *
   * @return {Object}
   */
  static get youtube() {
    return {
      client_id:     process.env['YT_CLIENT_ID'],
      client_secret: process.env['YT_CLIENT_SECRET'],
      redirect_uri:  process.env['YT_REDIRECT_URI'],
      scope:         process.env['YT_SCOPE']
    };
  }

  /**
   * Returns the user's credentials for both SoundCloud
   * and YouTube.
   *
   * @return {Object}
   */
  static get user() {
    return {
      soundcloud: this.read('soundcloud'),
      youtube:    this.read('youtube')
    };
  }

  /**
   * Reads the user's credentials for a given service
   * in the local storage or reads from the default hash
   * if the former isn't set.
   *
   * @param  {String} service - The wanted service.
   * @return {Object}
   */
  static read(service) {
    if (localStorage.getItem(service))
      return JSON.parse(localStorage.getItem(service));

    return this.default[service];
  }

  /**
   * Default credentials values.
   *
   * @return {Object}
   */
  static get default() {
    return {
      soundcloud: {
        connected: false
      },
      youtube: {
        connected: false
      }
    }
  }

  /**
   * Stores the given credentials for a service in the local
   * storage.
   *
   * @param  {String}        service     - The concerned service.
   * @param  {String|Object} credentials - The credentials.
   * @return {null}
   */
  static store(service, credentials) {
    if (typeof credentials !== 'string')
      credentials = JSON.stringify(credentials);

    localStorage.setItem(service, credentials);
  }

  /**
   * Removes a service's credentials from the local storage.
   * Used when signing out from SoundCloud or YouTube.
   *
   * @param  {String} service - The concerned service.
   * @return {null}
   */
  static remove(service) {
    localStorage.removeItem(service);
  }
}
