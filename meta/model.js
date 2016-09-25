'use strict';

const SoundCloudModel = require('../soundcloud/model');
const YouTubeModel    = require('../youtube/model');
const LocalModel      = require('../local/model');

module.exports = class MetaModel {
  static searchResults() {
    return Promise.resolve(Cache.search_results);
  }

  static findById(id, module, section, playlist) {
    if (module == 'soundcloud')
      return SoundCloudModel.findById(id, section, playlist);
    else if (module == 'youtube')
      return YouTubeModel.findById(id, section, playlist);
    else if (module == 'local')
      return LocalModel.findById(id, section, playlist);
  }

  static resolve(url_or_record) {
    if (url_or_record.startsWith("https://soundcloud"))
      return SoundCloudModel.resolve(url_or_record);
    else
      return url_or_record;
  }

  static concatenate(service, existing, fetched) {
    if (service == 'soundcloud')
      return SoundCloudModel.concatenate(existing, fetched);
    else if (service == 'youtube')
      return YouTubeModel.concatenate(existing, fetched);
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

  static addToPlaylist(module, action, id, playlist) {
    this.findById(id, module, action).then((record) => {
      var record = record instanceof Record ? record : record.record;

      if (playlist.service == 'soundcloud')
        var model = SoundCloudModel;
      else if (playlist.service == 'youtube')
        var model = YouTubeModel;
      else
        var model = LocalModel;

      return model.addToPlaylist(playlist.id, record);
    });
  }

  static createPlaylist(title, service) {
    if (service == 'soundcloud')
      var model = SoundCloudModel;
    else if (service == 'youtube')
      var model = YouTubeModel;
    else if (service == 'local')
      var model = LocalModel;

    return model.createPlaylist(title);
  }

  static mapRecords(record, index, array) {
    record.previous = (index == 0) ? null : array[index-1];
    record.next     = (index == array.length - 1) ? null : array[index+1];

    return record;
  }
}
