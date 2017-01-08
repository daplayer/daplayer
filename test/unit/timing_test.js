'use strict';

require('../test_helper');

describe('Timing', () => {
  describe('#time', () => {
    it('should parse ISO8601 times', () => {
      assert.equal("4:19", Timing.time("4M19S"));
      assert.equal("5:00", Timing.time("5M"));
    });

    it('should parse seconds to human time', () => {
      assert.equal("4:19", Timing.time(259));
    });

    it('should add a trailing zero for seconds', () => {
      assert.equal("1:04", Timing.time(64));
    });
  });

  describe("#duration", () => {
    it('should return a duration in seconds', () => {
      assert.equal(10, Timing.duration("0:10"));
      assert.equal(259, Timing.duration("4:19"));
      assert.equal(3675, Timing.duration("1:01:15"));
    });
  });
});
