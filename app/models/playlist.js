'use strict';

/**
 * In-memory representation of a playlist.
 */
module.exports = class Playlist extends Record {
  toJSPF() {
    var hash = {};

    hash.title = this.title;
    hash.track = this.items.map(item => item.toJSPF());

    return hash;
  }

  get icon() {
    if (this._icon)
      return this._icon;
    if (this.items && this.items.length)
      return this.items[0].icon.size('t300x300');
    else
      return Paths.default_artwork;
  }

  get item_count() {
    return this._item_count || this.items.length;
  }

  findById(id) {
    return this.items.find(i => i.id == id);
  }

  flatten() {
    return this.items;
  }

  static soundcloud(hash) {
    var playlist = new Playlist(hash.id, 'soundcloud');

    playlist.title    = hash.title;
    playlist.duration = hash.duration * Math.pow(10, -3);
    playlist.artist   = hash.user.username;

    if (hash.uri)
      playlist.uri = hash.uri;

    if (hash.tracks)
      playlist.items = hash.tracks.map((track) => {
        return Media.soundcloud(track, playlist);
      });

    if (hash.artwork_url)
      playlist._icon = hash.artwork_url.size('t300x300');

    return playlist;
  }

  static youtube(hash) {
    var playlist = new Playlist(hash.id, 'youtube');

    playlist.title       = hash.snippet.title;
    playlist._item_count = hash.contentDetails.itemCount;
    playlist._icon       = hash.snippet.thumbnails.medium.url;
    playlist.items       = [];

    return playlist;
  }

  static JSPF(hash) {
    var playlist = new Playlist(hash.title.dasherize(), 'local');

    playlist.title = hash.title;
    playlist.items = hash.track.map(track => Media.JSPF(track, playlist));

    return playlist;
  }

  static all(service) {
    if (service == 'local')
      return Model.for('local').playlists().then((playlists) => {
        return { local: playlists }
      });
    else
      return Model.for('local').playlists().then((local) => {
        return Model.for(service).playlists().then((remote) => {
          return { local:  local, remote: remote };
        });
      });
  }
};
