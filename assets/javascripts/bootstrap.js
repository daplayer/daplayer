'use strict';

require('./app/initializer.js');

const ipcRenderer = require('electron').ipcRenderer;
const Player      = require('./app/player');
const Queue       = require('./app/queue');

$(document).ready(function() {
  // Initialize the cache and its properties
  Cache.initialize();
  Player.initialize();

  // Connect to the different services
  YouTubeService.connect();

  // --------------------------------------------------------
  // Load the different partials (sidebar, etc.)
  Ui.loadPartials();

  // --------------------------------------------------------
  // Load the index page
  MetaController.index();

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
    if (parent.hasClass('nav') || parent.hasClass('icon')) {
      if (!$(this).hasClass('search_icon'))
        $('.sidebar a.active').removeClass('active');

      if (!parent.hasClass('icon'))
        $(this).addClass('active');
    }

    if ($(this).parent().hasClass('navbar') && href != '#')
      Router.setFavoriteRouteFor(href);

    if ($(this).data('id'))
      Ui.render(href, $(this).data('id'));
    else
      Ui.render(href);
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
  // > Sidebar interface (toggling menu, search bar, etc.)
  require('./assets/javascripts/bootstrap/sidebar');

  // --------------------------------------------------------
  // > Container (option toggler, scrolling, etc.)
  require('./assets/javascripts/bootstrap/container');

  // --------------------------------------------------------
  // > Forms (create playlists, etc.)
  require('./assets/javascripts/bootstrap/forms');

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
    if (e.target.tagName != 'INPUT' && e.keyCode == 115)
      Ui.toggleSearchBar();
  });
});
