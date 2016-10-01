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

  static link(record, index, array) {
    record.previous = (index == 0) ? null : array[index - 1];
    record.next     = (index == array.length - 1) ? null : array[index + 1];
  }
}
