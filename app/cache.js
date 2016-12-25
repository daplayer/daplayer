'use strict';

module.exports = class Cache {
  /**
   * Initializes the different pieces of the cache to make
   * sure that we are dealing with empty objects and not
   * `undefined` for the first checks.
   *
   * @return {null}
   */
  static initialize() {
    this.templates  = {}; // Compiled templates
    this.soundcloud = {}; // SoundCloud records
    this.local      = {}; // Local records
    this.meta       = {}; // Meta records
    this.playing    = {}; // Playing scope
    this.search     = {}; // Searching scope

    // By default we assume that the player's window
    // is the focused one.
    this.focus = true;

    // Keep track of YouTube records.
    //
    // Special case YouTube playlists' items
    // and videos' URLs because we have a higher
    // nesting since we hold a collection for the
    // loaded playlists and an URL for each video.
    this.youtube = {
      items:      [],
      video_urls: {}
    };

    // Define the default scope
    this.current = {
      module:  'meta',
      action:  'index'
    };
  }

  /**
   * Facility to add elements to a specific cache section.
   *
   * When the section is empty, the given data is roughly stored.
   *
   * When the section is already filled, the existing collection
   * will be concatenated with the given one and the cursor to
   * the next data page will be updated as well.
   *
   * @param  {String} module  - The module identifier; i.e.
   *                            the root section.
   * @param  {String} section - The section to fill.
   * @param  {Object} data    - The data to store.
   * @return {Object}
   */
  static add(module, section, data) {
    // Early return for `video_urls` since we have a higher
    // level of nesting.
    if (section == 'video_urls')
      return this.youtube.video_urls[data.id] = Promise.resolve(data);

    // If the section is empty, we just create a brand new
    // promise with the given data.
    //
    // As for local sections, as nothing is paginated, the
    // check will always pass anyway but the `module` check
    // is to ensure that we erase existing data as we may
    // update the local library tagging some elements.
    if (!this[module][section] || module == 'local') {
      return this[module][section] = data;
    } else {
      var existing       = this[module][section];
      var new_collection = existing.collection.concat(data.collection);

      return this[module][section] = {
        next_token: data.next_token,
        collection: new_collection
      };
    }
  }

  /**
   * Wraps cache sections within a Promise object. This
   * is a facility to return data inside a Promise since
   * model methods return such kind of objects.
   *
   * @return {Promise}
   */
  static fetch(module, section) {
    return Promise.resolve(this[module][section]);
  }
};
