'use strict';

const clipboard = require('electron').clipboard;
const Player    = require('./player');

/**
 * This class manages some elements of the user interface
 * and contains methods that are related to it.
 *
 * You can also check out these classes for further information:
 *
 *  * Ui.Dialog
 *  * Ui.Menu
 *  * Ui.Player
 *  * Ui.VideoPlayer
 */
module.exports = class Ui {
  static get Player() {
    if (!this._Player)
      this._Player = new Proxy(require('./ui/player'), {
        get: function(player, element) {
          if (player[element])
            return player[element];
          else
            return player.el[element];
        }
      });

    return this._Player;
  }

  static get VideoPlayer() {
    if (!this._VideoPlayer)
      this._VideoPlayer = require('./ui/video_player');

    return this._VideoPlayer;
  }

  static get Dialog() {
    if (!this._Dialog)
      this._Dialog = require('./ui/dialog');

    return this._Dialog;
  }

  static get Menu() {
    if (!this._Menu)
      this._Menu = require('./ui/menu');

    return this._Menu;
  }

  /**
   * Loads the different partials. The skeleton has some
   * placeholders that are waiting some contents to be
   * loaded (e.g. sidebar).
   *
   * @param  {Bool=} text_only - Whether to load partials
   *                             with text or all of them.
   * @return {null}
   */
  static loadPartials(text_only) {
    $('.sidebar').html(View.compile('app/sidebar')());
    $('.titlebar').html(View.compile('app/titlebar')());

    if (!text_only) {
      $('.main.player').html(View.compile('app/player')());
      $('.video.player .controls').html(View.compile('app/video_controls')());
      $('.player .duration').html(View.compile('app/duration')());
    }
  }

  /**
   * Properly set the current item, both for the sidebar and the
   * the titlebar in case it is displayed.
   *
   * @param  {String}  href - The path that's going to be loaded.
   * @param  {jQuery=} parent - An eventual parent DOM element.
   * @return {null}
   */
  static setCurrentAction(href, parent) {
    var [module, action] = href.split('/')
    var sidebar_href     = Router.from(module, action)

    // Properly store the chosen tab in case the user is clicking
    // on a titlebar link for future accesses.
    if (parent && parent.parent().hasClass('titlebar') && href != '#')
      Router.setFavoriteRouteFor(module, action)

    Ui.Menu.define(module, action)

    $('.sidebar a.active').removeClass('active')
    $(`.sidebar a[href="${sidebar_href}"]`).addClass('active')
  }

  /**
   * Puts the media's URL in the clipboard.
   *
   * @param  {Number|String}   id  - The media's id.
   * @param  {Number=|String=} set - The eventual media's set.
   * @return {null}
   */
  static share(id, set) {
    var record = Record.from(id, set);

    clipboard.writeText(record.url);

    Notification.show({
      action: I18n.t('meta.actions.url_copied'),
      title:  record.title,
      icon:   record.icon
    });
  }

  /**
   * Displays a dialog to customize the tags of the file
   * to download for SoundCloud and YouTube or to change
   * them for a local file.
   *
   * @param  {Number|String}   id  - The media's id.
   * @param  {Number=|String=} set - The eventual media's set.
   * @return {null}
   */
  static tag(id, set) {
    var record  = Record.from(id, set);
    var service = record.service;

    this.Dialog.tag(record).then((tags) => {
      if (service == 'local') {
        var matching = $(`[data-id="${id}"]`);

        matching.title(tags.title);
        matching.artist(tags.artist);

        if (tags.icon)
          matching.find('img').attr('src', tags.icon);

        Service.for(service).tag(record, tags);
      } else {
        Service.for(service).download(tags);
      }
    });
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
    Notification.show({
      action: I18n.t('meta.actions.download_started'),
      title:  hash.title + ' - ' + hash.artist,
      icon:   hash.icon
    });

    $('.titlebar .download_bar').show();
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
    Notification.show({
      action: I18n.t('meta.actions.download_finished'),
      title:  hash.title + ' - ' + hash.artist,
      icon:   hash.icon
    }, true);

    if (Downloads.progression == Downloads.size)
      $('.titlebar .download_bar').fadeOut(200);
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

    $('.titlebar .download_bar .progression').css({width: total + '%'});

    if (Cache.current.action == 'downloads')
      $(`div[data-id="${id}"] .progression`).css({width: percentage + '%'});
  }

  /**
   * Hide the black transparent shadow and its inner element
   * (i.e. the video player or the dialog box).
   *
   * @return {null}
   */
  static hideShadow() {
    Application.shadow_blocked = false;

    $('.shadow.main').fadeOut(250);

    if ($('.dialog, .video.player').is(':visible'))
      $('.dialog, .video.player').hide();
  }

  /**
   * Displays a popup to add an element to a playlist.
   *
   * @param  {Number|String} id - The record's id.
   * @return {null}
   */
  static addToPlaylist(id) {
    var record = Record.from(id);

    Playlist.all(record.service).then((playlists) => {
      this.Dialog.addToPlaylist({
        id:         id,
        soundcloud: record.isSoundCloud(),
        youtube:    record.isYouTube(),
        playlists:  playlists,
      });
    })
  }

  /**
   * Tries to guess the number of records that should
   * be loaded on the page.
   *
   * @return {Bool}
   */
  static pageSize(kind) {
    var box_height = kind == 'music' ? 250.0 : 220.0
    var box_width  = kind == 'music' ? 200.0 : 270.0

    var nb_columns = Math.floor($('.container').get(0).clientHeight / box_height)
    var nb_lines   = Math.floor($('.container').get(0).clientWidth / box_width)

    return nb_columns * (nb_lines + 1)
  }
}
