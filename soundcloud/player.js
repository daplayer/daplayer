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

    media.onplay = function() {
      Ui.Player.startEqualizer();
    }

    media.onprogress = function() {
      if (this.buffered.length > 0)
        Ui.Player.buffered(this.buffered.end(this.buffered.length - 1));
    }

    media.oncanplaythrough = function() {
      Ui.Player.hideLoader();
    }

    media.onwaiting = function() {
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
    return SoundCloudService.stream_url(id);
  }
}
