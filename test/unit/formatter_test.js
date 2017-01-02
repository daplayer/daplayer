'use strict';

require('../test_helper');

describe('Formatter', () => {
  describe('#time', () => {
    it('should parse ISO8601 times', () => {
      assert.equal("4:19", Formatter.time("4M19S"));
      assert.equal("5:00", Formatter.time("5M"));
    });

    it('should parse seconds to human time', () => {
      assert.equal("4:19", Formatter.time(259));
    });

    it('should add a trailing zero for seconds', () => {
      assert.equal("1:04", Formatter.time(64));
    });
  });

  describe("#duration", () => {
    it('should return a duration in seconds', () => {
      assert.equal(10, Formatter.duration("0:10"));
      assert.equal(259, Formatter.duration("4:19"));
      assert.equal(3675, Formatter.duration("1:01:15"));
    });
  });

  describe('#artist', () => {
    it('should pick artist from title instead of any record account', () => {
      assert.equal("Darius", Formatter.artist("Darius - Helios", "RocheMusique"));
      assert.equal("Pomo", Formatter.artist("Pomo - Blue Soda", "THUMP"));
      assert.equal("Darius", Formatter.artist("Darius - Pyor", "Red Bull Studios Paris"));
    });

    it('should remove "(Official)" from the name', () => {
      assert.equal("Cherokee", Formatter.artist("Take Care of You", "Cherokee (Official)"));
    });

    it('should pick the artist who did the remix if it is one', () => {
      assert.equal(Formatter.artist('Alina Baraz & Galimatias - Fantasy (Pomo Remix)'), 'Pomo');
      assert.equal(Formatter.artist('Darius - Helios (Feat. Wayne Snow) (Myd Remix)'), 'Myd');
    });
  });

  describe('#path', () => {
    before(() => {
      Config.store('soundcloud', 'download', '/home/jacky');
    });

    after(() => {
      Config.store('soundcloud', 'download', '');
    });

    it('should include the artist and the title in the file name', () => {
      assert(Formatter.path('Maliblue', 'Darius', 'soundcloud').endsWith("/Darius - Maliblue.mp3"));
    });

    it('should include the artist name only once', () => {
      assert(Formatter.path('Darius - Maliblue', 'Darius', 'soundcloud').endsWith("/Darius - Maliblue.mp3"));
    });

    it('should include the user\'s download folder', () => {
      assert(Formatter.path('Foo', 'Bar', 'soundcloud').startsWith(Config.soundcloud.download));
    });
  });
});
