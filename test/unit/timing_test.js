'use strict';

require('../test_helper');

describe('Timing', () => {
  describe('#time', () => {
    it('should parse seconds to human time', () => {
      assert.equal("4:19", Timing.time(259));
    });

    it('should add a trailing zero for seconds', () => {
      assert.equal("1:04", Timing.time(64));
    });
  });

  describe('#fromISO8601', () => {
    it('should parse ISO8601 times', () => {
      assert.equal(Timing.fromISO8601("4M19S"), 259);
    });

    it('should add a "seconds" component if absent', () => {
      assert.equal(Timing.fromISO8601("5M"), 300);
    });
  });
});
