'use strict';

/**
 * This class manages the downloads done at the application
 * level (i.e. SoundCloud or YouTube medias).
 */
module.exports = class Downloads {
  static enqueue(hash) {
    this.queue.push(hash);
  }

  static dequeue(id) {
    var hash = this.queue.find((download) => {
      return download.id == id;
    });

    this.queue.splice(this.queue.indexOf(hash), 1);
    this.addToHistory(hash);

    return hash;
  }

  static grow(size) {
    this._size = this.size + parseInt(size);
  }

  static get progression() {
    if (!this._progression)
      this._progression = 0;

    return this._progression;
  }

  static progress(size) {
    this._progression = this.progression + parseInt(size);
  }

  static get size() {
    if (!this._size)
      this._size = 0;

    return this._size;
  }

  static set size(size) {
    this._size = size;
  }

  static get queue() {
    if (!this._queue)
      this._queue = [];

    return this._queue;
  }

  static get history() {
    return JSON.parse(localStorage.getItem('downloads_history') || "[]");
  }

  static addToHistory(hash) {
    hash.date = Timing.currentTimestamp();

    var history = this.history;

    history.unshift(hash);

    if (history.length > 20)
      history.splice(20);

    localStorage.setItem('downloads_history', JSON.stringify(history));
  }
}
