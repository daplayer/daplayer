'use strict';

const fs   = require('fs')
const glob = require('glob')

module.exports = class LocalModel {
  static files(section) {
    if (Cache.local[section])
      return Cache.fetch('local', section)

    return new Promise((resolve, reject) => {
      const cp    = require('child_process')
      const child = cp.fork(`${__dirname}/files.js`, [Config.local.path])

      child.on('message', (message) => {
        if (message instanceof Array)
          return Ui.loading('local.feedback.progress', {
            current: message.first(),
            total:   message.last()
          })

        this.processFiles(message).then((collection) => {
          resolve(collection[section])
        })
      })

      child.on('error', (error) => {
        reject(error)
      })
    })
  }

  /**
   * Properly instantiates records based on the given hash.
   * The hash values are just plain objects but we want to
   * be able to deal with instances of `Album`, `Artist` and
   * `Media`.
   *
   * @param  {Object} hash - The hash returned by the tagging
   *                         library.
   * @return {Promise}
   */
  static processFiles(hash) {
    return new Promise((resolve, reject) => {
      var singles = hash.singles.map((single) => {
        return Media.local(single)
      }).sortBy('title')

      var artists = Object.keys(hash.artists).map((name) => {
        var raw_hash = hash.artists[name]
        var artist   = new Artist(raw_hash.name, raw_hash.albums, raw_hash.singles)

        return artist
      }).sortBy('name')

      Cache.add('local', 'singles', singles)
      Cache.add('local', 'artists', artists)

      Service.for('local').fetchUnknownArtists(artists)

      resolve({ singles: singles, artists: artists })
    })
  }

  /**
   * Returns all the singles stored inside the user's music
   * folder.
   *
   * @return {Promise}
   */
  static singles() {
    return this.files('singles')
  }

  /**
   * Returns all the artists stored inside the user's music
   * folder with all their know albums and singles attached.
   *
   * @return {Promise}
   */
  static artists() {
    return this.files('artists')
  }

  /**
   * Returns an artist given their name.
   *
   * @param  {String} name - The artist's name.
   * @return {Promise}
   */
  static artist(name) {
    return this.artists().then((artists) => {
      return artists.find(artist => artist.name == name)
    })
  }

  /**
   * Finds all records given a field and a value.
   *
   * For search by tags, the match is exact, we are not
   * relying on any sort of regex or Levenstein distance
   * since styles maybe composed of each other (e.g. core
   * and hardcore, which are mostly different).
   *
   * @param  {String} field - The record's field to do the
   *                          search against.
   * @param  {String} query - The value to look for.
   * @return {Promise}
   */
  static findBy(field, query) {
    if (field == 'genre')
      var match = (record) => { return record[field].toLowerCase() == query.toLowerCase() }
    else
      var match = (record) => { return record[field].match(new RegExp(query, 'i')) }

    return Promise.resolve({}).then((results) => {
      return this.singles().then((singles) => {
        results.singles = singles.filter(match)

        return results
      }).then((results) => {
        return this.artists().then((artists) => {
          results.artists = []
          results.albums  = []

          artists.forEach((artist) => {
            if (artist.name.match(new RegExp(query, 'i')))
              results.artists.push(artist)

            artist.albums.forEach((album) => {
              if (match(album))
                results.albums.push(album)

              // There may be eponymous musics (e.g. 'All Hope Is Gone')
              // so we want to look for every files *and* albums. But when
              // we are searching by artist or genre, we want the album as
              // a whole, not every single music.
              if (field == 'title')
                results.singles = results.singles.concat(album.items.filter(match))
            })
          })

          Cache.add('local', 'search_results', results)

          return results
        })
      })
    })
  }

  static playlists() {
    if (Cache.local.playlists)
      return Cache.local.playlists

    return new Promise((resolve, reject) => {
      glob(Paths.join(Paths.playlists, '*.jspf'), (err, files) => {
        if (err)
          reject(err)

        var playlists = files.map(file => this.loadPlaylist(file))

        Promise.all(playlists).then((playlists) => {
          Cache.add('local', 'playlists', playlists)

          resolve(playlists)
        })
      })
    })
  }

  static loadPlaylist(location) {
    return new Promise((resolve, reject) => {
      fs.readFile(location, (err, content) => {
        if (err)
          reject(err)

        resolve(Playlist.JSPF(JSON.parse(content)))
      })
    })
  }

  static addToPlaylist(playlist_id, record) {
    return this.playlists().then((playlists) => {
      var playlist = playlists.find((record) => record.id == playlist_id)

      // This both updates the items in memory (kept in cache)
      // and makes sure that the item gets added in the JSON file
      // when the playlist object is dumped.
      playlist.items.push(record)

      return this.savePlaylist(playlist)
    })
  }

  static createPlaylist(title) {
    var record = Playlist.JSPF({
      title: title,
      track: []
    })

    return this.playlists().then((playlists) => {
      // If we are creating a new playlist, we have already
      // loaded them so let's update the cache.
      playlists.unshift(record)

      return this.savePlaylist(record)
    })
  }

  static savePlaylist(playlist) {
    var filename = playlist.title.dasherize() + '.jspf'
    var location = Paths.join(Paths.playlists, filename)

    return new Promise((resolve, reject) => {
      fs.writeFile(location, JSON.stringify(playlist.toJSPF()), (err) => {
        if (err)
          reject(err)

        resolve(playlist)
      })
    })
  }
}
