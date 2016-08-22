'use strict';

module.exports = class LocalModel {
  static mixins() {
    include(LocalModel, '../local/models/files');
    include(LocalModel, '../local/models/finders');
    include(LocalModel, '../local/models/playlists');
  }

  static searchResults() {
    return MetaModel.searchResults().then((hash) => {
      return hash.local;
    });
  }
}

module.exports.mixins();
