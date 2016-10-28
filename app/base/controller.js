'use strict';

module.exports = class BaseController {
  /**
   * Delegates to the given module's controller and action.
   *
   * @param  {String}  view    - The view's path.
   * @param  {Object}  context - The view's context.
   * @return {Promise}
   */
  static render(view, context) {
    var [module, action] = view.split('/');

    // Define the current scope.
    Cache.current = {
      module: module,
      action: action
    };

    return new Promise((resolve, reject) => {
      var token = context.token;
      var meth  = token ? 'append' : 'render';

      resolve(View[meth](view, context));
    });
  }
}
