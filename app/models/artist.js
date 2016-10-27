'use strict';

module.exports = class Artist {
  constructor(name, albums) {
    this.name   = name;
    this.albums = Object.keys(albums).map((title) => {
      return new Album(title, this, albums[title]);
    });
  }
}
