'use strict';

const SoundCloudPlayer = require('../soundcloud/player');
const YouTubePlayer    = require('../youtube/player');
const YouTubeModel     = require('../youtube/model');
const LocalPlayer      = require('../local/player');

/**
 * This class is responsible for managing the playing logic
 * inside the application.
 *
 * The user interface is managed by the `Ui.Player` class.
 */
module.exports = class Player {
  /**
   * Initializes all the necessary elements.
   *
   * @return {null}
   */
  static initialize() {
    this.audio = new Audio();
    this.video = document.querySelector('video');
  }

  /**
   * Finds the record to play in the cache. Once the record
   * is found, delegates to the `start` method.
   *
   * @param  {Number|String} id          - The element to play's id.
   * @param  {Number|String} playlist    - Optionally the current
   *                                       playlist.
   * @param  {Boolean=}      keep_action - Whether to keep the
   *                                       playing action or not.
   * @return {null}
   */
  static preload(id, playlist, keep_action) {
    // Pause the player if the user clicked on
    // the currently playing item, resume if
    // the player is paused.
    if (this.record && id == this.record.id && !this.paused)
      return this.pause();
    else if (this.record && id == this.record.id && this.paused)
      return this.play();

    if (!keep_action) {
      Cache.playing = Cache.current;

      // Reset the current queue's mode
      Queue.setMode(null);
    }

    this.start(Record.from(id, playlist));
  }

  /**
   * Starts the player for a given record.
   *
   * @param  {Media} record - The record to play.
   * @return {null}
   */
  static start(record) {
    this.stop();
    this.record = record;

    // Properly initialize the queue
    Queue.start(record);

    if (record.service != 'local')
      Ui.Player.showLoader();

    if (!record.set)
      Ui.Player.hideCurrentSet();
    else if (record.set)
      Ui.Player.showCurrentSet();

    // Display as soon as possible the correct interface to
    // tell the user that its media is processed.
    Ui.Player.setupInterface();

    if (record.service == 'soundcloud')
      var player = SoundCloudPlayer;
    else if (record.service == 'youtube')
      var player = YouTubePlayer;
    else if (record.service == 'local')
      var player = LocalPlayer;

    player.load(record.id).then((url) => {
      if (record.isYouTube())
        YouTubeModel.addToHistory(record);

      Analytics.increase(this.record);

      this.media.loop = false;
      this.media.src  = url;
      this.media.load();

      player.callbacks(this.media);

      this.play();
    });
  }

  /**
   * Short-hand to pause the current playing media and reset
   * the player interface.
   *
   * @return {null}
   */
  static stop() {
    this.pause();

    this.audio.src = '';
    this.video.src = '';

    Ui.Player.reset();
  }

  /**
   * Facility to play the current media instance. It just
   * delegates to the instance's `play` method and change
   * the class of the pause button.
   *
   * @return {null}
   */
  static play() {
    if (!this.record)
      return;

    this.media.play();

    Ui.Player.pauseButton();
  }

  /**
   * Plays the next media.
   *
   * @return {null}
   */
  static playNext() {
    Queue.shift().then(record => {
      if (record)
        this.start(record)
      else
        Ui.Player.playButton();
    });
  }

  /**
   * Plays the previous media unless the current media's time
   * is greater than 5 seconds; in this case, we just rewind
   * it.
   *
   * @return {null}
   */
  static playPrevious() {
    if (this.media.currentTime > 5)
      this.goTo(0);
    else
      Queue.pop().then(record => {
        if (record)
          this.start(record)
      });
  }

  /**
   * Ditto `play` but for pausing.
   *
   * @return {null}
   */
  static pause() {
    if (!this.record)
      return;

    this.media.pause();
    Ui.Player.playButton();
  }

  /**
   * Seeks the current media to the given percentage of time
   * and update the position of the progress bar accordingly.
   *
   * @param  {Number} seconds - The duration to go to.
   * @return {null}
   */
  static goTo(seconds) {
    this.auto_progression  = true;
    this.media.currentTime = seconds;

    Ui.Player.progression(seconds);
  }

  /**
   * Delegates to the instance's `setVolume` method and
   * updates the volume bar. Also stores the current
   * volume in the user's configuration.
   *
   * @param  {Number}   volume      - The volume between 0 and 1.
   * @param  {Boolean=} skip_config - Whether to save the volume
   *                                  in the configuration or not.
   * @return {null}
   */
  static setVolume(volume, skip_config) {
    Ui.Player.setVolume(volume);

    this.media.volume = volume;

    if (!skip_config)
      Config.store(this.record.service, 'volume', volume);
  }

  /**
   * Mutes or unmutes the current volume.
   *
   * @return {null}
   */
  static toggleMute() {
    var volume = Config.read(this.record.service, 'volume');
    var circle = Ui.Player.volume_circle;

    if (Ui.Player.volume_icon.hasClass('glyphicon-volume-up')) {
      this.setVolume(0, true);
      circle.val(1);
    } else {
      this.setVolume(volume, true);
      circle.val(1 - volume);
    }
  }

  /**
   * Toggles the repeat mode for the current playing media.
   *
   * @return {null}
   */
  static toggleRepeat() {
    Ui.Player.toggleRepeat();

    this.media.loop = !this.media.loop;
  }

  /**
   * Changes the playing mode for the current set.
   *
   * @param  {String} mode - The playing mode for the current set.
   * @return {null}
   */
  static currentSetMode(mode) {
    Ui.Player.currentSetMode(Queue.mode, mode);

    Queue.mode == mode ? Queue.setMode(null) : Queue.setMode(mode);
  }

  /**
   * Returns whether the player is paused or not.
   *
   * @return {Boolean}
   */
  static get paused() {
    return this.media.paused;
  }

  /**
   * Sorthand to access the current playing media based
   * upon the record's kind.
   *
   * @return {HTMLMediaElement}
   */
  static get media() {
    if (this.record.kind == 'video')
      return this.video;
    else
      return this.audio;
  }
}
