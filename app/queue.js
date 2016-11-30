'use strict';

module.exports = class Queue {
  static start(current) {
    this.current = current;
    this.history = [];
  }

  static setMode(mode) {
    if (this.mode == 'random')
      this.sampled = null;

    this.mode = mode;
  }

  static next() {
    return new Promise((resolve, reject) => {
      if (!this.current)
        resolve(null);

      var set = this.current.set;

      if (!this.mode) {
        if (this.current.next)
          resolve(this.current.next);
        else if (set && set.next)
          resolve(set.next.items.first());
        else
          resolve(null);
      } else if (this.mode == 'loop') {
        if (this.current == set.items.last())
          resolve(set.items.first());
        else
          resolve(this.current.next);
      } else if (this.mode == 'random') {
        // We need to keep in memory the random that we have
        // got since we may call `next()` several times just to
        // know which media will be played next without actually
        // playing it; it will be cleared calling `shift()`.
        if (!this.sampled && set) {
          var index    = this.random(set.items.length);
          this.sampled = set.items[index];

          resolve(this.sampled);
        } else {
          resolve(this.sampled);
        }
      }
    });
  }

  static previous() {
    return new Promise((resolve, reject) => {
      if (!this.current)
        resolve(null);

      var set = this.current.set;

      if (!this.mode) {
        if (this.current.previous)
          resolve(this.current.previous);
        else if (set && set.previous)
          resolve(set.previous.items.last());
        else
          resolve(null);
      } else if (this.mode == 'loop') {
        if (this.current == set.items.first())
          resolve(set.items.last());
        else
          resolve(this.current.previous);
      } else if (this.mode == 'random') {
        if (this.history.length)
          resolve(this.history.last());
        else
          resolve(null);
      }
    });
  }

  static shift() {
    return this.next().then((record) => {
      this.current = record;

      if (this.mode == 'random') {
        this.history.push(this.current);
        this.sampled = null;
      }

      return record;
    });
  }

  static pop() {
    return this.previous().then((record) => {
      this.current = record;

      if (this.mode == 'random')
        this.history.pop();

      return record;
    });
  }

  static random(max) {
    return Math.floor(Math.random() * max);
  }
}
