'use strict';

const Paths = require('./paths');

module.exports = class Record {
  constructor(id) {
    this.id = id;
  }

  static soundcloud(hash) {
    var width = hash.kind == 'playlist' ? 't300x300' : 't200x200';

    if (hash.tracks_uri)
      var icon = hash.user.avatar_url.size(width);
    else if (hash.artwork_url)
      var icon = hash.artwork_url.size(width);
    else if (hash.kind != 'playlist')
      var icon = Paths.default_artwork;

    var record = new Record(hash.id);

    record.title        = hash.title;
    record.icon         = icon;
    record.genre        = hash.genre;
    record.url          = hash.permalink_url;
    record.kind         = hash.kind;
    record.tags         = hash.tag_list;
    record.waveform_url = hash.waveform_url;
    record.human_time   = Formatter.time(hash.duration * Math.pow(10, -3));
    record.duration     = hash.duration * Math.pow(10, -3);
    record.service      = 'soundcloud';

    if (hash.user)
      record.artist = hash.user.username;

    if (hash.uri)
      record.uri = hash.uri;

    if (hash.tracks_uri) {
      record.track_count = hash.track_count;
      record.tracks_uri  = hash.tracks_uri;
    }

    if (hash.tracks) {
      record.items = hash.tracks.map((track, i) => {
        console.log("whenever you're reached, tell me bra");
        return Record.soundcloud(track);
      }).map(MetaModel.mapRecords);
    }

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
      record.human_time  = Formatter.time(hash.contentDetails.duration);
      record.duration    = Formatter.duration(record.human_time);

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

    record.service    = 'local';
    record.human_time = Formatter.time(hash.duration);

    return record;
  }
}
