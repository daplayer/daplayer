require('../test_helper');

var Application = require('spectron').Application

describe('application launch', function() {
  beforeEach(function() {
    this.app = new Application({
      path: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
      args: [path.join(__dirname, '..', '..', 'main.js')]
    });

    return this.app.start();
  });

  afterEach(function() {
    if (this.app && this.app.isRunning())
      return this.app.stop();
  });

  it('shows an initial window', function() {
    return this.app.client.getWindowCount().then((count) => {
      assert.equal(count, 1);
    }).then(() => {
      return this.app.browserWindow.isVisible();
    }).then((isVisible) => {
      assert.equal(true, isVisible);
    });
  });
});
