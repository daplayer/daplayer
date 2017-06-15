'use strict';

module.exports = class Page {
  /**
   * Renders content or calls a method given an URI.
   *
   * A link is referencing a controller/action set so
   * this function will extract the controller name from
   * the h-ref and call the appropriate method on the
   * controller (i.e. the action).
   *
   * Before rendering any action, the function first checks
   * whether the controller is associated to any specific
   * service and whether the user is signed in for it or not.
   *
   * It also doesn't barely call the specified action; the h-ref
   * is first given to `Router.to` to match user's preferences.
   *
   * @param  {String}  href  - The controller/action set.
   * @param  {Object=} param - An eventual extra param.
   * @return {Promise}
   */
  static render(href, param) {
    var [module, _] = href.split('/');

    var controller = Application.controllers[module]
    var action     = Router.to(href).camel()

    // Early return if we try to access a service that
    // the user isn't yet connected to.
    if (controller.authenticable && !Service.for(module).isConnected()) {
      return controller.signIn()
    }

    // Clear out the content if we are trying to render
    // a new page.
    if (!param) {
      this.clear()
    }

    // From now, we know that the user tries to load a
    // controller action.
    this.loading()

    return controller[action](param).then((token) => {
      // Hide the loader once the action is rendered.
      this.loaded();

      if (token) {
        return
      }

      // Reset the current scroll
      $('.container').scrollTop(0)

      // Scroll to the current playing element
      if (module == Cache.playing.module && action == Cache.playing.action) {
        this.scrollToPlayingElement()
      }
    })
  }

  /**
   * Clears the content of the page.
   */
  static clear() {
    $('.content').html('')
  }

  /**
   * Shows the loader.
   *
   * @param  {String=} key     - An optional translation key.
   * @param  {Object=} context - An eventual context to evaluate
   */
  static loading(key, context) {
    $('.loading-shadow').show()

    if (key)
      $('.loader-text').html(I18n.t(key, context))
  }

  /**
   * Hides the loader.
   */
  static loaded() {
    $('.loading-shadow').hide()
    $('.loader-text').html('')
  }

  /**
   * Refreshes the current page.
   */
  static refresh() {
    var {module, action} = Cache.current
    this.render([module, action].join('/'))
  }

  /**
   * Scrolls to the current playing element or playlist.
   */
  static scrollToPlayingElement() {
    if (Player.record.set)
      var id = Player.record.set.id
    else
      var id = Player.record.id

    if ($(`[data-id="${id}"]`).length) {
      $('.container').animate({
        scrollTop: $(`[data-id="${id}"]`).offset().top - 50
      }, 300)
    }
  }

  /**
   * Function that loads new records once we hit the bottom
   * of the page.
   */
  static loadNextRecords() {
    var {module, action} = Cache.current

    if (module == 'local' || module == 'meta' ||
        action == 'playlist_items' || !Cache[module][action])
      return;

    var cached = Cache[module][action]

    if (cached.next_token) {
      this.render([module, action].join('/'), cached.next_token)
    }
  }
}
