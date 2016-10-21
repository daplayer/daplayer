'use strict';

const LocalModel = require('./model');
const Tagging    = require('daplayer-tagging');

module.exports = class LocalService {
  static tag(location, hash) {
    Tagging.set(location, hash);
  }

  static tags(location) {
    return Tagging.get(location, Paths.covers);
  }

  /**
   * Searches dispatching to the model's methods depending
   * on the syntax used by the user.
   *
   * @param  {String} value - The value to look for.
   * @return {Promise}
   */
  static search(value) {
    if (value.startsWith('#'))
      return LocalModel.findBy('genre', value.slice(1));
    else if (value.startsWith('@'))
      return LocalModel.findBy('artist', value.slice(1));
    else
      return LocalModel.findBy('title', value);
  }
}
