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
  Controller.for('meta').index();

  // --------------------------------------------------------
  // Handle clicks on links
  //
  // See Ui#render for further information.
  $('body').on('click', 'a', function(e) {
    e.preventDefault();

    var href = $(this).attr('href');
    var parent = $(this).parent();

    // Clicking a link on the sidebar should remove the active
    // class of the previous link and add it to the current one.
    if (parent.hasClass('nav') || parent.hasClass('titlebar') || parent.hasClass('right'))
      $('a.active').removeClass('active');

    $(this).addClass('active');

    if (parent.parent().hasClass('titlebar') && href != '#')
      Router.setFavoriteRouteFor(href);

    if ($(this).data('id'))
      Ui.render(href, $(this).data('id'));
    else
      Ui.render(href);
  });

  // --------------------------------------------------------
  // > Handle clicks on notifications
  $('.notifications').on('click', '.notification', function(e) {
    $(this).slideOut();
  });

  // --------------------------------------------------------
  // > Search feature
  $('.titlebar').on('keyup', '.search-form input', function(e) {
    // 13: 'Enter' key

    if (e.keyCode == 13) {
      var module = Cache.current.module;

      if (module == 'meta')
        return;

      Cache.search = { query: $(this).val() };
      Controller.for(module).searchResults();
    }
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
  // > Shadow-related event handlers
  require('./assets/javascripts/bootstrap/shadow');

  // --------------------------------------------------------
  // > Container (option toggler, scrolling, etc.)
  require('./assets/javascripts/bootstrap/container');

  // --------------------------------------------------------
  // > Forms (create playlists, etc.)
  require('./assets/javascripts/bootstrap/forms');

  // --------------------------------------------------------
  // > Focus state of the main window.
  ipcRenderer.on('focus', function(event, emmited) {
    Cache.focus = emmited;
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
    // 115: 's' key
    if (e.target.tagName != 'INPUT' && e.keyCode == 115) {
      e.preventDefault();
      $('.search-form input').focus();
    }
  });
});
