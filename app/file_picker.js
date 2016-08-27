'use strict';

const dialog = require('electron').remote.dialog;

module.exports = class FilePicker {
  /**
   * Opens up a dialog to pick a file or a directory.
   *
   * If the `kind` argument is 'directory', then the user
   * can only pick a directory. If the `kind` argument is
   * 'picture', then the user can only pick a single file
   * which has either the `.jpeg`, `.jpg` or `.png` extension.
   *
   * @param {String}   kind     - The kind of dialog to open.
   * @param {Function} callback - The callback to call once the
   *                              file/folder has been chosen.
   * @return {null}
   */
  static open(kind, callback) {
    if (kind == 'directory')
      var properties = {
        properties: ['openDirectory', 'createDirectory']
      };
    else if (kind == 'picture')
      var properties = {
        properties: ['openFile'],
        filters: [
          {name: 'Images', extensions: ['jpeg', 'jpg', 'png']}
        ]
      };

    dialog.showOpenDialog(properties, (chosen) => {
      if (chosen)
        callback(chosen[0]);
    });
  }
}
