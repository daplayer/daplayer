'use strict';

/**
 * This class represents an album (stored locally, on disk).
 */
module.exports = class Album extends Playlist {
  constructor(title, artist, items) {
    super(title.dasherize(), 'local');

    this.album  = true;
    this.title  = title;
    this.artist = artist;

    this.items  = items.map((item) => {
      return Media.local(item);
    });

    this.genre = this.items.first().genre;

    this.items.sort((a, b) => a.track - b.track);
    this.items.forEach(item => item.set = this);
  }
}
