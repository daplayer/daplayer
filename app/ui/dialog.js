'use strict';

module.exports = class UiDialog {
  static get form() {
    return $('.dialog form');
  }

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
    return new Promise((resolve, reject) => {
      var service = record.service;

      if (service != 'local' && !Paths.exists(Config[service].download))
        this.invalidPath(record, resolve);
      else
        this.chooseTags(record, resolve);
    });
  }

  static chooseTags(record, resolve) {
    this.show(record.service, 'tag', record);
    this.box.addClass('tag');

    this.form.on('submit', (e) => {
      e.preventDefault();

      Ui.hideShadow();

      resolve(this.form.extractFields());
    });
  }

  static invalidPath(record, resolve) {
    this.show(record.service, 'invalid_path');

    this.form.on('submit', (e) => {
      e.preventDefault();

      var location = this.form.find('input[type="text"]').val();

      if (!Paths.exists(location))
        return Notification.show({
          action:    Translation.t('meta.error'),
          title:     Translation.t('meta.errors.invalid_path'),
          glyphicon: 'alert'
        });

      Config.store(record.service, 'download', location);

      this.chooseTags(record, resolve);
    })
  }

  static addToPlaylist(context) {
    this.show('meta', 'add_to_playlist', context);
    this.box.addClass('add_to_playlist');
  }
}
