'use strict';

const BasePlayer = require('../app/base/player');

module.exports = class LocalPlayer extends BasePlayer {
  /**
   * Sets the value of the different callbacks for an audio
   * element that is played through a local file.
   *
   * @param  {HTMLAudioElement} media
   * @return {null}
   */
  static callbacks(media) {
    super.callbacks(media);

    media.ontimeupdate = function() {
      Ui.Player.progression(this.currentTime);
    };

    media.oncanplay = function() {
      Ui.Player.buffered(this.duration);
    }
  }

  /**
   * Facility to wrap a path inside a Promise. This method
   * just exists for consistency with the SoundCloud and
   * YouTube players.
   *
   * @param  {String} path - The media's location.
   * @return {Promise}
   */
  static load(path) {
    return Promise.resolve(path);
  }
}
