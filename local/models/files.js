'use strict';

const glob = require('glob');

module.exports = class LocalModelFiles {
  static files() {
    if (Cache.local.files)
      return Cache.local.files;

    return new Promise((resolve, reject) => {
      const cp    = require('child_process');
      const child = cp.fork(`${__dirname}/../files.js`, [Config.local.path]);

      child.on('message', (message) => {
        if (message instanceof Array) {
          var records = message.map((file) => {
            return Record.local(file);
          });

          Cache.add('local', 'files', records);

          resolve(records);
        } else
          Ui.fileProcessProgress(message);
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }
  /**
   * Lists all files that are under the user's specified
   * music folder and create a new `Record` object for
   * each file reading its eventual MP3 tags.
   *
   * @param  {String} folder - The folder to look for audio
   *                           files.
   * @return {Promise}
   */
  static readFiles(folder) {
    var pattern = Paths.join(folder, "**/*.{mp3,wav,ogg,m4a}");

    return new Promise((resolve, reject) => {
      glob(pattern, (error, files) => {
        if (error)
          console.log(error);

        resolve(files.map((file, i) => {
          process.send({
            current: i+1,
            total:   files.length
          });

          return LocalService.tags(file);
        }));
      });
    });
  }

  /**
   * Picks all files returned by the `files` methods that
   * don't have any album attached to them.
   *
   * @return {Promise}
   */
  static singles() {
    if (Cache.local.singles)
      return Cache.local.singles;

    return this.files().then((records) => {
      return records.filter((record) => {
        if (record.album == '')
          return record;
      });
    }).then((singles) => {
      Cache.add('local', 'singles', singles);

      return singles;
    });
  }

  /**
   * Returns all albums with their attached tracks from
   * the files returned by the `files` method.
   *
   * @return {Promise}
   */
  static albums() {
    if (Cache.local.albums)
      return Cache.local.albums;

    return this.files().then((files) => {
      return files.map((record) => {
        if (record.album)
          return record.album;
      }).filter((album, index, array) => {
        if (array.indexOf(album) == index)
          return album;
      });
    }).then((albums) => {
      return this.files().then((files) => {
        return {
          albums: albums,
          files:  files
        }
      })
    }).then((collection) => {
      return collection.albums.map((album, i) => {
        return Record.local({
          id:   `album-${i}`,
          title: album,
          album: true,
          items: collection.files.filter((f) => {
            if (f.album == album)
              return f
          }).sort((a, b) => {
            return a.track - b.track;
          })
        });
      });
    }).then((albums) => {
      Cache.add('local', 'albums', albums);

      return albums;
    });
  }

  static artists() {
    return this.albums().then((albums) => {
      return albums.map((album) => {
        return album.items.first().artist;
      });
    }).then((artists) => {
      // We need to compare artists case-insensitively
      // as musics may be tagged with the same artist
      // name but with a different case (e.g. Rage Against
      // *the* Machine vs. Rage Against *The* Machine).
      var lower_cased = artists.map((artist) => {
        return artist.toLowerCase();
      }).filter((artist, index, collection) => {
        if (collection.indexOf(artist) == index)
          return artist;
      });

      var skipped = 0;

      // The array should be in the same order and the
      // indexes are just not matching by the number
      // of elements that we have skipped (i.e. the
      // artists that are already in the array but that
      // are not matching because they don't have the
      // same case).
      return artists.filter((artist, index) => {
        if (lower_cased.indexOf(artist.toLowerCase()) + skipped == index)
          return artist;
        else
          skipped++;
      })
    }).then((artists) => {
      return this.albums().then((albums) => {
        return artists.map((artist) => {
          return {
            name: artist,
            album_count: albums.filter((album) => {
              if (album.items.first().artist.toLowerCase() == artist.toLowerCase())
                return album;
            }).length
          };
        }).sort((a, b) => {
          if (a.name < b.name)
            return -1;
          if (a.name > b.name)
            return 1;

          return 0;
        });
      });
    }).then((artists) => {
      Cache.add('local', 'artists', artists);

      return artists;
    });
  }

  static artist(name) {
    return this.albums().then((albums) => {
      return albums.filter((album) => album.artist.toLowerCase() == name.toLowerCase());
    }).then((albums) => {
      return this.singles().then((singles) => {
        return {
          name:    name,
          albums:  albums,
          singles: singles.filter((single) => single.artist.toLowerCase() == name.toLowerCase())
        }
      })
    });
  }
}
