// --------------------------------------------------------
// Handle click on download buttons in dialogs
$('.dialog').on('click', '.download.button', function(e) {
  e.preventDefault();

  var form = $(this).parents('form');
  var tags = form.extractFields();

  if (form.data('service') == 'soundcloud')
    SoundCloudService.download(tags);
  else if (form.data('service') == 'youtube')
    YouTubeService.download(tags);

  Ui.hideShadow();
});

// --------------------------------------------------------
// Handle click on the tag button in dialog
$('.dialog').on('click', '.tag.button', function(e) {
  e.preventDefault();

  var form = $(this).parents('form');
  var tags = form.extractFields();

  LocalService.tag(form.find('input[name="id"]').val(), tags);

  var body = tags.title;

  if (tags.artist)
    body += ' - ' + tags.artist;

  Notification.show({
    action: Translation.t('meta.actions.tagged'),
    title:  body,
    icon:   tags.icon
  });

  var element = $(`.music[data-id="${tags.id.replace('"', "\\\"")}"]`);

  element.title(tags.title);
  element.artist(tags.artist);

  Model.for('local').findRecord(tags.id, Cache.current.action).then((record) => {
    record.title  = tags.title;
    record.artist = tags.artist;
    record.genre  = tags.genre;
  });

  Ui.hideShadow();
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

  Ui.hideShadow();
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
