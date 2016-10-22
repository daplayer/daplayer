'use strict';

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
      Ui.Player.progression(this.currentTime);

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
            Service.for('youtube').videoURL(next_id);
          }
        });
    }

    media.onended = function() {
      Player.playNext();
    }

    media.onplay = function() {
      Ui.Player.startEqualizer();
    }

    media.onprogress = function() {
      if (this.buffered.length > 0) {
        var time = this.buffered.end(this.buffered.length - 1);

        Ui.Player.buffered(time);

        // Pretty hacky but if the video's stalled and the loader
        // is present, we can try to see if there's enough data
        // loaded to play the audio.
        if (time - this.currentTime > 1) {
          Ui.Player.hideLoader();
          Ui.Player.startEqualizer();
        }
      }
    }

    media.oncanplaythrough = function() {
      Ui.Player.hideLoader();
    }

    media.onstalled = function() {
      Ui.Player.showLoader();
      Ui.Player.pauseEqualizer();
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
