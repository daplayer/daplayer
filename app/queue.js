'use strict';

module.exports = class Queue {
  static start(current) {
    this.current = current;
    this.history = [];
  }

  static setMode(mode) {
    if (this.mode == 'random')
      this.next_random = null;

    this.mode = mode;
  }

  static next() {
    return new Promise((resolve, reject) => {
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
        if (!this.next_random) {
          if (this.playlist) {
            var index = Math.floor(Math.random() * this.playlist.items.length);

            this.next_random = this.playlist.items[index];

            resolve([this.next_random, this.playlist]);
          } else {
            this.next_random = this.current;

            for (var i = 0; i < 10; i++) {
              do {
                var field = ['previous', 'next'][Math.floor(Math.random() * 2)];
                var temp = this.next_random[field];

                if (temp)
                  this.next_random = temp;
              } while (temp == null);

              if (this.next_random.id == this.current.id)
                i--;

              if (i == 9)
                resolve([this.next_random, this.playlist]);
            }
          }
        }
      }
    });
  }

  static previous() {
    return new Promise((resolve, reject) => {
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
      if (this.mode == 'random') {
        this.history.push(this.current);
        this.next_random = null;
      }

      this.current = record;

      return record;
    });
  }

  static pop() {
    return this.previous().then((record) => {
      if (this.mode == 'random')
        this.history.pop();

      this.current = record;

      return record;
    });
  }
}
