'use strict';

module.exports = class Context {
  constructor(hash) {
    if (!hash)
      return;

    if (hash instanceof Array) {
      this.collection = hash;
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
  }
}
