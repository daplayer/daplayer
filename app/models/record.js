'use strict';

module.exports = class Record {
  constructor(id, service) {
    this.id      = id;
    this.service = service;
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

  get human_time() {
    return Formatter.time(this.duration);
  }

  static from(id, playlist) {
    var context = Cache.current.context;

    if (context.findById)
      return context.findById(id, playlist);
    else if (context.collection)
      return context.collection.find(r => r.id == id);
    else
      return context.find(r => r.id == id);
  }
}
