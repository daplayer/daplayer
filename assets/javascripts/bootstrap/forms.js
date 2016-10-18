// --------------------------------------------------------
// Configuration interface
//
// Manage the different actions interacting with the
// configuration form.

// Enable/disable download path fields when downloads are
// place in the same folder as local musics.
$('.content').on('change', '#lock_download', function() {
  if ($(this).is(':checked')) {
    $('#soundcloud_download').prop('disabled', true);
    $('#youtube_download').prop('disabled', true);
    $('#local_path').change();
  } else {
    $('#soundcloud_download').prop('disabled', false);
    $('#youtube_download').prop('disabled', false);
  }
});

// Change the value of the downloads fields on the fly if
// downloads are stored in the same folder as the local musics.
$('.container').on('change keyup', '#local_path', function() {
  if ($('#lock_download').is(':checked')) {
    var root = $(this).val();
        root = root.last() == '/' ? root.slice(0, -1) : root;

    $('#soundcloud_download').attr('value', root + '/SoundCloud');
    $('#youtube_download').attr('value', root + '/YouTube');
  }
});

// Display a file selector clicking on the tiny buttons next
// to the location/download fields.
$('.content').on('click', '.configuration .tiny_button', function() {
  var field = $(this).data('field');

  // Early return if the download folders are locked for
  // SoundCloud and YouTube.
  if (field != 'local' && $('#lock_download').is(':checked'))
      return;

  FilePicker.open('directory', function(chosen) {
    var suffix = field == 'local' ? '_path' : '_download';

    $('#' + field + suffix).attr('value', chosen).change();
  });
});

// Handle save of the configuration.
$('.content').on('submit', 'form.configuration', function(e) {
  e.preventDefault();

  var original_locale = Config.meta.locale;

  var locale  = $('input[name="locale"]:checked').val();
  var quality = $('input[name="quality"]:checked').val();

  var local_path          = $('#local_path').val();
  var soundcloud_download = $('#soundcloud_download').val();
  var youtube_download    = $('#youtube_download').val();

  var lock_download = $('#lock_download').is(':checked');

  Config.store('meta', 'locale', locale);
  Config.store('soundcloud', 'download', soundcloud_download);
  Config.store('youtube', 'download', youtube_download);
  Config.store('youtube', 'quality', quality);
  Config.store('local', 'path', local_path);
  Config.store('local', 'lock_download', lock_download);

  // Reload the contents if the locale has been changed
  if (locale != original_locale) {
    Translation.load();
    Ui.loadPartials(true);
    Ui.refresh();
  }
});

// --------------------------------------------------------
// Handle clicks on add button
//
// When the user wants to add an entry to their list of "Listen
// later" medias, they paste an address and click on the "Add"
// button ; it's added to the configuration file and displayed
// on the page as well.
$('.content').on('click', '.add', function() {
  var input   = $('input[name="address"]');
  var address = input.val();
  var html    = `<div class="basic-box"><ul><li>${address}</li></ul></div>`;

  // Store the value to the file system
  LocalModel.listenLaterTo(address);

  // Clear the input
  input.val('');

  // Display the new item
  $(html).hide().prependTo('.records').slideDown(150);
});
