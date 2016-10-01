'use strict';

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

  static soundcloud(hash) {
    var playlist = new Playlist(hash.id, 'soundcloud');

    playlist.title    = hash.title;
    playlist.duration = hash.duration * Math.pow(10, -3);
    playlist.artist   = hash.user.username;

    if (hash.uri)
      playlist.uri = hash.uri;

    if (hash.tracks)
      playlist.items = hash.tracks.map((track) => {
        return Media.soundcloud(track);
      });

    if (hash.artwork_url)
      playlist._icon = hash.artwork_url.size('t300x300');

    return playlist;
  }

  static youtube(hash) {
    var playlist = new Playlist(hash.id, 'youtube');

    playlist.title       = hash.snippet.title;
    playlist.items_count = hash.contentDetails.itemCount;
    playlist._icon       = hash.snippet.thumbnails.medium.url;

    return playlist;
  }

  static JSPF(hash) {
    var playlist = new Playlist(hash.title.dasherize(), 'local');

    playlist.title = hash.title;
    playlist.items = hash.track.map(track => Media.JSPF(track));

    return playlist;
  }
};
