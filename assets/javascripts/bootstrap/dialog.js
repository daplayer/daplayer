// --------------------------------------------------------
// Handle click on download buttons in dialogs
$('.dialog').on('click', '.download.button', function(e) {
  e.preventDefault();

  var form  = $(this).parents('form');
  var id    = form.find('input[name="id"]').val();
  var title = form.find('input[name="title"]').val();
  var icon  = form.find('img').attr('src');

  if (form.data('service') == 'soundcloud') {
    var artist = form.find('input[name="artist"]').val();
    var genre  = form.find('input[name="genre"]').val();

    SoundCloudService.download(id, title, artist, genre, icon);
  } else if (form.data('service') == 'youtube') {
    var format = form.find('input[name="format"]:checked').val();

    YouTubeService.download(id, title, icon, format);
  }

  $('.dialog').fadeOut(200, function() {
    $('.shadow.main').hide();
  });
});

// --------------------------------------------------------
// Handle click on the tag button in dialog
$('.dialog').on('click', '.tag.button', function(e) {
  e.preventDefault();

  var form = $(this).parents('form');

  LocalService.tag({
    id:     form.find('input[name="id"]').val(),
    title:  form.find('input[name="title"]').val(),
    artist: form.find('input[name="artist"]').val(),
    album:  form.find('input[name="album"]').val(),
    genre:  form.find('input[name="genre"]').val(),
    image:  form.find('img').attr('src')
  });

  $('.dialog').fadeOut(200, function() {
    $('.shadow.main').hide();
  });
});

// Handle click on the button to change the cover picture
$('.dialog').on('click', '.picture.flat_button', function(e) {
  FilePicker.open('picture', function(chosen) {
    $('.dialog input[name="picture"]').attr('value', chosen);
    $('.dialog img').attr('src', chosen);
  });
});

// --------------------------------------------------------
// Handle click on the "Add to playlist" button in dialog
$('.dialog').on('click', '.add_to_playlist.button', function(e) {
  e.preventDefault();

  var form       = $(this).parents('form');
  var checkboxes = form.find('input[type="checkbox"]:checked');
  var id         = form.find('input[name="record-id"]').val();
  var module     = Cache.current.module;
  var action     = Cache.current.action;
  var playlists  = [];

  checkboxes.each(function() {
    MetaModel.addToPlaylist(module, action, id, {
      id:      $(this).val(),
      service: $(this).data('service')
    });
  });

  $('.dialog').fadeOut(200, function() {
    $('.shadow.main').hide();
  });
});
