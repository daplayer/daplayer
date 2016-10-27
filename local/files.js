/**
 * This script is used to read tags of audio files; we are
 * doing this inside another process for the sake of speed
 * to let the user do other actions while the files are read
 * since huge folders may take several seconds to load.
 */

require('../app/services/tagging').extract(process.argv[2], (current, total) => {
  process.send([current, total]);
}).then((files) => {
  process.send(files);
}).catch((e) => {
  console.log(e);
});
