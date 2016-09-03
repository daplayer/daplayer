'use strict';

const Queue = require('../app/queue');

module.exports = class YouTubePlayer {
  /**
   * Sets the value of the different callbacks for a video
   * element that is played through YouTube.
   *
   * @param  {HTMLVideoElement} media
   * @return {null}
   */
  static callbacks(media) {
    media.ontimeupdate = function() {
      Player.progression(this.currentTime);

      // 10 seconds before the end of the current video, we
      // calculate the next video's URL. The buffered attribute
      // allows us to avoid multiple calls if the video's
      // progression continues and the conditions are met (i.e.
      // the URL is being calculated).
      var lt_10secs = (this.duration - this.currentTime) <= 10;

      if (lt_10secs)
        Queue.next().then((set) => {
          if (!set.first())
            return;

          var next_id  = set.first().id;
          var next_url = Cache.youtube.video_urls[next_id];

          if (!this.buffering_next_url && !next_url) {
            this.buffering_next_url = true;
            YouTubeService.videoURL(next_id);
          }
        });
    }

    media.onended = function() {
      Player.playNext();
    }

    media.onplay = function() {
      Player.startEqualizer();
    }

    media.onprogress = function() {
      if (this.buffered.length > 0)
        Player.updateBufferBar(this.buffered.end(this.buffered.length - 1));
    }

    media.oncanplaythrough = function() {
      Player.hideLoader();
    }

    media.onwaiting = function() {
      Player.showLoader();
    }
  }

  /**
   * Facility to fetch the URL of a video.
   *
   * @param  {String} id - The video's id.
   * @return {Promise}
   */
  static load(id) {
    return YouTubeService.videoURL(id).then((hash) => {
      return hash.url;
    });
  }
}
