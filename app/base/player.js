'use strict';

module.exports = class BasePlayer {
  /**
   * Sets the value of the different callbacks for an audio
   * element that is played generally speaking in this application
   * unless it's redefined by the host player.
   *
   * @param  {HTMLAudioElement} media
   * @return {null}
   */
  static callbacks(media) {
    media.onerror = function(e) {
      var date = new Date();

      console.log(date.getHours() + ":" + date.getMinutes());
      console.log(e);
    }

    media.onended = function() {
      Player.playNext();
    }

    media.oncanplaythrough = function() {
      Ui.Player.hideLoader();
    }

    media.onstalled = function() {
      if (this.paused)
        return;

      Ui.Player.showLoader();
    }

    media.onprogress = function() {
      if (this.buffered.length > 0) {
        var time = this.buffered.end(this.buffered.length - 1);

        Ui.Player.buffered(time);

        // Pretty hacky but if the video's stalled and the loader
        // is present, we can try to see if there's enough data
        // loaded to play the audio.
        if (time - this.currentTime > 1)
          Ui.Player.hideLoader();
      }
    }
  }
}
