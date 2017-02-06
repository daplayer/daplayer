'use strict';

/**
 * This class represents a view's context.
 *
 * It has an associated collection which is just a flat array
 * to easily deal with the playing queue.
 *
 * This is because when we are on an artist's page for instance,
 * if we are playing the last track of the last album, the user
 * would certainly expect the singles to be read next to this
 * track but since tracks are nested inside the album, it's
 * hard to go back to the root level to play these singles.
 */
module.exports = class Context {
  constructor(hash) {
    if (!hash)
      return;

    if (hash instanceof Array) {
      this.collection = hash;
      return this;
    } else if (hash.items) {
      this.collection = hash.items;
      return this;
    }

    this.collection = [];

    Object.keys(hash).forEach((key) => {
      if (key == 'next_token')
        return;

      if (hash[key] && hash[key].collection) {
        hash[key].collection.forEach((el) => {
          if (el.items)
            this.collection = this.collection.concat(el.items);
          else
            this.collection = this.collection.concat(el);
        });
      } else if (hash[key] && hash[key] instanceof Array) {
        hash[key].forEach((e) => {
          this.collection = this.collection.concat(e.flatten ? e.flatten() : e);
        });
      } else if (hash[key]) {
        this.collection = this.collection.concat(hash[key].items);
      }
    });

    // Remove `undefined` occurences
    this.collection = this.collection.filter(e => e);
  }
}
