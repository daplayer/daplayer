'use strict';

const SoundCloudPlayer = require('../soundcloud/player');
const YouTubePlayer    = require('../youtube/player');
const LocalPlayer      = require('../local/player');

module.exports = class MetaPlayer {
  /**
   * Starts a brand new media (audio or video) given
   * a `Record` object.
   *
   * It basically delegates to stop and to the right service's
   * player class' `load` method
   *
   * @param  {Record} record
   * @return {Promise}
   */
  static start(record) {
    var player, service = record.service;

    this.stop();

    if (service != 'local')
      Player.showLoader();

    if (service == 'soundcloud')
      player = SoundCloudPlayer;
    else if (service == 'youtube')
      player = YouTubePlayer;
    else if (service == 'local')
      player = LocalPlayer;

    return player.load(record.id).then((url) => {
      if (record.media == 'video')
        this.is_video = true;
      else
        this.is_video = false;

      this.media.src = url;
      this.media.load();

      player.callbacks(this.media);
    })
  }

  static play() {
    this.media.play();
  }

  static pause() {
    this.media.pause();
  }

  static stop() {
    this.pause();

    this.audio.src = '';
    this.video.src = '';

    Player.reset();
  }

  static goTo(seconds) {
    this.media.currentTime = seconds;
  }

  static setVolume(volume) {
    this.media.volume = volume;
  }

  static currentTime() {
    return Promise.resolve(this.media.currentTime);
  }

  static isPaused() {
    return this.media.paused;
  }

  static get media() {
    if (this.is_video)
      return this.video;
    else
      return this.audio;
  }

  static get audio() {
    if (!this.audio_media)
      this.audio_media = new Audio();

    return this.audio_media;
  }

  static get video() {
    if (!this.video_media)
      this.video_media = document.querySelector('.video_player');

    return this.video_media;
  }
}
