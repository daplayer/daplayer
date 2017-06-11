'use strict';

/**
 * This class is managing the playing queue.
 */
module.exports = class Queue {
  static start(current) {
    var context = Cache.playing.context;

    this.current = current;
    this.queue   = context.flatten ? context.flatten() : (context.collection || context);
    this.history = [];
  }

  static setMode(mode) {
    if (this.mode == 'random') {
      var pos = this.queue.findIndex(e => e.id == this.current.id);

      this.random_queue = this.queue.slice();
      this.random_queue.splice(pos, 1);
      this.random_queue.shuffle();
    }

    this.mode = mode;
  }

  static next() {
    return new Promise((resolve, reject) => {
      if (!this.current)
        resolve(null);

      // In "normal" mode, we just go to the next media.
      //
      // In "loop" mode, we are just playing elements of
      // the current set.
      //
      // In "random" mode, we are using the random queue
      // that has been shuffled when the mode changed.
      if (!this.mode) {
        var pos = this.queue.findIndex(r => r.id == this.current.id);

        resolve(this.queue[pos+1]);
      } else if (this.mode == 'loop') {
        var set = this.current.set;
        var pos = set.items.findIndex(item => item.id == this.current.id);


        if (pos == set.items.length - 1)
          resolve(set.items.first());
        else
          resolve(set.items[pos+1]);
      } else {
        var pos = this.random_queue.indexOf(this.current.id);

        resolve(this.random_queue[pos == -1 ? 0 : pos+1]);
      }
    });
  }

  static previous() {
    return new Promise((resolve, reject) => {
      if (!this.current)
        resolve(null);

      var set = this.current.set;

      if (!this.mode) {
        var pos = this.queue.findIndex(r => r.id == this.current.id);

        resolve(this.queue[pos-1]);
      } else if (this.mode == 'loop') {
        var pos = set.items.findIndex(item => item.id == this.current.id);

        if (pos == 0)
          resolve(set.items.last());
        else
          resolve(set.items[pos-1]);
      } else {
        resolve(this.history.last());
      }
    });
  }

  static shift() {
    return this.next().then((record) => {
      this.current = record;

      if (this.mode == 'random')
        this.history.push(this.current);

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
