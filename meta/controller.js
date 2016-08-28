'use strict';

const SoundCloudController = require('../soundcloud/controller');
const YouTubeController    = require('../youtube/controller');
const LocalController      = require('../local/controller');
const MetaModel            = require('./model');

module.exports = class MetaController {
  static index() {
    return new Promise((resolve, reject) => {
      View.render('meta/index', {});

      resolve(true);
    });
  }

  static configuration() {
    return new Promise((resolve, reject) => {
      View.render('meta/configuration', {
        soundcloud: {
          connected: SoundCloudService.isConnected()
        },
        youtube: {
          connected: YouTubeService.isConnected()
        }
      });

      resolve(true);
    });
  }

  static downloads() {
    return new Promise((resolve, reject) => {
      View.render('meta/downloads', {
        downloads: Downloads.queue,
        history:   Downloads.history
      });

      resolve(true);
    })
  }

  static search(query, modules) {
    return MetaService.search(query, modules).then(() => {
      MetaController.render(modules.first(), 'search_results');
    });
  }

  /**
   * Delegates to the given module's controller and action.
   *
   * Sometimes though, actions are mapped to a different one
   * since a page can contain two different actions but we want
   * to show the last one the user picked.
   *
   * We also render a special connection view if we try to
   * access a service that is not yet connected.
   *
   * @param  {String}         module - The module's name.
   * @param  {String}         action - The action's name.
   * @param  {Object=|Array=} params - Eventual extra param(s)
   *                                   to pass to the method.
   * @return {null}
   */
  static render(module, action, params) {
    // In case an action is interrupted before
    // the promise resolves.
    Ui.hideLoader();

    var href   = [module, action].join("/");
        action = Router.to(href);

    // Define the current scope.
    Cache.current = {
      module: module,
      action: action
    };

    // Early return if we try to hit a service that is not
    // yet connected.
    if (module == 'soundcloud' && !SoundCloudService.isConnected())
      return View.render('soundcloud/connection');
    else if (module == 'youtube' && !YouTubeService.isConnected())
      return View.render('youtube/connection');

    Ui.showLoader(params);

    if (module == 'meta')
      var controller = MetaController;
    else if (module == 'soundcloud')
      var controller = SoundCloudController;
    else if (module == 'youtube')
      var controller = YouTubeController;
    else if (module == 'local')
      var controller = LocalController;

    // Make sure that we are dealing with an array
    // if only an object has been passed as the set
    // of extra parameters.
    if (!(params instanceof Array))
      params = [params];

    controller[action.camel()].apply(controller, params).then(() => {
      Ui.hideLoader();

      // Scroll to the current playing element
      if (module == Cache.playing.module && action == Cache.playing.action && !params.first())
        Ui.scrollToPlayingElement();
    });
  }

  /**
   * Re-renders the current action.
   *
   * @return {null}
   */
  static refresh() {
    this.render(Cache.current.module, Cache.current.action);
  }
}
