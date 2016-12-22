'use strict';

module.exports = class LocalModel {
  static mixins() {
    include(LocalModel, '../local/models/files');
    include(LocalModel, '../local/models/finders');
    include(LocalModel, '../local/models/playlists');
  }

  static searchResults() {
    return Cache.local.search_results;
  }
}

module.exports.mixins();
