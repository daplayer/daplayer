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
   * @param  {String=} token   - An eventual token.
   * @param  {Object=} id      - An eventual attached id.
   * @return {Promise}
   */
  static render(view, context, token, id) {
    var [module, action] = view.split('/');

    if (context instanceof Artist || context instanceof Array ||
        context instanceof Playlist)
      var cached_context = context;
    else if (Cache[module][action])
      var cached_context = new Context(Cache[module][action].collection)

    // Define the current scope.
    Cache.current = {
      context: cached_context,
      module:  module,
      action:  action,
      id:      id
    };

    return new Promise((resolve, reject) => {
      View[token ? 'append' : 'render'](view, context)

      resolve(token)
    });
  }
}
