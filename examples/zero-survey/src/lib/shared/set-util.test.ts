import {describe, expect, test} from 'vitest';
import {
  difference,
  equals,
  intersection,
  symmetricDifferences,
  union,
} from './set-utils.js';

describe('Set', () => {
  test('equals', () => {
    const t = <T>(a: Iterable<T>, b: Iterable<T>, expected: boolean) => {
      expect(equals(new Set(a), new Set(b))).toBe(expected);
      expect(equals(new Set(b), new Set(a))).toBe(expected);
    };
    t('', '', true);
    t('', 'a', false);
    t('', 'ab', false);
    t('a', 'a', true);
    t('a', 'b', false);
    t('ab', 'a', false);
    t('ab', 'b', false);
    t('ab', 'ab', true);
    t('ab', 'ba', true);
    t('abc', 'abcd', false);
  });

  test('union', () => {
    const t = <T>(...sets: [Iterable<T>, ...Iterable<T>[]]) => {
      expect(sets.length).toBeGreaterThan(0);
      const expected = new Set(sets.at(-1));
      expect(union(...sets.slice(0, -1).map(s => new Set(s)))).toEqual(
        expected,
      );
    };

    t('');
    t('', '');
    t('', '', '', '');
    t('a', 'a');
    t('ab', 'ab');
    t('a', 'b', 'c', 'abc');
    t('ab', 'bc', 'cd', 'abcd');
  });

  test('intersection', () => {
    const t = <T>(a: Iterable<T>, b: Iterable<T>, expected: Iterable<T>) => {
      expect(intersection(new Set(a), new Set(b))).toEqual(new Set(expected));
    };
    t('', '', '');
    t('a', '', '');
    t('', 'a', '');
    t('a', 'a', 'a');
    t('a', 'b', '');
    t('a', 'ab', 'a');
    t('ab', 'b', 'b');
    t('abc', 'cb', 'bc');
    t('ab', 'bc', 'b');
    t('abc', 'abc', 'cba');
  });

  test('difference', () => {
    const t = <T>(a: Iterable<T>, b: Iterable<T>, expected: Iterable<T>) => {
      expect(difference(new Set(a), new Set(b))).toEqual(new Set(expected));
    };
    t('', '', '');
    t('', 'a', '');
    t('', 'ab', '');
    t('a', '', 'a');
    t('a', 'a', '');
    t('a', 'b', 'a');
    t('ab', '', 'ab');
    t('ab', 'a', 'b');
    t('ab', 'b', 'a');
    t('ab', 'ab', '');
    t('abc', '', 'abc');
    t('abc', 'a', 'bc');
    t('abc', 'b', 'ac');
    t('abc', 'c', 'ab');
    t('abc', 'ab', 'c');
    t('abc', 'bc', 'a');
    t('abc', 'ac', 'b');
    t('abc', 'abc', '');
    t('abc', 'abcd', '');
  });

  test('symmetricDifferences', () => {
    const t = <T>(
      a: Iterable<T>,
      b: Iterable<T>,
      expected: [Iterable<T>, Iterable<T>],
    ) => {
      expect(symmetricDifferences(new Set(a), new Set(b))).toEqual([
        new Set(expected[0]),
        new Set(expected[1]),
      ]);
      expect(symmetricDifferences(new Set(b), new Set(a))).toEqual([
        new Set(expected[1]),
        new Set(expected[0]),
      ]);
    };

    t('', '', ['', '']);
    t('', 'a', ['', 'a']);
    t('abc', '', ['abc', '']);
    t('abc', 'a', ['bc', '']);
    t('abc', 'b', ['ac', '']);
    t('abc', 'c', ['ab', '']);
    t('abc', 'ab', ['c', '']);
    t('abc', 'bc', ['a', '']);
    t('abc', 'ac', ['b', '']);
    t('abc', 'abc', ['', '']);
    t('abc', 'abcd', ['', 'd']);
  });
});

describe('SetLike', () => {
  function asMap<T>(a: Iterable<T>): Map<T, T> {
    return new Map([...a].map(v => [v, v]));
  }

  test('equals', () => {
    const t = <T>(a: Iterable<T>, b: Iterable<T>, expected: boolean) => {
      expect(equals(asMap(a), asMap(b))).toBe(expected);
      expect(equals(asMap(b), asMap(a))).toBe(expected);
    };
    t('', '', true);
    t('', 'a', false);
    t('', 'ab', false);
    t('a', 'a', true);
    t('a', 'b', false);
    t('ab', 'a', false);
    t('ab', 'b', false);
    t('ab', 'ab', true);
    t('ab', 'ba', true);
    t('abc', 'abcd', false);
  });

  test('union', () => {
    const t = <T>(...sets: [Iterable<T>, ...Iterable<T>[]]) => {
      expect(sets.length).toBeGreaterThan(0);
      const expected = new Set(sets.at(-1));
      expect(union(...sets.slice(0, -1).map(s => asMap(s)))).toEqual(expected);
    };

    t('');
    t('', '');
    t('', '', '', '');
    t('a', 'a');
    t('ab', 'ab');
    t('a', 'b', 'c', 'abc');
    t('ab', 'bc', 'cd', 'abcd');
  });

  test('intersection', () => {
    const t = <T>(a: Iterable<T>, b: Iterable<T>, expected: Iterable<T>) => {
      expect(intersection(asMap(a), asMap(b))).toEqual(new Set(expected));
    };
    t('', '', '');
    t('a', '', '');
    t('', 'a', '');
    t('a', 'a', 'a');
    t('a', 'b', '');
    t('a', 'ab', 'a');
    t('ab', 'b', 'b');
    t('abc', 'cb', 'bc');
    t('ab', 'bc', 'b');
    t('abc', 'abc', 'cba');
  });

  test('difference', () => {
    const t = <T>(a: Iterable<T>, b: Iterable<T>, expected: Iterable<T>) => {
      expect(difference(asMap(a), asMap(b))).toEqual(new Set(expected));
    };
    t('', '', '');
    t('', 'a', '');
    t('', 'ab', '');
    t('a', '', 'a');
    t('a', 'a', '');
    t('a', 'b', 'a');
    t('ab', '', 'ab');
    t('ab', 'a', 'b');
    t('ab', 'b', 'a');
    t('ab', 'ab', '');
    t('abc', '', 'abc');
    t('abc', 'a', 'bc');
    t('abc', 'b', 'ac');
    t('abc', 'c', 'ab');
    t('abc', 'ab', 'c');
    t('abc', 'bc', 'a');
    t('abc', 'ac', 'b');
    t('abc', 'abc', '');
    t('abc', 'abcd', '');
  });

  test('symmetricDifferences', () => {
    const t = <T>(
      a: Iterable<T>,
      b: Iterable<T>,
      expected: [Iterable<T>, Iterable<T>],
    ) => {
      expect(symmetricDifferences(asMap(a), asMap(b))).toEqual([
        new Set(expected[0]),
        new Set(expected[1]),
      ]);
      expect(symmetricDifferences(asMap(b), asMap(a))).toEqual([
        new Set(expected[1]),
        new Set(expected[0]),
      ]);
    };

    t('', '', ['', '']);
    t('', 'a', ['', 'a']);
    t('abc', '', ['abc', '']);
    t('abc', 'a', ['bc', '']);
    t('abc', 'b', ['ac', '']);
    t('abc', 'c', ['ab', '']);
    t('abc', 'ab', ['c', '']);
    t('abc', 'bc', ['a', '']);
    t('abc', 'ac', ['b', '']);
    t('abc', 'abc', ['', '']);
    t('abc', 'abcd', ['', 'd']);
  });
});
