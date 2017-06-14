// --------------------------------------------------------
// > "Add to playlist" dialogs
//
// Handle click on the "Add to playlist" button in dialog
$('.dialog').on('click', '.add_to_playlist.button', function(e) {
  e.preventDefault();

  var form       = $(this).parents('form');
  var checkboxes = form.find('input[type="checkbox"]:checked');
  var id         = form.find('input[name="record-id"]').val();
  var record     = Record.from(id);

  checkboxes.each(function() {
    var service     = $(this).data('service');
    var playlist_id = $(this).val();

    Model.for(service).addToPlaylist(playlist_id, record);
  });

  Ui.hideShadow();
});

// Handle clicks on the filter links
$('.dialog').on('click', 'nav li', function() {
  if ($(this).hasClass('active'))
    return;

  $('.dialog .navbar li.active').removeClass('active')
  $(this).addClass('active');

  var tohide = $('.dialog .items ul').not('.hidden')
  var toshow = $('.dialog .items ul.hidden')

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

      let partial_path = 'app/partials/playlist_option'
      let context      = {
        title:   title,
        service: service,
        id:      playlist.id
      }

      // Create the new option
      $('.dialog .items ul:visible').append(View.compile(partial_path)(context))
    });
  }
});
