$('.content').on('click', '.music, .video', function(e) {
  var self   = $(this);
  var target = $(e.target);

  if (self.is('li') && !target.hasClass('options') && !target.hasClass('glyphicon'))
    Player.preload(self, self.parents('.set'));
  else if (target.is('img') || target.hasClass('title'))
    Player.preload(self);
});

$('.items').on('click', 'li.music, li.video', function() {
  Player.preload($(this), Player.record.set, true);
});

$('.content').on('mouseenter', 'li.music, li.video', function() {
  $(this).find('.glyphicon').fadeIn(200);
});

$('.content').on('mouseleave', 'li.music, li.video', function() {
  $(this).find('.glyphicon').hide();
});

$('.content').on('click', 'div.box .options-toggler', function() {
  var box     = $(this).parent();
  var options = box.find('.options');

  if (!options.length)
    box.find('.thumbnail').append(Html.options(Cache.current.module));

  box.find('.options').slideToggle();
});

$('.content').on('click', 'li .options-toggler', function() {
  var item    = $(this).parents('li');
  var options = item.find('.options');

  if (!options.length)
    item.find('.right').prepend(Html.options(Cache.current.module, true));
  else
    options.fadeToggle(200);
});

$('.content').on('click', '.options li', function() {
  var options = $(this).parents('.options');
      options.slideToggle();
  var media   = options.parents('.music, .video');

  if (media.prop('tagName') == 'LI')
    Ui[$(this).data('function')](media, media.parents('.playlist'));
  else
    Ui[$(this).data('function')](media);
});
