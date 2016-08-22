// Hide the solid-background clicking on it.
$('.shadow.main').on('click', function(e) {
  if (!$(e.target).hasClass('shadow'))
    return;

  Ui.hideShadow();
});

// Pause/play the video clicking on it
$('.shadow.main').on('click', '.video_player', function() {
  if (Player.paused)
    Player.play();
  else
    Player.pause();
});

// Enable full-screen double-clicking on the video
$('.shadow.main').on('dblclick', '.video_player', function() {
  $(this)[0].webkitRequestFullScreen();
});

// Show/hide the video's controls passing the mouse over it
// or leaving the area.
$('.player_frame_container').on('mouseenter', function() {
  $('.player_frame_container .controls').fadeIn(200);
});

$('.player_frame_container').on('mouseleave', function() {
  $('.player_frame_container .controls').fadeOut(300);
});

// Manage clicks on the different video controls
$('.controls').on('click', '.glyphicon-share-alt', function() {
  Ui.share(Player.element);
}).on('click', '.glyphicon-download-alt', function() {
  Ui.download(Player.element);
}).on('click', '.glyphicon-fullscreen', function() {
  $('.player_frame_container')[0].webkitRequestFullScreen();
});
