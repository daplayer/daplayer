'use strict';

/**
 * This class represents a SoundCloud activity.
 */
module.exports = class Activity {
  constructor(hash) {
    if (hash.track)
      this.item = Media.soundcloud(hash.track);
    else
      this.item = Playlist.soundcloud(hash.playlist);

    this.hasTrack = hash.track ? true : false;
    this.origin   = hash.user;
    this.type     = hash.type;
  }

  get id() {
    return this.item.id;
  }
}
