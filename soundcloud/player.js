'use strict';

module.exports = class SoundCloudPlayer {
  /**
   * Sets the value of the different callbacks for an audio
   * element that is played through a SoundCloud.
   *
   * @param  {HTMLAudioElement} media
   * @return {null}
   */
  static callbacks(media) {
    media.ontimeupdate = function() {
      Ui.Player.progression(this.currentTime);
    }

    media.onended = function() {
      Player.playNext();
    }

    media.onprogress = function() {
      if (this.buffered.length > 0) {
        var time = this.buffered.end(this.buffered.length - 1);

        Ui.Player.buffered(time);

        // Pretty hacky but if the audio's stalled and the loader
        // is present, we can try to see if there's enough data
        // loaded to play the audio.
        if (time - this.currentTime > 1)
          Ui.Player.hideLoader();
      }
    }

    media.oncanplaythrough = function() {
      Ui.Player.hideLoader();
    }

    media.onstalled = function() {
      if (this.paused)
        return;

      Ui.Player.showLoader();
    }
  }

  /**
   * Facility to fetch the stream URL of an audio file.
   *
   * @param  {Number} id - The audio's id.
   * @return {Promise}
   */
  static load(id) {
    return Service.for('soundcloud').stream_url(id);
  }
}
