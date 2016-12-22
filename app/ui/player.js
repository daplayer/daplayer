'use strict';

module.exports = class UiPlayer {
  static get el() {
    if (!this.elements)
      this.elements = {
        previous:        $('.previous'),
        play_pause:      $('.playpause'),
        play_pause_icon: $('.playpause span'),
        next:            $('.next'),

        progress_bar:    $('.duration .progression'),
        progress_circle: $('.duration .circle'),
        buffered_bar:    $('.duration .buffered'),

        current_time:   $('.timing .current'),
        total_duration: $('.timing .total'),

        volume_bar:    $('.volume .current'),
        volume_icon:   $('.volume .glyphicon'),
        volume_circle: $('.volume .circle'),

        repeat: $('.repeat'),

        playing_section: $('.playing'),
        playing_details: $('.playing .media-details'),
        playing_icon:    $('.playing .media-details .thumbnail'),
        loading_shadow:  $('.playing .shadow.loading'),

        playing_set_icon:     $('.playing .set-icon'),
        playing_set_glyph:    $('.playing .set-icon .glyphicon'),
        playing_set_items:    $('.playing .set .items'),
        playing_set_details:  $('.playing .set .details'),
        playing_set_switches: $('.playing .switches .glyphicon'),
        playing_set_repeat:   $('.playing .switches .glyphicon-repeat'),
        playing_set_random:   $('.playing .switches .glyphicon-random'),
      };

    return this.elements;
  }

  static get record() {
    return Player.record;
  }

  /**
   * Changes the appearance of the play/pause button to have
   * a play icon.
   *
   * @return {null}
   */
  static pauseButton() {
    this.play_pause.removeClass('play')
                    .addClass('pause');
    this.play_pause_icon.removeClass('glyphicon-play')
                        .addClass('glyphicon-pause');
  }

  /**
   * Changes the appearance of the play/pause button to have
   * a pause icon.
   *
   * @return {null}
   */
  static playButton() {
    this.play_pause.removeClass('pause')
                    .addClass('play');
    this.play_pause_icon.removeClass('glyphicon-pause')
                        .addClass('glyphicon-play');
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

    Queue.previous().then((record) => {
      if (record) {
        this.previous.removeClass('disabled');
        this.previous.attr('title', record.title);
      } else {
        this.previous.addClass('disabled');
        this.previous.attr('title', '');
      }
    });

    Queue.next().then((record) => {
      if (record) {
        this.next.removeClass('disabled');
        this.next.attr('title', record.title);
      } else {
        this.next.addClass('disabled');
        this.next.attr('title', '');
      }
    });

    this.progress_bar.attr('class', `progression ${this.record.service}`);
    this.progress_circle.attr('class', `circle ${this.record.service}`);
    this.progress_circle.attr('max', this.record.duration);

    this.total_duration.html(this.record.human_time);

    var volume = Config.read(this.record.service, 'volume');

    this.volume_bar.css({ height: volume * 100 + '%' });
    this.volume_bar.attr('class', `current ${this.record.service}`);
    this.volume_circle.attr('class', `circle ${this.record.service}`);
    this.volume_circle.val(1 - volume);

    this.repeat.removeClass('soundcloud youtube local');

    this.playing_section.show();

    this.playing_details.removeClass('music video')
                        .addClass(this.record.kind);

    this.playing_icon.removeClass('music video')
                     .addClass(this.record.kind)
                     .find('img').attr('src', this.record.icon);

    this.playing_details.title(this.record.title);
    this.playing_details.artist(this.record.artist, this.record.isLocal());
  }

  /**
   * Displays the current progression of the media by
   * updating the current time and setting the progress bar
   * width and the position of the circle cursor.
   *
   * This method can be interrupted by setting the value of
   * the Player's `auto_progression` value to `false`.
   *
   * @param  {Number}   time    - The current time.
   * @param  {Boolean=} boolean - By-pass the `auto_progression`
                                  check to force update.
   * @return {null}
   */
  static progression(time, bypass) {
    if (Player.auto_progression == false && !bypass)
      return;

    var width = time == 0 ? time : (time / this.record.duration);

    this.progress_bar.css({ width: width * 100 + '%' });
    this.progress_circle.val(time);

    this.current_time.html(Formatter.time(time));
  }

  /**
   * Updates the width of the buffer bar.
   *
   * @param  {Number} time - The number of seconds buffered.
   * @return {null}
   */
  static buffered(time) {
    var width = time == 0 ? time : (time / this.record.duration);

    this.buffered_bar.animate({
      width: width * 100 + '%'
    }, 250);
  }

  /**
   * Updates the volume bar's height and sets the right
   * volume icon.
   *
   * @param  {Number} volume - The chosen volume.
   * @return {null}
   */
  static setVolume(volume) {
    this.volume_bar.css({ height: volume * 100 + '%' });

    if (volume == 0)
      this.volume_icon.removeClass('glyphicon-volume-up')
                      .addClass('glyphicon-volume-off');
    else
      this.volume_icon.removeClass('glyphicon-volume-off')
                      .addClass('glyphicon-volume-up');
  }

  /**
   * Toggles the active state of the repeat icon.
   *
   * @return {null}
   */
  static toggleRepeat() {
    if (Player.media.loop)
      this.repeat.removeClass('soundcloud youtube local');
    else
      this.repeat.addClass(this.record.service);
  }

    /**
   * Displays the current set's icon and copies its items.
   *
   * @return {null}
   */
  static showCurrentSet() {
    var set = this.record.set;

    this.playing_set_icon.show();

    if (set instanceof Album)
      this.playing_set_glyph.removeClass('glyphicon-list')
                           .addClass('glyphicon-cd');
    else
      this.playing_set_glyph.removeClass('glyphicon-cd')
                           .addClass('glyphicon-list');

    this.playing_set_details.find('.title').html(set.title);
    this.playing_set_details.find('.count').html(set.items.length + " items");

    this.playing_set_items.html('');

    set.items.forEach((item) => {
      this.playing_set_items.append(Handlebars.helpers.media_details(item).string);
    });
  }

  /**
   * Hides the current set's icon and clears its items.
   *
   * @return {null}
   */
  static hideCurrentSet() {
    this.playing_set_icon.hide();
    this.playing_set_items.find('.media-details').remove();
  }

  /**
   * Toggles the playing mode for the current set.
   *
   * @return {null}
   */
  static currentSetMode(previous, wanted) {
    if (previous)
      this.playing_set_switches.removeClass('soundcloud youtube local');

    if (previous != 'loop' && wanted == 'loop')
      this.playing_set_repeat.addClass(this.record.service);
    else if (previous != 'random' && wanted == 'random')
      this.playing_set_random.addClass(this.record.service);
  }

  /**
   * Shows the loader for the current media; this is triggered
   * when the media is loading (only for SoundCloud and Youtube).
   *
   * @return {null}
   */
  static showLoader() {
    this.loading_shadow.show();
    this.loading_shadow.html(`<div class="loader">
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
    this.loading_shadow.empty('');
    this.loading_shadow.fadeOut(200);
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
   * Pauses the animation of the equalizer.
   *
   * @return {null}
   */
  static pauseEqualizer() {
    $('.equalizer .rect1').stop(true);
    $('.equalizer .rect2').stop(true);
    $('.equalizer .rect3').stop(true);
  }

  /**
   * Short hand to reset the progress bar.
   *
   * @return {null}
   */
  static reset() {
    this.progression(0);
  }
}
