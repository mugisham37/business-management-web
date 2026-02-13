import { test } from '@fast-check/jest';
import * as fc from 'fast-check';

describe('Fast-Check Setup Verification', () => {
  test.prop([fc.integer(), fc.integer()])(
    'addition is commutative',
    (a, b) => {
      expect(a + b).toBe(b + a);
    },
  );

  test.prop([fc.string()])(
    'string length is non-negative',
    (str) => {
      expect(str.length).toBeGreaterThanOrEqual(0);
    },
  );

  test.prop([fc.array(fc.integer())])(
    'reversing an array twice returns original',
    (arr) => {
      const reversed = arr.slice().reverse().reverse();
      expect(reversed).toEqual(arr);
    },
  );
});
