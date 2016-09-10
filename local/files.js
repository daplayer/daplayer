/**
 * This script is used to read tags of audio files; we are
 * doing this inside another process for the sake of speed
 * to let the user do other actions while the files are read
 * since huge folders may take several seconds to load.
 */

require('../app/core_ext');

global.Paths        = require('../app/paths');
global.LocalService = require('./service');

require('./models/files').readFiles(process.argv[2]).then((files) => {
  process.send(files);
}).catch((e) => {
  console.log(e);
});
