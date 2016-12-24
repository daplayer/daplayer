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

    this.picture = Service.for('local').artistArts().find(art => art.includes(name));
  }

  findById(id, album) {
    if (album)
      return this.albums.find(a => a .id == album)
                 .items.find(r => r.id == id);
    else
      return this.singles.find(r => r.id == id);
  }

  flatten() {
    var array = [];

    this.albums.forEach(album => array = array.concat(album.items));
    this.singles.forEach(single => array.push(single));

    return array;
  }
}
