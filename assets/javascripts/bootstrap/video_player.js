// Pause/play the video clicking on it.
$('video').on('click', function() {
  if (Player.paused)
    Player.play();
  else
    Player.pause();
});

// Toggle full-screen double-clicking on the video.
$('video').on('dblclick', function() {
  Ui.toggleFullScreen();
});

var hide;

// Show/hide the video's controls moving the mouse inside
// the video's area. The controls are automatically hidden
// after two seconds of "inactivity".
$('.player_frame').on('mousemove', function() {
  Ui.showVideoControls();

  if (hide)
    clearTimeout(hide);

  hide = setTimeout(function() {
    Ui.hideVideoControls();
  }, 2000);
}).on('mouseleave', () => {
  clearTimeout(hide);

  Ui.hideVideoControls();
});

// Manage clicks on the different video controls.
$('.player_frame').on('click', '.fullscreen-switch', function() {
  Ui.toggleFullScreen();
});

// Make sure to correctly set-up the user interface if the user
// exits the full screen mode by pressing the "Esc" or "F11" key;
// the `Ui#exitFullScreen` function would not be called.
$(document).on('webkitfullscreenchange', function() {
  if (!document.webkitIsFullScreen)
    Ui.exitFullScreen();
});
