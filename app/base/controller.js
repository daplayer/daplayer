'use strict';

/**
 * Abstract representation of a controller. It brings the
 * basic rendering logic.
 *
 * @abstract
 */
module.exports = class BaseController {
  /**
   * Delegates to the given module's controller and action.
   *
   * @param  {String}  view    - The view's path.
   * @param  {Object}  context - The view's context.
   * @param  {Object=} id      - An eventual attached id.
   * @return {Promise}
   */
  static render(view, context, id) {
    var [module, action] = view.split('/');

    if (context instanceof Artist   || context instanceof Array ||
        context instanceof Playlist || context.collection)
      var cached_context = context;
    else
      var cached_context = new Context(Cache[module][action]);

    // Define the current scope.
    Cache.current = {
      context: cached_context,
      module:  module,
      action:  action,
      id:      id
    };

    Ui.Menu.define(module, action);

    return new Promise((resolve, reject) => {
      var token = context.token;
      var meth  = token ? 'append' : 'render';

      View[meth](view, context);

      resolve(context);
    });
  }
}
