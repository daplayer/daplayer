'use strict';

/**
 * Common interface to manage notifications within the application
 * and outside of the application when needed.
 */
module.exports = class Notification {
  static show(hash, outer) {
    // If the player's window is not focused and the outer
    // parameter is set to true, then we should rather show
    // a native notification to alert the user as they won't
    // see it otherwise.
    if (outer && !Application.focused)
      return new NativeNotification(hash.action, {
        body: hash.title,
        icon: hash.icon
      });

    var id = Timing.currentTimestamp();

    var html = Html.tag('div', { class: 'notification', id: id }, () => {
      var icon = Html.tag('div', 'icon', () => {
        if (hash.icon)
          return Html.tag('img', { src: hash.icon })
        else
          return Html.glyphicon(hash.glyphicon)
      })

      var text = Html.tag('div', 'text', () => {
        return Html.tag('span', 'action', hash.action) +
               Html.tag('span', 'title', hash.title || ' ')
      })

      return icon + text
    })

    $('.notifications').append(html);
    $(`#${id}`).fadeIn(300)

    // Remove the notification after 3 seconds.
    setTimeout(() => $(`#${id}`).fadeOut(300), 5000)
  }
}
