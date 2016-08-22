/**
 * This script is used to read tags of audio files; we are
 * doing this inside another process for the sake of speed
 * to let the user do other actions while the files are read
 * since huge folders may take several seconds to load.
 */

require('../app/core_ext');

global.Record    = require('../app/record');
global.Paths     = require('../app/paths');
global.Formatter = require('../app/formatter');
global.MetaModel = require('../meta/model');

require('./model').readFiles(process.argv[2]).then((files) => {
  process.send(files);
}).catch((e) => {
  console.log(e);
});
