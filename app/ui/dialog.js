'use strict';

module.exports = class UiDialog {
  static get box() {
    if (!this._box)
      this._box = $('.dialog');

    return this._box;
  }

  static show(service, partial, context) {
    var location = [service, 'partials', partial].join('/');

    this.box.removeClass('tag add_to_playlist');
    this.box.removeClass('soundcloud youtube local');

    this.box.addClass(service);

    this.box.html(View.partial(location, context).string);

    if ($('.video.player').is(':visible'))
      $('.video.player').hide();
    else
      $('.shadow.main').show();

    this.box.show();
  }

  static tag(record) {
    this.show(record.service, 'tag', record);
    this.box.addClass('tag');
  }

  static addToPlaylist(context) {
    this.show('meta', 'add_to_playlist', context);
    this.box.addClass('add_to_playlist');
  }
}
