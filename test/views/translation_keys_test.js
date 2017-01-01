require('../test_helper');

const glob = require('glob');

describe('Translation keys in views', () => {
  beforeEach(() => {
    I18n.load('en');
  });

  it('should not have any missing translation key', () => {
    var files = new Promise((resolve, reject) => {
      var base    = Paths.resolve(Paths.join(__dirname, '../..'));
      var pattern = Paths.join(base, '{soundcloud,youtube,local,meta,app}/views/**/*.hbs');

      glob(pattern, (err, files) => {
        if (err)
          reject(err);

        resolve(files.map((file) => {
          return {
            name: file,
            content: fs.readFileSync(file, 'utf-8')
          };
        }));
      });
    });

    return files.then((files) => {
      // Extract every translation keys from the files
      // and store them under the `keys` key.
      files.forEach((file) => {
        var match = file.content.match(/{{\s?t '(\w|\.)+'/g);

        if (!match)
          return;

        file.keys = match.map(e => e.slice(5, -1));
      });

      // Store inside an array whether every single key
      // exists.
      files.forEach((file) => {
        if (!file.keys)
          return;

        file.results = file.keys.map((key) => {
          try {
            if (!I18n.t(key))
              return false;
            else
              return true;
          } catch (e) {
            return false;
          }
        });
      });

      // Finally, check whether every single file is valid.
      return assert(files.every((file, i) => {
        if (!file.results)
          return true;

        return file.results.every((r, i) => {
          if (r != true)
            throw new assert.AssertionError({
              message: `Missing translation key "${file.keys[i]}" in ${file.name}.`
            });
          else
            return true;
        });
      }));
    });
  });
});
