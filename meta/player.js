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
    var loader, service = record.service;

    this.stop();

    if (service != 'local')
      Player.showLoader();

    if (service == 'soundcloud')
      loader = SoundCloudPlayer.load(record.id);
    else if (service == 'youtube')
      loader = YouTubePlayer.load(record.id);
    else if (record.service == 'local')
      loader = LocalPlayer.load(record.id);

    return loader.then((url) => {
      if (service == 'youtube') {
        this.is_video  = true;
        this.video.src = url.url;
        this.video.load();

        YouTubePlayer.callbacks(this.video);
      } else {
        this.is_video  = false;
        this.audio.src = url;
        this.audio.load();

        if (service == 'soundcloud')
          SoundCloudPlayer.callbacks(this.audio);
        else if (service == 'local')
          LocalPlayer.callbacks(this.audio);
      }
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
