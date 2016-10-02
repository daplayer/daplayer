'use strict';

module.exports = class Album extends Playlist {
  constructor(hash) {
    super(hash.title.dasherize(), 'local');

    this.album  = true;
    this.title  = hash.title;
    this.items  = hash.items;
    this.artist = this.items.first().artist;
    this.genre  = this.items.first().genre;

    this.items.sort((a, b) => a.track - b.track);
    this.items.forEach(item => item.set = this);
  }
}
