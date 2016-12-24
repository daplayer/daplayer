'use strict';

module.exports = class Context {
  constructor(hash) {
    if (!hash)
      return;

    this.collection = [];

    Object.keys(hash).forEach((key) => {
      if (hash[key] && hash[key].collection) {
        hash[key].collection.forEach((el) => {
          if (el.items)
            this.collection = this.collection.concat(el.items);
          else
            this.collection = this.collection.concat(el);
        });
      } else if (hash[key]) {
        this.collection = this.collection.concat(hash[key]);
      }
    });
  }
}
