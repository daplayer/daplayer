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
  /**
   * Creates a new context from an array of playbale items.
   *
   * @param  {Array} array - The array of items.
   * @return {Context}
   */
  constructor(array) {
    if (!array)
      return

    this.collection = []

    array.forEach((e) => {
      if (e instanceof Activity)
        e = e.item

      if (e instanceof Playlist)
        this.collection = this.collection.concat(e.items)
      else
        this.collection = this.collection.concat(e)
    })
  }
}
