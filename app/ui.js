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
   * Renders content or calls a method given an URI.
   * There are two possible URI schemes:
   *
   * - "controller/action": Controller rendering.
   * - "#service/method": Call to a specific service.
   *
   * ### Controller rendering
   *
   * If a link is referencing a controller/action set, then
   * this function will extract the controller name from the
   * h-ref and call the appropriate method on the controller
   * class.
   *
   * Before rendering any action, the function first checks
   * whether the controller is associated to any specific
   * service and whether the latter is connected or not.
   *
   * It also don't barely call the specified action; the h-ref
   * is first given to `Router.to` to match user's preferences.
   *
   * ### Call to a specific service
   *
   * If the h-ref starts with a sharp (#) then it is considered
   * as a call to a specific service class so just like for
   * controller rendering, the service name and method are
   * extracted from the h-ref and properly delegated.
   *
   * @param  {String}  href  - The controller/action set
   *                           or the service/method one.
   * @param  {Object=} param - An eventual extra param.
   * @return {Promise}
   */
  static render(href, param) {
    // Links h-referencing just "#" are skipped
    if (href == "#")
      return;

    var [module, action] = href.split('/');

    // Handle function calls to services from links
    if (href.startsWith('#'))
      return Service.for(module.slice(1))[action]();

    var controller = Controller.for(module);

    // Early return if we try to access a service that
    // the user isn't yet connected to.
    if (controller.service && !controller.service.isConnected())
      return controller.connection();

    // Clear out the content if we are trying to render
    // a new page.
    if (!param)
      $('.content').html('');

    // From now, we know that the user tries to load a
    // controller action.
    this.loading();

    return controller[Router.to(href).camel()](param).then((context) => {
      // Hide the loader once the action is rendered.
      this.loaded();

      if (!context.token) {
        // Reset the current scroll
        $('.container').scrollTop(0);

        // Scroll to the current playing element
        if (module == Cache.playing.module && action == Cache.playing.action)
          Ui.scrollToPlayingElement();
      }
    });
  }

  /**
   * Shows the loader.
   *
   * @param  {String=} key     - An optional translation key.
   * @param  {Object=} context - An eventual context to evaluate
   *                             the translation.
   * @return {null}
   */
  static loading(key, context) {
    $('.loading-shadow').show();

    if (key)
      $('.loader-text').html(I18n.t(key, context));
  }

  /**
   * Hide the loader.
   *
   * @return {null}
   */
  static loaded() {
    $('.loading-shadow').hide();
    $('.loader-text').html('');
  }

  /**
   * Function that loads new records once we hit the bottom
   * of the page.
   *
   * @return {null}
   */
  static loadNextRecords() {
    var {module,action} = Cache.current;

    if (module == 'local' || module == 'meta' ||
        action == 'playlist_items' || !Cache[module][action])
      return;

    var cached = Cache[module][action];

    if (cached.next_token)
      Ui.render([module, action].join('/'), cached.next_token);
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

  /**
   * Scrolls to the current playing element or playlist.
   *
   * @return {null}
   */
  static scrollToPlayingElement() {
    if (Player.record.set)
      var id = Player.record.set.id;
    else
      var id = Player.record.id;

    if ($(`[data-id="${id}"]`).length)
      $('.container').animate({
        scrollTop: $(`[data-id="${id}"]`).offset().top - 50
      }, 300);
  }
}
