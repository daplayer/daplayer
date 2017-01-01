$('.content').on('click', '.music, .video', function(e) {
  var self   = $(this);
  var target = $(e.target);

  if (self.is('li') && !target.hasClass('flat_button') && !target.hasClass('glyphicon'))
    Player.preload(self.data('id'), self.parents('.set').data('id'));
  else if (target.is('img') || target.hasClass('title'))
    Player.preload(self.data('id'));
});

$('.playing .items').on('click', '.media-details', function() {
  Player.preload($(this).data('id'), Player.record.set, true);
});

$('.content').on('click', 'div.box .options-toggler', function() {
  var box = $(this).parent();

  if (!box.has('.options').length)
    box.append(Html.options(Cache.current.module));

  var options = box.find('.options');
  var caption = box.find('.caption');

  if (options.css('left') == '10px') {
    options.animate({ left: `${box.width() + 30 }px` }, 200);
    caption.animate({ left: '10px' }, 300);

  } else {
    caption.animate({ left: `-${box.width()}px` }, 200);
    options.animate({ left: '10px' }, 300);
  }
});

$('.content').on('click', '.options .flat_button', function() {
  var options = $(this).parents('.options');
  var media   = options.parents('.music, .video');

  if (media.prop('tagName') == 'LI')
    Ui[$(this).data('function')](media.data('id'), media.parents('.set').data('id'));
  else
    Ui[$(this).data('function')](media.data('id'));
});
