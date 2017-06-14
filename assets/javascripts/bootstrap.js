'use strict';

require('./app/initializer.js');

const ipcRenderer = require('electron').ipcRenderer;

Application.boot(function() {
  // --------------------------------------------------------
  // Display the application's menu
  require('./app/menu.js');

  // --------------------------------------------------------
  // Load the different partials (sidebar, etc.)
  Ui.loadPartials();

  // --------------------------------------------------------
  // Load the index page
  Application.controllers.meta.index();

  // --------------------------------------------------------
  // Handle clicks on links
  //
  // See Ui#render for further information.
  $('body').on('click', 'a', function(e) {
    e.preventDefault();

    var href = $(this).attr('href');
    var parent = $(this).parent();

    Ui.setCurrentAction(href, parent)

    if ($(this).data('id'))
      Ui.render(href, $(this).data('id'));
    else
      Ui.render(href);
  });

  // --------------------------------------------------------
  // > Handle clicks on notifications
  $('.notifications').on('click', '.notification', function(e) {
    $(this).fadeOut(300)
  });

  // --------------------------------------------------------
  // > Search feature
  $('.titlebar').on('keyup', '.search-form input', function(e) {
    // 13: 'Enter' key

    if (e.keyCode == 13) {
      var module = Cache.current.module;

      if (module == 'meta' || $(this).val() == '')
        return;

      var href = `${module}/search_results`

      Cache.search = { query: $(this).val() };
      Ui.setCurrentAction(href)
      Ui.render(href)
    }
  });

  // --------------------------------------------------------
  // > Hide the shadow clicking on it
  $('.shadow.main').on('click', function(e) {
    if (!$(e.target).hasClass('shadow') || Application.shadow_blocked)
      return;

    Ui.hideShadow();
  });

  // --------------------------------------------------------
  // > Handle clicks on musics or videos items
  require('./assets/javascripts/bootstrap/medias');

  // --------------------------------------------------------
  // > Describe the behavior of the player's interface
  require('./assets/javascripts/bootstrap/player');

  // --------------------------------------------------------
  // > Video player (manage full-screen mode, etc.)
  require('./assets/javascripts/bootstrap/video_player');

  // --------------------------------------------------------
  // > Dialogs (for tagging, downloading, etc.)
  require('./assets/javascripts/bootstrap/dialog');

  // --------------------------------------------------------
  // > Forms (create playlists, etc.)
  require('./assets/javascripts/bootstrap/forms');

  // --------------------------------------------------------
  // > Handle the different actions in the application.
  $('.container').on('click', '[data-action]', function() {
    Actions[$(this).data('action')]()
  })

  // --------------------------------------------------------
  // > Container event handlers
  //
  // Handle the loading of new resources: load new resources
  // when we are at the bottom of the page.
  $('.container').scroll(function() {
    if ($(this)[0].scrollHeight - $(this).scrollTop() == $(this).outerHeight())
      Ui.loadNextRecords();
  });

  // --------------------------------------------------------
  // > Focus state of the main window.
  ipcRenderer.on('focus', function(event, emmited) {
    Application.focused = emmited;
  });

  // --------------------------------------------------------
  // > Manage shortcuts
  //
  // >> Global shortcuts
  ipcRenderer.on('controls', function(event, emmited) {
    switch (emmited) {
      case 'play-pause':
        Player.paused ? Player.play() : Player.pause();
        break;
      case  'previous':
        Player.playPrevious();
        break;
      case 'next':
        Player.playNext();
        break;
    }
  });

  // >> In-app shortcuts
  $(document).on('keypress', function(e) {
    if (e.target.tagName == 'INPUT')
      return;

    e.preventDefault();

    // 32: 'space' key
    // 115: 's' key
    if (e.keyCode == 115)
      $('.search-form input').focus();
    else if (e.keyCode == 32)
      Player.paused ? Player.play() : Player.pause();
  });

  $(document).on('keyup', function(e) {
    // 27: 'esc' key
    if (e.keyCode == 27 && !Application.shadow_blocked)
      Ui.hideShadow();
  });
});
