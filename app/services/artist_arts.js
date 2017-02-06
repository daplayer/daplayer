'use strict';

const NetService = require('./net');
const request    = require('request');

/**
 * Service tied to the Spotify API that is able to fetch
 * artist's images and store them on disk to display a
 * nice local library.
 */
module.exports = class ArtistArtsService extends NetService {
  /**
   * Fetches an image for a given artist name looking on
   * the Spotify API.
   *
   * @param  {String} artist - The artist's name.
   * @return {Promise}
   */
  static fetch(artist) {
    return new Promise((resolve, reject) => {
      var options = {
        url: 'https://api.spotify.com/v1/search',
        qs: {
          q: artist,
          type: 'artist'
        }
      };

      request(options, (err, res, body) => {
        if (err)
          reject(err);

        var result = JSON.parse(body);

        if (!result.artists || !result.artists.items.length ||
            !result.artists.items.first().images.length)
          return resolve({ name: artist, icon: false });

        resolve({
          name: artist,
          icon: result.artists.items.first().images[0].url
        });
      });
    });
  }

  /**
   * Fetches all the arts of a given collection of artists
   * and display them on the page if needed.
   *
   * @param  {Array} artists - The collection of artists.
   * @return {Promise}
   */
  static fetchArtists(artists) {
    var promises = artists.map(artist => this.fetch(artist.name));

    return Promise.all(promises).then((results) => {
      return results.forEach((result, index) => {
        if (!result.icon)
          return this.setArtistArt(result.name, false);

        var image_name = result.name + '.jpeg';
        var location   = Paths.join(Paths.artists, image_name);

        this.downloadURL(result.icon, location).then(() => {
          this.setArtistArt(result.name, true);

          // Update the in-cache data
          artists[index].picture = location;

          var thumbnail = $(`a[data-id="${result.name}"]`).find('.thumbnail');
          var image     = `<img src="${location}" style="height: 180px">`;

          thumbnail.find('.glyphicon').remove();
          $(image).appendTo(thumbnail);
        });
      })
    });
  }

  /**
   * Returns a mapping of the images stored inside the artist
   * arts folder.
   *
   * @return {Object}
   */
  static arts() {
    if (!Cache.local.artist_arts) {
      if (localStorage.getItem('artist_arts'))
        var hash = JSON.parse(localStorage.getItem('artist_arts'))
      else
        var hash = {};

      Cache.add('local', 'artist_arts', hash);
    }

    return Cache.local.artist_arts;
  }

  /**
   * Store an artist's art inside the local storage.
   *
   * @param  {String}  name    - The artist's name.
   * @param  {Boolean} present - Whether the icon is on disk or not.
   * @return {null}
   */
  static setArtistArt(name, present) {
    var artists = JSON.parse(localStorage.getItem('artist_arts') || '{}');

    artists[name] = present;

    localStorage.setItem('artist_arts', JSON.stringify(artists));
  }
}
