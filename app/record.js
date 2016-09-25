'use strict';

module.exports = class Record {
  constructor(id, service) {
    this.id      = id;
    this.service = service;
  }

  isTrack() {
    return !['playlist', 'album'].includes(this.kind);
  }

  isSoundCloud() {
    return this.service == 'soundcloud';
  }

  isYouTube() {
    return this.service == 'youtube';
  }

  isLocal() {
    return this.service == 'local';
  }

  get media() {
    return this.isYouTube() ? 'video' : 'music';
  }

  get human_time() {
    return Formatter.time(this.duration);
  }

  static soundcloud(hash) {
    var record = new Record(hash.id, 'soundcloud');

    record.title        = hash.title;
    record.genre        = hash.genre;
    record.url          = hash.permalink_url;
    record.kind         = hash.kind;
    record.tags         = hash.tag_list;
    record.waveform_url = hash.waveform_url;
    record.duration     = hash.duration * Math.pow(10, -3);
    record.origin       = hash.origin;
    record.type         = hash.type;

    if (hash.user)
      record.artist = hash.user.username;

    if (hash.uri)
      record.uri = hash.uri;

    if (hash.tracks) {
      record.items = hash.tracks.map((track, i) => {
        return Record.soundcloud(track);
      }).map(MetaModel.mapRecords);
    }

    // Compute the icon of the record.
    var width = hash.kind == 'playlist' ? 't300x300' : 't200x200';

    if (hash.artwork_url)
      record.icon = hash.artwork_url.size(width);
    else if (record.items && record.items.length)
      record.icon = record.items.first().icon.size(width);
    else if (record.kind != 'playlist')
      record.icon = Paths.default_artwork;

    return record;
  }

  static youtube(hash) {
    if (hash.id && typeof hash.id !== 'string')
      var id = hash.id.videoId;
    else
      var id = hash.id;

    var record = new Record(id, 'youtube');

    if (hash.snippet) {
      record.title  = hash.snippet.title;
      record.artist = hash.snippet.channelTitle;
      record.icon   = hash.snippet.thumbnails.medium.url;
      record.tags   = hash.snippet.tags;
    }

    if (hash.contentDetails) {
      record.duration = Formatter.duration(Formatter.time(hash.contentDetails.duration));

      if (hash.contentDetails.itemCount)
        record.items_count = hash.contentDetails.itemCount;
    }

    record.next_token = hash.next_token;

    if (hash.items || hash.collection)
      record.collection = (hash.items || hash.collection).map((item) => {
        return Record.youtube(item);
      }).map(MetaModel.mapRecords);

    return record;
  }

  static local(hash) {
    var record = new Record(hash.id, 'local');

    for (var key in hash) {
      if (key == 'icon' && hash.kind != 'playlist')
        record[key] = 'file://' + hash[key];
      else
        record[key] = hash[key];
    }

    if (!hash.icon && hash.album == true)
      record.icon = hash.items.first().icon;
    else if (!hash.icon)
      record.icon = Paths.default_artwork;

    if (record.album == true) {
      record.artist = hash.items.first().artist;
      record.genre  = hash.items.first().genre;
    }

    return record;
  }

  static JSPF(hash) {
    if (hash.track)
      var record = new Record(hash.title.dasherize());
    else
      var record = new Record(hash.location);

    record.title = hash.title;

    if (hash.track) {
      record.service = 'local';
      record.kind    = 'playlist';
      record.items   = hash.track.map((track) => Record.JSPF(track));

      if (hash.track.length)
        record.icon = hash.track.first().image;
      else
        record.icon = Paths.default_artwork;
    } else {
      record.id       = hash.location;
      record.icon     = hash.image;
      record.duration = hash.duration;
      record.artist   = hash.creator;

      if (Number.isInteger(record.id))
        record.service = 'soundcloud';
      else if (record.id.includes('/'))
        record.service = 'local';
      else
        record.service = 'youtube';
    }

    return record;
  }

  static toJSPF(record) {
    var hash = {};

    hash.title = record.title;

    if (record.items) {
      hash.track = record.items.map((item) => Record.toJSPF(item));
    } else {
      hash.location = record.id;
      hash.image    = record.icon;
      hash.creator  = record.artist;
      hash.duration = record.duration;
    }

    return hash;
  }

  static raw(hash) {
    var record = new Record(hash.id);

    for (var key in hash)
      record[key] = hash[key];

    return record;
  }
}
