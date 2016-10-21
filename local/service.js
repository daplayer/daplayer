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
   * @return {Promise}
   */
  static search() {
    var query = Cache.search.query;

    if (query.startsWith('#'))
      return LocalModel.findBy('genre', query.slice(1));
    else if (query.startsWith('@'))
      return LocalModel.findBy('artist', query.slice(1));
    else
      return LocalModel.findBy('title', query);
  }
}
