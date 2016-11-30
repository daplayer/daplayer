'use strict';

module.exports = class Credentials {
  static get soundcloud() {
    return {
      client_id: 'fDoItMDbsbZz8dY16ZzARCZmzgHBPotA',
      app_id:    1480418710
    };
  }

  static get youtube() {
    return {
      client_id:     process.env['YT_CLIENT_ID'],
      client_secret: process.env['YT_CLIENT_SECRET'],
      redirect_uri:  process.env['YT_REDIRECT_URI'],
      scope:         process.env['YT_SCOPE']
    };
  }

  static get user() {
    return {
      soundcloud: this.read('soundcloud'),
      youtube:    this.read('youtube')
    };
  }

  static read(service) {
    if (localStorage.getItem(service))
      return JSON.parse(localStorage.getItem(service));

    return this.default[service];
  }

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

  static store(service, credentials) {
    if (typeof credentials !== 'string')
      credentials = JSON.stringify(credentials);

    localStorage.setItem(service, credentials);
  }

  static remove(service) {
    localStorage.removeItem(service);
  }
}
