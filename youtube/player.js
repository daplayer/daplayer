'use strict';

const BasePlayer = require('../app/base/player');

module.exports = class YouTubePlayer extends BasePlayer {
  /**
   * Sets the value of the different callbacks for a video
   * element that is played through YouTube.
   *
   * @param  {HTMLVideoElement} media
   * @return {null}
   */
  static callbacks(media) {
    super.callbacks(media);

    media.ontimeupdate = function() {
      Ui.Player.progression(this.currentTime);

      // 10 seconds before the end of the current video, we
      // calculate the next video's URL. The buffered attribute
      // allows us to avoid multiple calls if the video's
      // progression continues and the conditions are met (i.e.
      // the URL is being calculated).
      var lt_10secs = (this.duration - this.currentTime) <= 10;

      if (lt_10secs)
        Queue.next().then((record) => {
          if (!record)
            return;

          var next_id  = record.id;
          var next_url = Cache.youtube.video_urls.find(u => u.id == next_id);

          if (!this.buffering_next_url && !next_url) {
            this.buffering_next_url = true;

            Service.for('youtube').videoURL(next_id).then(() => {
              this.buffering_next_url = false;
            });
          }
        });
    }
  }

  /**
   * Facility to fetch the URL of a video.
   *
   * @param  {String} id - The video's id.
   * @return {Promise}
   */
  static load(id) {
    return Service.for('youtube').videoURL(id).then((hash) => {
      return hash.url;
    });
  }
}
