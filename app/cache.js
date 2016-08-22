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
    this.templates      = {}; // Compiled templates
    this.soundcloud     = {}; // SoundCloud records
    this.local          = {}; // Local record
    this.playing        = {}; // Playing scope
    this.search_results = {}; // Search results

    // Keep track of YouTube records.
    //
    // Special case YouTube playlists' items
    // and videos' URLs because we have a higher
    // nesting sincec we hold a collection for
    // each playlist and an URL for each video.
    this.youtube = {
      playlist_items: {},
      video_urls:     {}
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
   * When the section is empty, just store the result inside
   * a Promise.
   *
   * When the section is already filled, the existing collection
   * will be concatenated with the given one and the cursor to
   * the next data page will be updated as well.
   *
   * @param  {String} module  - The module identifier; i.e.
   *                            the root section.
   * @param  {String} section - The section to fill.
   * @param  {Object} data    - The data to store.
   * @return {null}
   */
  static add(module, section, data) {
    // Early return for `playlist_items` and `video_urls`
    // sections since we have a higher level of nesting.
    if (['playlist_items', 'video_urls'].includes(section)) {
      this[module][section][data.id] = Promise.resolve(data);
      return;
    }

    if (!this[module][section]) {
      this[module][section] = Promise.resolve(data);
    } else {
      this[module][section].then((previous) => {
        this[module][section] = MetaModel.concatenate(module, previous, data);
      });
    }
  }
};
