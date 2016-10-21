'use strict';

module.exports = class MetaModel {
  static searchResults() {
    return Promise.resolve(Cache.search_results);
  }

  static resolve(url_or_record) {
    if (url_or_record.startsWith("https://soundcloud"))
      return SoundCloudModel.resolve(url_or_record);
    else
      return url_or_record;
  }
}
