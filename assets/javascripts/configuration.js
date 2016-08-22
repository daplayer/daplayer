const dialog = require('electron').remote.dialog;

$(document).ready(function() {
  // --------------------------------------------------------
  // Configuration interface
  //
  // Manage the different actions interacting with the
  // configuration form.

  // Enable/disable download path fields when downloads are
  // place in the same folder as local musics.
  $('.container').on('change', '#lock_download', function() {
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
  $('.configuration').on('click', '.tiny_button', function() {
    var field = $(this).data('field');

    // Early return if the download folders are locked for
    // SoundCloud and YouTube.
    if (field != 'local' && $('#lock_download').is(':checked'))
        return;

    dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] }, function(chosen) {
      var suffix = field == 'local' ? '_path' : '_download';

      if (chosen)
        $('#' + field + suffix).attr('value', chosen[0]).change();
    });

  });

  // Handle save of the configuration.
  $('.configuration').on('submit', 'form', function(e) {
    e.preventDefault();

    var original_locale = Config.meta.locale;

    var locale  = $('input[name="locale"]:checked').val();
    var quality = $('input[name="quality"]:checked').val();

    var local_path          = $('#local_path').val();
    var soundcloud_download = $('#soundcloud_download').val();
    var youtube_download    = $('#youtube_download').val();

    Config.store('meta', 'locale', locale);
    Config.store('soundcloud', 'download', soundcloud_download);
    Config.store('youtube', 'download', youtube_download);
    Config.store('youtube', 'quality', quality);
    Config.store('local', 'path', local_path);

    // Reload the contents if the locale has been changed
    if (locale != original_locale) {
      Translation.load();
      Ui.loadPartials();
      Ui.refresh();
    }
  });
})
