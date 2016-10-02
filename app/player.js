'use strict';

const MetaPlayer = require('../meta/player');
const Queue      = require('./queue');

module.exports = class Player {
  /**
   * Initializes all the necessary elements for audio analysis.
   * These ones should be instantiated just once.
   *
   * @return {null}
   */
  static initialize() {
    this.context  = new AudioContext();
    this.analyser = this.context.createAnalyser();

    this.video_source = this.context.createMediaElementSource(MetaPlayer.video);
    this.audio_source = this.context.createMediaElementSource(MetaPlayer.audio);

    this.video_source.connect(this.analyser);
    this.audio_source.connect(this.analyser);

    this.analyser.connect(this.context.destination);

    this.analyser.fftSize = 128;
  }

  /**
   * Finds the record to play in the cache. Once the record
   * is found, delegates to the `start` method.
   *
   * @param  {String}     id          - The record to play's id.
   * @param  {$=|Record=} playlist    - Optionally the current
   *                                    playlist.
   * @param  {Boolean=}   keep_action - Whether to keep the
   *                                    playing action or not.
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

    // Pretty special feature (TM); hides the search bar when the
    // user starts a new media and the search bar is visible. We
    // assume that they found what they want.
    if ($('.sidebar .search-form').is(':visible'))
      Ui.toggleSearchBar();

    var module = Cache.current.module;
    var action = Cache.current.action;

    MetaModel.findById(id, module, action, playlist).then((record) => {
      if (!keep_action) {
        Cache.playing.module = module;
        Cache.playing.action = action;

        // Reset the current queue's mode
        Queue.setMode(null);
      }

      // Start the playing queue and the media itself.
      Queue.start(record, record.set);
      this.start(record);
    });
  }

  /**
   * Starts the player for a given record. Basically, it just
   * delegates to `MetaPlayer#start` and then delegates to
   * `play` and `setupInterface`.
   *
   * @param  {Media} media - The record to play.
   * @return {null}
   */
  static start(media) {
    this.record = media;

    if (!media.set)
      this.hideCurrentSet();
    else if (media.set)
      this.showCurrentSet();

    // Display as soon as possible the correct interface to
    // tell the user that its media is processed.
    this.setupInterface();

    MetaPlayer.start(media).then(() => {
      this.play();
    });
  }

  /**
   * Facility to play the current media instance. It just
   * delegates to the instance's `play` method and change
   * the class of the pause button.
   *
   * @return {null}
   */
  static play() {
    MetaPlayer.play();

    $('.playpause').removeClass('play')
                   .addClass('pause');
    $('.playpause span').removeClass('glyphicon-play')
                        .addClass('glyphicon-pause');
  }

  /**
   * Plays the next media unless the repeat mode is enabled;
   * in this case, just go to the beginning of the current
   * media.
   *
   * @return {null}
   */
  static playNext() {
    if (this.repeat) {
      this.goTo(0);
      this.play();
    } else {
      Queue.shift().then((set) => {
        this.start(set[0], set[1]);
      });
    }
  }

  /**
   * Plays the previous media unless the current media's time
   * is greater than 5 seconds; in this case, we just rewind
   * it.
   *
   * @return {null}
   */
  static playPrevious() {
    MetaPlayer.currentTime().then((current_time) => {
      if (current_time > 5)
        this.goTo(0);
      else
        Queue.pop().then((set) => {
          this.start(set[0], set[1]);
        });
    })
  }

  /**
   * Ditto `play` but for pausing.
   *
   * @return {null}
   */
  static pause() {
    MetaPlayer.pause();
    this.pauseEqualizer();

    $('.playpause').removeClass('pause')
                   .addClass('play');
    $('.playpause span').removeClass('glyphicon-pause')
                        .addClass('glyphicon-play');
  }

  static reset() {
    this.progression(0);
  }

  /**
   * Seeks the current media to the given percentage of time
   * and update the position of the progress bar accordingly.
   *
   * @param  {Number} seconds - The duration to go to.
   * @return {null}
   */
  static goTo(seconds) {
    MetaPlayer.goTo(seconds);
    this.updateProgressBar(seconds);
  }

  /**
   * Utility method to correctly setup the different pieces
   * of the player's interface when we are playing a media
   * like setting the elements' color, display the media's
   * information, etc.
   *
   * @return {null}
   */
  static setupInterface() {
    this.showEqualizer();

    Queue.previous().then((set) => {
      if (set.first()) {
        $('.previous').removeClass('disabled');
        $('.previous').attr('title', set.first().title);
      } else {
        $('.previous').addClass('disabled');
        $('.previous').attr('title', '');
      }
    });

    Queue.next().then((set) => {
      if (set.first()) {
        $('.next').removeClass('disabled');
        $('.next').attr('title', set.first().title);
      } else {
        $('.next').addClass('disabled');
        $('.next').attr('title', '');
      }
    });

    $('.duration .progression').attr('class', `progression ${this.record.service}`);
    $('.duration .circle').attr('class', `circle ${this.record.service}`);
    $('.duration .circle').attr('max', this.record.duration);

    $('.timing .total').html(this.record.human_time);

    var volume = Config.read(this.record.service, 'volume');

    $('.volume .current').css({ height: volume * 100 + '%' });
    $('.volume .current').attr('class', `current ${this.record.service}`);
    $('.volume .circle').attr('class', `circle ${this.record.service}`);
    $('.volume .circle').val(1 - volume);

    $('.repeat').removeClass('soundcloud youtube local');

    $('.information .icon').show();

    if (this.record.service == 'youtube') {
      $('.information .icon').addClass('video');
      $('.information .icon').removeClass('music');
    } else {
      $('.information .icon').addClass('music');
      $('.information .icon').removeClass('video');
    }

    $('.information .current .artist').html(this.record.artist);
    $('.information .current .artist').attr('title', this.record.artist);
    $('.information .current .title').html(this.record.title);
    $('.information .current .title').attr('title', this.record.title);
    $('.information .icon img').attr('src', this.record.icon);
  }

  /**
   * Displays the current set's icon and copies its items.
   *
   * @return {null}
   */
  static showCurrentSet() {
    var items = $('.player .items');
    var sneak = items.find('.sneak-peek');
    var list  = items.find('ul');
    var set   = this.record.set;

    $('.current-set').show();

    if (set instanceof Album)
      $('.current-set .glyphicon').removeClass('glyphicon-list')
                                  .addClass('glyphicon-cd');
    else
      $('.current-set .glyphicon').removeClass('glyphicon-cd')
                                  .addClass('glyphicon-list');

    sneak.find('.set-title').html(set.title);
    sneak.find('.set-count').html(set.items.length + " items");

    list.empty();
    items.attr('data-id', set.id);

    set.items.forEach((item) => {
      list.append(Handlebars.helpers.playlist_item(item).string);
    });
  }

  /**
   * Hides the current set's icon and clears its items.
   *
   * @return {null}
   */
  static hideCurrentSet() {
    $('.current-set').hide();
    $('.player .items ul').empty();
  }

  /**
   * Shows the loader for the current media; this is triggered
   * when the media is loading (only for SoundCloud and Youtube).
   *
   * @return {null}
   */
  static showLoader() {
    $('.information .shadow.loading').show();
    $('.information .shadow.loading').html(`<div class="loader">
                                              <div class="rect1"></div>
                                              <div class="rect2"></div>
                                              <div class="rect3"></div>
                                              <div class="rect4"></div>
                                              <div class="rect5"></div>
                                           </div>`);
  }

  /**
   * Hides the loader for the current media.
   *
   * @return {null}
   */
  static hideLoader() {
    $('.information .shadow.loading').empty('');
    $('.information .shadow.loading').fadeOut(200);
  }

  /**
   * Displays the current progression of the media by
   * updating the current time and setting the progress bar
   * width and the position of the circle cursor.
   *
   * This method can be interrupted by setting the value of
   * the player's `auto_progression` value to `false`.
   *
   * @param  {Number} current_time - The current time.
   * @return {null}
   */
  static progression(current_time) {
    if (Player.auto_progression == false)
      return;

    this.updateProgressBar(current_time);

    $('.timing .current').html(Formatter.time(current_time));
  }

  /**
   * Updates the width of the progress bar and the position
   * of the circle cursor.
   *
   * @param  {Number} seconds - The current time.
   * @return {null}
   */
  static updateProgressBar(seconds) {
    var width = seconds == 0 ? seconds : (seconds / this.record.duration);

    $('.duration .progression').css({ width: width * 100 + '%' });
    $('.duration .circle').val(seconds);
  }

  /**
   * Updates the width of the buffer bar.
   *
   * @param  {Number} seconds - The number of seconds buffered.
   * @return {null}
   */
  static updateBufferBar(time_buffered) {
    var width = time_buffered == 0 ? time_buffered : (time_buffered / this.record.duration);

    $('.duration .buffered').animate({
      width: width * 100 + '%'
    }, 250);
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
    $('.volume .current').css({ height: volume * 100 + '%' });

    if (volume == 0)
      $('.volume .glyphicon').removeClass('glyphicon-volume-up')
                             .addClass('glyphicon-volume-off');
    else
      $('.volume .glyphicon').removeClass('glyphicon-volume-off')
                             .addClass('glyphicon-volume-up');

    MetaPlayer.setVolume(volume);

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
    var circle = $('.volume .circle');

    if ($('.volume .glyphicon').hasClass('glyphicon-volume-up')) {
      this.setVolume(0, true);
      circle.val(1);
    } else {
      this.setVolume(volume, true);
      circle.val(1 - volume);
    }
  }

  /**
   * Returns whether the player is paused or not.
   *
   * @return {Boolean}
   */
  static get paused() {
    return MetaPlayer.isPaused();
  }

  /**
   * Toggles the repeat mode for the current playing media.
   *
   * @return {null}
   */
  static toggleRepeat() {
    if (this.repeat)
      $('.repeat').removeClass('soundcloud youtube local');
    else
      $('.repeat').addClass(this.record.service);

    this.repeat = !this.repeat;
  }

  /**
   * Toggles the playing mode for the current set.
   *
   * @return {null}
   */
  static toggleSetMode(mode) {
    if (Queue.mode)
      $('.set-switches .glyphicon').removeClass('soundcloud youtube local');

    if (Queue.mode != 'loop' && mode == 'loop')
      $('.set-switches .glyphicon-repeat').addClass(this.record.service);
    else if (Queue.mode != 'random' && mode == 'random')
      $('.set-switches .glyphicon-random').addClass(this.record.service);

    Queue.mode == mode ? Queue.setMode(null) : Queue.setMode(mode);
  }

  /**
   * Shows an animated equalizer on the current playing action's
   * link in the sidebar. Basically creates the element.
   *
   * @return {null}
   */
  static showEqualizer() {
    var module  = Cache.playing.module;
    var action  = Cache.playing.action;

    var current = $(`.equalizer`).parents("a");
    var future  = $(`a[href="${Router.from(module, action)}"]`);

    // Do nothing if the current track is played through the
    // same action.
    if (current[0] == future[0])
      return;

    // Clear current equalizer
    if (current)
      current.find('.equalizer').remove();

    future.append(`<div class="equalizer">
                    <div class="rect1"></div>
                    <div class="rect2"></div>
                    <div class="rect3"></div>
                  </div>`);
  }

  /**
   * Starts the animation of the different bars of the equalizer.
   *
   * @return {null}
   */
  static startEqualizer() {
    Ui.animateHeight($('.equalizer .rect1'));
    Ui.animateHeight($('.equalizer .rect2'));
    Ui.animateHeight($('.equalizer .rect3'));
  }

  /**
   * Returns a random value from the array returned by the
   * audio context's `getByteFrequencyData` method.
   *
   * This method is used to give an idea of the height of
   * the equalizer bars.
   *
   * @return {Float}
   */
  static sample() {
    var dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    this.analyser.getByteFrequencyData(dataArray);

    return dataArray[Math.floor(Math.random() * (dataArray.length / 2))] / 256;
  }

  /**
   * Pauses the animation of the equalizer.
   *
   * @return {null}
   */
  static pauseEqualizer() {
    $('.equalizer .rect1').stop(true);
    $('.equalizer .rect2').stop(true);
    $('.equalizer .rect3').stop(true);
  }
}
