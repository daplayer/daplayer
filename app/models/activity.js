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

  /**
   * Returns an accurate icon based on the type of activity.
   *
   * @return {Handlebars.SafeString}
   */
  icon() {
    var mapping = {
      'track-repost':    'retweet',
      'playlist-repost': 'retweet',
      'track':           'music',
      'playlist':        'list',
    }

    return Handlebars.helpers.g(mapping[this.type]);
  }

  /**
   * Returns a translated description to tell the user the
   * kind of activity and who did it.
   *
   * @return {Handlebars.SafeString}
   */
  description() {
    var img  = Html.tag('img', {src: this.origin.avatar_url.size('tiny')});
    var desc = I18n.t('sc.activities.' + this.type, {
      user: this.origin.username
    });

    return new Handlebars.SafeString(img + desc);
  }
}
