'use strict';

module.exports = class Media extends Record {
  toJSPF() {
    var hash = {};

    hash.title    = this.title;
    hash.location = this.id;
    hash.image    = this.icon;
    hash.creator  = this.artist;
    hash.duration = this.duration;

    return hash;
  }

  get kind() {
    return this.isYouTube() ? 'video' : 'music';
  }

  get url() {
    if (this.isSoundCloud())
      return this._url;
    else if (this.isYouTube())
      return `https://www.youtube.com/watch?v=${this.id}`;
  }

  get album() {
    if (this.set)
      return this.set.title;
    else
      return "";
  }

  /**
   * Tries to guess the real media's author based upon the title
   * and the associated account.
   *
   *   media.title  == 'Maliblue'
   *   media.artist == 'Darius'
   *   media.real_artist // => 'Darius'
   *
   *   media.title  == 'Kartell - Aura'
   *   media.artist == 'Roche Musique'
   *   media.real_artist // => 'Kartell'
   *
   *   media.title  == 'Talk Talk (Moon Boots Remix)'
   *   media.artist == 'future classic'
   *   media.real_artist // => 'Moon Boots'
   *
   *   media.title  == 'Take Care of You'
   *   media.artist == 'Cherokee (Official)'
   *   media.real_artist // => 'Cherokee'
   *
   * @return {String}
   */
  get real_artist() {
    if (this.title.match(/remix/i))
      var artist = this.title.match(/\((\w|\s)+ remix\)/i)[0]
                        .split(/\(|remix\)/i)[1];
    else if (this.title.indexOf("-") != -1)
      var artist = this.title.split(" - ")[0];
    else
      var artist = this.artist.replace(/\s\(Official\)/, "");

    return artist.trim();
  }

  static soundcloud(hash, set) {
    var media = new Media(hash.id, 'soundcloud');

    media.title        = hash.title;
    media.genre        = hash.genre;
    media._url         = hash.permalink_url;
    media.tags         = hash.tag_list;
    media.waveform_url = hash.waveform_url;
    media.duration     = hash.duration * Math.pow(10, -3);

    if (set)
      media.set = set;

    if (hash.user)
      media.artist = hash.user.username;

    if (hash.artwork_url)
      media.icon = hash.artwork_url.size('t200x200');
    else
      media.icon = Paths.default_artwork;

    return media;
  }

  static youtube(hash) {
    var media = new Media(hash.id, 'youtube');

    media.title  = hash.snippet.title;
    media.artist = hash.snippet.channelTitle;
    media.icon   = hash.snippet.thumbnails.medium.url;
    media.tags   = hash.snippet.tags;

    media.duration = Timing.duration(Timing.time(hash.contentDetails.duration));

    return media;
  }

  static local(hash) {
    var media = new Media(hash.id, 'local');

    for (var key in hash) {
      var value = key == 'icon' ? 'file://' + hash[key] : hash[key];

      media[key] = value;
    }

    if (!hash.icon)
      media.icon = Paths.default_artwork;

    return media;
  }

  static JSPF(hash, set) {
    var media = new Media(hash.location);

    media.title    = hash.title;
    media.icon     = hash.image;
    media.duration = hash.duration;
    media.artist   = hash.creator;
    media.set      = set;

    if (Number.isInteger(media.id))
      media.service = 'soundcloud';
    else if (media.id.includes('/'))
      media.service = 'local';
    else
      media.service = 'youtube';

    return media;
  }
}
