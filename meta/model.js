'use strict';

const SoundCloudModel = require('../soundcloud/model');
const YouTubeModel    = require('../youtube/model');
const LocalModel      = require('../local/model');

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

  static playlists(module) {
    return LocalModel.playlists().then((local_playlists) => {
      if (module == 'soundcloud')
        return SoundCloudModel.userPlaylists().then((soundcloud_playlists) => {
          return {
            local: local_playlists,
            soundcloud: soundcloud_playlists
          }
        });
      else if (module == 'youtube')
        return YouTubeModel.playlists().then((youtube_playlists) => {
          return {
            local: local_playlists,
            youtube: youtube_playlists
          }
        });
      else if (module == 'local')
        return {
          local: local_playlists
        }
    });
  }
}
