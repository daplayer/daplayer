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

  static soundcloud(hash) {
    var media = new Media(hash.id, 'soundcloud');

    media.title        = hash.title;
    media.genre        = hash.genre;
    media.url          = hash.permalink_url;
    media.tags         = hash.tag_list;
    media.waveform_url = hash.waveform_url;
    media.duration     = hash.duration * Math.pow(10, -3);

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

    media.duration = Formatter.duration(Formatter.time(hash.contentDetails.duration));

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

  static JSPF(hash) {
    var media = new Media(hash.location);

    media.title    = hash.title;
    media.icon     = hash.image;
    media.duration = hash.duration;
    media.artist   = hash.creator;

    if (Number.isInteger(media.id))
      media.service = 'soundcloud';
    else if (media.id.includes('/'))
      media.service = 'local';
    else
      media.service = 'youtube';

    return media;
  }
}
