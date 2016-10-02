// ----------------------------------------------------------
// >> First part
//
// Handle events on play, pause, next, previous buttons.
$('.playpause').click(function() {
  if ($(this).hasClass('pause'))
    Player.pause();
  else
    Player.play();
});

$('.previous').click(function() {
  Player.playPrevious();
});

$('.next').click(function() {
  Player.playNext();
});

// ----------------------------------------------------------
// >> Duration part
//
// Handle clicks on the progress bar; everything is up to
// the range input.
$('.duration .circle').on('click', function(e) {
  e.preventDefault();

  Player.goTo((e.offsetX / $('.duration').width()) * $(this).attr('max'));
});

$('.duration .progression').on('click', function(e) {
  Player.goTo((e.offsetX / $('.duration').width()) * Player.record.duration);
});

// Handle the dragging of the range input.
$('.duration .circle').on('input', function(e) {
  var value = e.currentTarget.value;

  Player.auto_progression = false;

  // If the user drags the input to the very beginning
  // but releases the mouse outside of the bar, the `click`
  // event is not triggered so the position is updated but
  // not the media's current time.
  if (value == 0)
    Player.goTo(0);
  else
    Ui.Player.progression(value, true);
});

// ----------------------------------------------------------
// >> Volume preferences
//
// Display/hide the volume bar passing the mouse over the
// volume icon.
$('.volume').on('mouseenter', function() {
  $('.volume-information').fadeIn(200);
});

$('.volume').on('mouseleave', function() {
  $('.volume-information').fadeOut(200);
});

// Mute/unmute clicking on the volume icon.
$('.volume').on('click', function(e) {
  var target = $(e.target);

  if (!target.hasClass('volume-information') && !target.hasClass('circle'))
    Player.toggleMute();
});

// Change the current volume clicking on the bar
$('.volume .circle').on('input', function(e) {
  Player.setVolume(1 - e.currentTarget.value);
});

// ----------------------------------------------------------
// >> Playing loop
//
// Enable/disable the playing loop for the current track
$('.repeat').on('click', function() {
  Player.toggleRepeat();
});

// ----------------------------------------------------------
// >> Information part

// In case of a video, display a solid-background passing
// the mouse on the icon to specify that it's possible to
// display the video with a bigger solid-background and
// display the latter, clicking on the icon or the fullscreen
// video, double-clicking on it.
$('.information').on('mouseenter', '.icon.video', function() {
  if (!$('.shadow.main').is(':visible'))
    $('.shadow.small.video').fadeIn(200);
});

$('.information').on('mouseleave', '.icon.video', function() {
  $('.shadow.small.video').fadeOut(200);
});

$('.information').on('click', '.icon.video', function() {
  Ui.showVideoPlayer();
});

// ----------------------------------------------------------
// >> Current set
//
// Change the playing mode for the current set.
$('.set-switches .glyphicon-repeat').on('click', function() {
  Player.currentSetMode('loop');
});

$('.set-switches .glyphicon-random').on('click', function() {
  Player.currentSetMode('random');
});

// Display the current set if there's one.
$('.current-set').on('click', function() {
  $('.player .items').fadeToggle(200);
});
