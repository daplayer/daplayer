'use strict';

const Paths = require('./paths');

module.exports = class Record {
  constructor(id) {
    this.id = id;
  }

  isTrack() {
    return !['playlist', 'album'].includes(this.kind);
  }

  get human_time() {
    return Formatter.time(this.duration);
  }

  static soundcloud(hash) {
    var record = new Record(hash.id);

    record.title        = hash.title;
    record.genre        = hash.genre;
    record.url          = hash.permalink_url;
    record.kind         = hash.kind;
    record.tags         = hash.tag_list;
    record.waveform_url = hash.waveform_url;
    record.duration     = hash.duration * Math.pow(10, -3);
    record.origin       = hash.origin;
    record.type         = hash.type;
    record.service      = 'soundcloud';

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
    else if (record.items)
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

    var record = new Record(id);

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

    record.page_token = hash.page_token
    record.service    = 'youtube';

    if (hash.items)
      record.items = hash.items.map((record) => {
        return Record.youtube(record);
      }).map(MetaModel.mapRecords);

    return record;
  }

  static local(hash) {
    var record = new Record(hash.id);

    for (var key in hash) {
      if (key == 'icon')
        record[key] = 'file://' + hash[key];
      else
        record[key] = hash[key];
    }

    if (!hash.icon && hash.album == true)
      record.icon = hash.items.first().icon;
    else if (!hash.icon)
      record.icon = Paths.default_artwork;

    if (record.album == true)
      record.artist = hash.items.first().artist;

    record.service = 'local';

    return record;
  }
}
