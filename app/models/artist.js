'use strict';

module.exports = class Artist {
  constructor(name, albums, singles) {
    this.name   = name;
    this.albums = Object.keys(albums).map((title) => {
      return new Album(title, this, albums[title]);
    });

    this.singles = singles.map((record) => {
      return Media.local(record);
    });

    this.albums.forEach(Record.link);
    this.singles.forEach(Record.link);

    this.picture = Service.for('local').artistArts().find(art => art.includes(name));
  }
}
