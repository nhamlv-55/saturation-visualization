// @ts-nocheck
class SatVisAssertionError extends Error {
    constructor(message) {
      super(message);
      this.name = "SatVisAssertionError";
    }
  }

export function assert(condition, message="") {
    if (!condition)
        throw new SatVisAssertionError('Assertion failed: ' + (message || ''));
};

export function cleanLevel(lvl: number): string{
    if(lvl === Number.MAX_SAFE_INTEGER){
        return "oo";
    }
    return lvl.toString();
}
