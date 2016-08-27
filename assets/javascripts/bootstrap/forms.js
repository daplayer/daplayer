$('.content').on('click', '#new_playlist', function() {
  $(this).toggleClass('active');
  $('.bubble').fadeToggle(200);
});

$('.content').on('submit', '#add_playlist', function(e) {
  e.preventDefault();

  var title = $(this).find('input[name="title"]').val();

  if (title.length) {
    Ui.createPlaylist(title, 'local');

    $('.content').append(Handlebars.helpers.local_playlist({
      title: title,
      icon:  Paths.default_artwork,
      items: []
    }).string);

    $('.bubble').fadeOut(200);
    $('#new_playlist').removeClass('active');
  }
});
