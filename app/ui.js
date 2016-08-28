'use strict';

const clipboard = require('electron').clipboard;
const Player    = require('./player');

module.exports = class Ui {
  /**
   * Displays a loader on the page.
   *
   * @param  {Boolean} next - Whether we are loading the
   *                          next set of data or not.
   * @return {null}
   */
  static showLoader(next) {
    if (!next)
      $('.content').html('');

    $('.loading-shadow').show();
  }

  /**
   * Hides the loader on the page.
   *
   * @return {null}
   */
  static hideLoader() {
    $('.loading-shadow').hide();
  }

  /**
   * Loads the different partials. The skeleton has some
   * placeholders that are waiting some contents to be
   * loaded (e.g. sidebar).
   *
   * @return {null}
   */
  static loadPartials() {
    $('.controls').html(View.compile('meta/partials/video_controls')());
    $('.sidebar').html(View.compile('meta/partials/sidebar')());
    $('.player').html(View.compile('meta/partials/player')());
    $('.search').html(View.compile('meta/partials/search')());
  }

  /**
   * Renders content given an URL.
   *
   * Links aren't h-referencing any HTML page but rather a
   * controller/action set or the name of a function (starting
   * with a sharp).
   *
   * Thus, we just extract the controller and action from
   * the given path and call the associated method through
   * the mapping in case of a controller/action set.
   *
   * In case of a function, we just call it extracting the
   * passed parameters. If only a name is given, then the
   * function is called on this object (i.e. Ui), otherwise
   * if there's a service/method set separated with a colon,
   * then the method is called on the given service.
   *
   * @param  {String}  href  - The controller/action set
   *                           or a function call.
   * @param  {Object=} param - An eventual extra param.
   * @return {null}
   */
  static render(href, param) {
    // Links h-referencing just "#" are skipped
    if (href == "#")
      return;

    // Handle function calls from links
    if (href.startsWith("#")) {
      if (href.includes(':'))
        return MetaService.dispatch(href);
      else
        return Ui[href.split('#').last()].call();
    }

    var module = href.split("/")[0];
    var action = href.split("/")[1];

    MetaController.render(module, action, param);
  }

  /**
   * Refreshes the current action
   *
   * @return {null}
   */
  static refresh() {
    MetaController.refresh();
  }

  /**
   * Function that loads new records once we hit the bottom
   * of the page.
   *
   * @return {null}
   */
  static loadNextRecords() {
    var action = Cache.current.action,
        module = Cache.current.module;

    if (module == 'local')
      return;
    if (['configuration', 'playlist_items'].includes(action))
      return;
    if (!Cache[module][action])
      return;

    Cache[module][action].then((result) => {
      if (result.next_href)
        MetaController.render(module, action, result.next_href);
      else if (result.page_token)
        MetaController.render(module, action, result.page_token);
    });
  }

  /**
   * Puts the media's URL in the clipboard.
   *
   * @param  {$} element - The HTML node that represents
   *                       the media we want to share.
   * @return {null}
   */
  static share(element) {
    clipboard.writeText(element.data('url'));

    new Notification(Translation.t('meta.url_copied'), {
      body: element.data('title'),
      icon: element.data('icon')
    });
  }

  /**
   * Displays a dialog to customize the tags of the file
   * to download for SoundCloud and YouTube or to change
   * them for a local file.
   *
   * @param  {$}  element  - The HTML node that represents
   *                         the media we want to download/tag.
   * @param  {$=} playlist - The playlist the element is in.
   * @return {null}
   */
  static tag(element, playlist) {
    var module  = Cache.current.module;
    var section = Cache.current.action;

    MetaModel.findById(element.data('id'), module, section, playlist).then((record) => {
      var context = record instanceof Record ? record : record.record;

      if (context.service == 'soundcloud')
        $('.dialog').html(View.compile('soundcloud/partials/tag')(context));
      else if (context.service == 'youtube')
        $('.dialog').html(View.compile('youtube/partials/tag')(context));
      else if (context.service == 'local')
        $('.dialog').html(View.compile('local/partials/tag')(context));

      $('.dialog').removeClass('add_to_playlist')
                  .addClass('tag').addClass(context.service);
    });

    this.showDialog();
  }

  /**
   * Displays a notification about download's beginning
   * and show the main download bar.
   *
   * @param  {Object} hash - A hash containing the media's
   *                         attributes.
   * @return {null}
   */
  static downloadStart(hash) {
    new Notification(Translation.t('meta.download_in_progress'), {
      body: hash.title + ' - ' + hash.artist,
      icon: hash.icon
    });

    $('.sidebar .main .download_bar').show();
  }

  /**
   * Displays a notification about the download's end and
   * hides the main download bar if necessary.
   *
   * @param  {Object} hash - A hash containing the media's
   *                         attributes.
   * @return {null}
   */
  static downloadEnd(hash) {
    new Notification(Translation.t('meta.download_finished'), {
      body: hash.title + ' - ' + hash.artist,
      icon: hash.icon
    });

    if (Downloads.progression == Downloads.size)
      $('.sidebar .main .download_bar').fadeOut(200);
  }

  /**
   * Updates the download bars' progression.
   *
   * @param  {String|Number} id         - The media's id.
   * @param  {Number}        percentage - The progression.
   * @return {null}
   */
  static downloadProgress(id, percentage) {
    var total = (Downloads.progression / Downloads.size) * 100;

    $('.sidebar .main .download_bar .progression').css({width: total + '%'});

    if (Cache.current.action = 'downloads')
      $(`div[data-id="${id}"] .progression`).css({width: percentage + '%'});
  }

  /**
   * Shows the video player and the black transparent
   * shadow as well. Hides the dialog box if it is
   * already open.
   *
   * @return {null}
   */
  static showVideoPlayer() {
    if ($('.dialog').is(':visible'))
      $('.dialog').hide();
    else
      $('.shadow.main').show();

    $('.player_frame_container').show();
  }

  /**
   * Shows the dialog box and the black transparent
   * shadow as well. Hides the video player if it is
   * already open.
   *
   * @return {null}
   */
  static showDialog() {
    if ($('.player_frame_container').is(':visible'))
      $('.player_frame_container').hide();
    else
      $('.shadow.main').show();

    $('.dialog').show();
  }

  /**
   * Hide the black transparent shadow and its inner element
   * (i.e. the video player or the dialog box).
   *
   * @return {null}
   */
  static hideShadow() {
    $('.shadow.main').fadeOut(250);

    if ($('.dialog, .player_frame_container').is(':visible'))
      $('.dialog, .player_frame_container').hide();
  }

  /**
   * Displays a popup to add an element to a playlist.
   *
   * @param  {$} element - The HTML node that represents
   *                       the media we want to add to a
   *                       playlist.
   * @return {null}
   */
  static addToPlaylist(element) {
    var module, action = Cache.current.action;

    if (element.hasClass('soundcloud'))
      module = 'soundcloud';
    else if (element.hasClass('youtube'))
      module = 'youtube';
    else if (element.hasClass('local'))
      module = 'local';

    MetaModel.playlists(module).then((playlists) => {
      $('.dialog').html(View.compile('meta/partials/add_to_playlist')({
        module:     module,
        action:     action,
        id:         element.data('id'),
        soundcloud: module == 'soundcloud',
        youtube:    module == 'youtube',
        local:      module == 'local',
        playlists:  playlists,
      }));
    })

    $('.shadow.main').show();
    $('.dialog').show().removeClass('tag').addClass('add_to_playlist');
  }

  static createPlaylist(title, service) {
    MetaModel.createPlaylist(title, service).then(() => {
      new Notification(Translation.t('meta.actions.playlist_created'), {
        body: title
      });
    });
  }

  /**
   * Displays or hides the search bar.
   *
   * @return {null}
   */
  static toggleSearchBar() {
    if ($('.sidebar .search-form').is(':visible')) {
      $('.search-options').slideUp(200, function() {
        $('.sidebar .main .nav_items').animate({ left: 0 });
        $('.sidebar .search-form').animate({ left: '250px' }, 400, function() {
          $('.sidebar .search-form').hide();
        });
      });
    } else {
      $('.sidebar .search-form').show();
      $('.sidebar .main .nav_items').animate({ left: '-250px'});
      $('.sidebar .search-form').animate({ left: 0 }, 400, function() {
        $('.sidebar input').focus();
      });
    }
  }

  /**
   * Tells whether data should be loaded or not on the
   * current page. It checks whether the container is
   * fully filled or not.
   *
   * @return {Bool}
   */
  static dataShouldBeLoaded() {
    return !($('.container').get(0).scrollHeight > $('.container').get(0).clientHeight);
  }

  /**
   * Scrolls to the current playing element or playlist.
   *
   * @return {null}
   */
  static scrollToPlayingElement() {
    if (Player.playlist)
      var id = Player.playlist.id;
    else
      var id = Player.record.id;

    if ($(`[data-id="${id}"]`).length)
      $('.container').animate({
        scrollTop: $(`[data-id="${id}"]`).offset().top - 10
      }, 300);
  }

  /**
   * Animates the height of an element randomly.
   *
   * @param  {$}    element - The element to animate.
   * @return {null}
   */
  static animateHeight(element) {
    var sample = Math.max(Player.sample(), 0.1);

    element.animate({
      height: sample * 100 + "%"
    }, 250, () => {
      this.animateHeight(element);
    });
  }

  /**
   * Displays with an animation a div containing the
   * information on a record that has just been added
   * to the "Listen later" playlist.
   *
   * @param  {Object} record - The record to display.
   * @return {null}
   */
  static addListenLaterRecord(record) {
    var element = $(Handlebars.helpers.listen_later(record).string);
        element.hide();

    $('.search-bar').after(element);

    element.show(500);
  }
}
