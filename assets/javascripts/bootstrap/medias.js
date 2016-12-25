$('.content').on('click', '.music, .video', function(e) {
  var self   = $(this);
  var target = $(e.target);

  if (self.is('li') && !target.hasClass('options') && !target.hasClass('glyphicon'))
    Player.preload(self.data('id'), self.parents('.set').data('id'));
  else if (target.is('img') || target.hasClass('title'))
    Player.preload(self.data('id'));
});

$('.playing .items').on('click', '.media-details', function() {
  Player.preload($(this).data('id'), Player.record.set, true);
});

$('.content').on('mouseenter', 'li.music, li.video', function() {
  $(this).find('.options').fadeIn(200);
});

$('.content').on('mouseleave', 'li.music, li.video', function() {
  $(this).find('.options').hide();
});

$('.content').on('click', 'div.box .options-toggler', function() {
  var box     = $(this).parent();
  var options = box.find('.options');

  if (!options.length)
    box.find('.thumbnail').append(Html.options(Cache.current.module));

  box.find('.options').slideToggle();
});

$('.content').on('click', '.options li', function() {
  var options = $(this).parents('.options');
  var media   = options.parents('.music, .video');

  if (media.prop('tagName') == 'LI') {
    options.fadeOut(200);

    Ui[$(this).data('function')](media, media.parents('.playlist'));
  } else {
    options.slideOut();

    Ui[$(this).data('function')](media);
  }
});
