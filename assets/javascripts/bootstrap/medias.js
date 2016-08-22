$('.content').on('click', '.music.box img, .video.box img', function() {
  Player.preload($(this).parents('.box').data('id'));
});

$('.content').on('click', '.music.box .title', '.video.box .title', function() {
  Player.preload($(this).parents('.box').data('id'));
});

$('.content').on('click', 'li.music, li.video', function() {
  Player.preload($(this).data('id'), $(this).parents('.playlist'));
});

$('.items').on('click', 'li.music, li.video', function() {
  Player.preload($(this).data('id'), Player.playlist, true);
});

$('.content').on('mouseenter', 'li.music, li.video', function() {
  $(this).find('.glyphicon').fadeIn(200);
});

$('.content').on('mouseleave', 'li.music, li.video', function() {
  $(this).find('.glyphicon').hide();
});
