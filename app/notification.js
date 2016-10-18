'use strict';

module.exports = class Notification {
  static show(hash) {
    var html = Html.tag('div', 'notification', () => {
      return Html.tag('div', 'box', () => {
        var icon = Html.tag('div', 'icon', () => {
          return Html.tag('img', { src: hash.icon });
        });

        var text = Html.tag('div', 'text', () => {
          return Html.tag('span', 'action', hash.action) +
                 Html.tag('span', 'title', hash.title);
        });

        return icon + text;
      });
    });

    $('.notifications').append(html);
    $('.notifications .box').last().animate({
      right:   0,
      opacity: 1
    }, 500);
  }
}
