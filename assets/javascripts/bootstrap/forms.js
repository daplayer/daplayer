// --------------------------------------------------------
// Configuration interface
//
// Handle save of the configuration.
$('.content').on('submit', 'form.configuration', function(e) {
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

  $('.container').animate({
    scrollTop: 0
  }, 200);

  // Reload the contents if the locale has been changed
  if (locale != original_locale) {
    I18n.load(locale);

    // Refresh the partials and the current page.
    Ui.loadPartials(true);
    Ui.render('meta/configuration');
  }

  Notification.show({
    action:    I18n.t('meta.actions.configuration_saved'),
    glyphicon: 'cog'
  });
});

// --------------------------------------------------------
// Display a file selector clicking on file picker buttons.
$('body').on('click', 'a[data-picker]', function(e) {
  var button = $(this);
  var field  = button.data('field');
  var picker = button.data('picker');

  FilePicker.open(picker, function(chosen) {
    $(`input[name="${field}"]`).attr('value', chosen);

    if (picker == 'picture')
      button.parent().find('img').attr('src', chosen);
  });
});
