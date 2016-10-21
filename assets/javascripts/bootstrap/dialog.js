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

  LocalService.tag(form.find('input[name="id"]').val(), {
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

// --------------------------------------------------------
// > "Add to playlist" dialogs
//
// Handle click on the "Add to playlist" button in dialog
$('.dialog').on('click', '.add_to_playlist.button', function(e) {
  e.preventDefault();

  var form       = $(this).parents('form');
  var checkboxes = form.find('input[type="checkbox"]:checked');
  var id         = form.find('input[name="record-id"]').val();
  var module     = Cache.current.module;
  var action     = Cache.current.action;

  checkboxes.each(function() {
    var service = $(this).data('service');
    var id      = $(this).val();

    Model.for(module).findById(id, action).then((record) => {
      Model.for(service).addToPlaylist(id, record);
    });
  });

  $('.dialog').fadeOut(200, function() {
    $('.shadow.main').hide();
  });
});

// Handle clicks on the filter links
$('.dialog').on('click', 'nav a', function() {
  if ($(this).hasClass('active'))
    return;

  $('.dialog .navbar a.active').removeClass('active');
  $(this).addClass('active');

  var tohide = $('.dialog ul').not('.hidden');
  var toshow = $('.dialog ul.hidden');

  tohide.addClass('hidden').hide();
  toshow.removeClass('hidden').show();
});

// Handle pressing "return" inside the "New playlist" field
//
// It is important to use 'keydown' and not 'keyup', otherwise
// the `preventDefault()` call happens too late.
$('.dialog').on('keydown', '#new_playlist', function(e) {
  if (e.keyCode == 13) {
    e.preventDefault();

    var service = $('.dialog .navbar a.active').data('service');
    var title   = $(this).val();

    Model.for(service).createPlaylist(title).then((playlist) => {
      $(this).val('');

      // Create the new option
      $('.dialog .items ul:visible').append(View.partial('meta/partials/playlist_option', {
        title:   title,
        service: service,
        id:      playlist.id
      }).string);
    });
  }
});
