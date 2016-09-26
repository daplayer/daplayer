'use strict';

module.exports = class Queue {
  static start(current, playlist) {
    this.current  = current;
    this.playlist = playlist;
    this.history  = [];
  }

  static setMode(mode) {
    if (this.mode == 'random')
      this.next_random = null;

    this.mode = mode;
  }

  static next() {
    return new Promise((resolve, reject) => {
      if (!this.mode) {
        if (this.current.next)
          resolve([this.current.next, this.playlist]);
        else if (this.playlist && this.playlist.next)
          resolve([this.playlist.next.items[0], this.playlist.next]);
        else
          resolve([]);
      } else if (this.mode == 'loop') {
        if (this.current == this.playlist.items.last())
          resolve([this.playlist.items[0], this.playlist]);
        else
          resolve([this.current.next, this.playlist]);
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
      if (!this.mode) {
        if (this.current.previous)
          resolve([this.current.previous, this.playlist]);
        else if (this.playlist && this.playlist.previous)
          resolve([this.playlist.previous.items.last(), this.playlist.previous]);
        else
          resolve([]);
      } else if (this.mode == 'loop') {
        if (this.current == this.playlist.items[0])
          resolve([this.playlist.items.last(), this.playlist]);
        else
          resolve([this.current.next, this.playlist]);
      } else if (this.mode == 'random') {
        if (this.history.length)
          resolve([this.history.last(), this.playlist]);
      }
    });
  }

  static shift() {
    return this.next().then((set) => {
      if (this.mode == 'random') {
        this.history.push(this.current);
        this.next_random = null;
      }

      this.current  = set[0];
      this.playlist = set[1];

      return set;
    });
  }

  static pop() {
    return this.previous().then((set) => {
      if (this.mode == 'random')
        this.history.pop();

      this.current  = set[0];
      this.playlist = set[1];

      return set;
    });
  }
}
