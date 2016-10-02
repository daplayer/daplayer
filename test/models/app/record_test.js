require('../../test_helper');

describe('Record', () => {
  var soundcloud = new Record(null, 'soundcloud');
  var youtube    = new Record(null, 'youtube');
  var local      = new Record(null, 'local');

  describe('#isSoundCloud', () => {
    it('should return true for SoundCloud records, false otherwise', () => {
      assert.equal(soundcloud.isSoundCloud(), true);

      assert.equal(youtube.isSoundCloud(), false);
      assert.equal(local.isSoundCloud(),   false);
    });
  });

  describe('#isYouTube', () => {
    it('should return true for YouTube records, false otherwise', () => {
      assert.equal(youtube.isYouTube(), true);

      assert.equal(soundcloud.isYouTube(), false);
      assert.equal(local.isYouTube(),      false);
    });
  });

  describe('#isLocal', () => {
    it('should return true for local records, false otherwise', () => {
      assert.equal(local.isLocal(), true);

      assert.equal(youtube.isLocal(),    false);
      assert.equal(soundcloud.isLocal(), false);
    });
  });

  describe('#human_time', () => {
    var record          = new Record();
        record.duration = 340;

    it('the `human_time` attribute should be computed on demand', () => {
      assert.equal(false,  record.hasOwnProperty('human_time'))
      assert.equal('5:40', record.human_time);
    });
  });

  describe('#link', () => {
    it('should set the `previous` and `next` attributes of the given record', () => {
      var record = {};

      Record.link(record, 1, [1, null, 2]);

      assert.equal(record.previous, 1);
      assert.equal(record.next, 2);
    });

    it('should not set the `previous` field for the first record', () => {
      var record = {};

      Record.link(record, 0, [record]);

      assert.equal(record.previous, null);
    });

    it('should not set the `next` field for the last record', () => {
      var record = {};

      Record.link(record, 0, [record]);

      assert.equal(record.next, null);
    });
  });
});