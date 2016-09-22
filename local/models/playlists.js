'use strict';

const fs   = require('fs');
const glob = require('glob');

module.exports = class LocalModelPlaylists {
  static listenLater() {
    return this.loadPlaylist(Paths.listen_later);
  }

  static listenLaterTo(address) {
    MetaModel.resolve(address).then((record) => {
      this.addToPlaylist(1, record).then(() => {
        Ui.addListenLaterRecord(record);
      }).catch((e) => {
        console.log(e);
      });
    });
  }

  static playlists() {
    if (Cache.local.playlists)
      return Cache.local.playlists;

    return new Promise((resolve, reject) => {
      glob(Paths.join(Paths.playlists, '*.jspf'), (err, files) => {
        if (err)
          reject(err);

        var jspf_files = files.filter((file)   => file != Paths.listen_later);
        var playlists  = jspf_files.map((file) => this.loadPlaylist(file));

        Promise.all(playlists).then((playlists) => {
          Cache.add('local', 'playlists', playlists);

          resolve(playlists);
        });
      });
    });
  }

  static loadPlaylist(location) {
    return new Promise((resolve, reject) => {
      fs.readFile(location, (err, content) => {
        if (err)
          reject(err);

        resolve(Record.JSPF(JSON.parse(content)));
      });
    });
  }

  static addToPlaylist(playlist_id, record) {
    return this.playlists().then((playlists) => {
      var playlist = playlists.find((record) => record.id == playlist_id);

      // This both updates the items in memory (kept in cache)
      // and makes sure that the item gets added in the JSON file
      // when the playlist object is dumped.
      playlist.items.push(record);

      return this.savePlaylist(Record.toJSPF(playlist));
    });
  }

  static createPlaylist(title) {
    return this.savePlaylist({
      title: title,
      track: []
    });
  }

  static savePlaylist(playlist) {
    var filename = playlist.title.dasherize() + '.jspf';
    var location = Paths.join(Paths.playlists, filename);

    return new Promise((resolve, reject) => {
      fs.writeFile(location, JSON.stringify(playlist), (err) => {
        if (err)
          reject(err);

        resolve(true);
      });
    });
  }
}
