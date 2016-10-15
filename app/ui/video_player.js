'use strict';

module.exports = class UiVideoPlayer {
    /**
   * Shows the video player and the black transparent
   * shadow as well. Hides the dialog box if it is
   * already open.
   *
   * @return {null}
   */
  static show() {
    if ($('.dialog').is(':visible'))
      $('.dialog').hide();
    else
      $('.shadow.main').show();

    $('.video.player').show();
  }

  /**
   * Shows the video player's controls.
   *
   * @return {null}
   */
  static showControls() {
    $('.video.player .controls').stop().fadeIn(200);

    if (document.webkitIsFullScreen)
      $('.video.player video').css({ cursor: 'pointer' });
  }

  /**
   * Hides the video player's controls.
   *
   * @return {null}
   */
  static hideControls() {
    $('.video.player .controls').stop().fadeOut(300);

    if (document.webkitIsFullScreen)
      $('.video.player video').css({ cursor: 'none' });
  }

  /**
   * Displays the video player in full-screen mode.
   *
   * @return {null}
   */
  static enterFullScreen() {
    $('.fullscreen-switch span').removeClass('glyphicon-fullscreen')
                                .addClass('glyphicon-resize-small');

    document.querySelector('.player_frame').webkitRequestFullScreen();

    $('.video.player .playpause').show();
    $('.video.player .timing').show();
    $('.video.player .duration').show();
  }

  /**
   * Exits the video player from full-screen mode.
   *
   * @return {null}
   */
  static exitFullScreen() {
    $('.fullscreen-switch span').removeClass('glyphicon-resize-small')
                                .addClass('glyphicon-fullscreen');

    $('.player_frame video').css({ cursor: 'pointer' });

    document.webkitExitFullscreen();

    $('.video.player .playpause').hide();
    $('.video.player .timing').hide();
    $('.video.player .duration').hide();
  }

  /**
   * Toggles the full screen mode for the video player.
   *
   * @return {null}
   */
  static toggleFullScreen() {
    if (document.webkitIsFullScreen)
      this.exitFullScreen();
    else
      this.enterFullScreen();
  }
}
