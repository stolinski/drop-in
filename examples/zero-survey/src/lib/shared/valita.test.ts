import {expect, test} from 'vitest';
import {assert} from './asserts.js';
import * as v from './valita.js';
import {parse} from './valita.js';

const t = <T>(s: v.Type<T>, val: unknown, message?: string) => {
  const r1 = v.test(val, s);
  const r2 = v.testOptional(val, s);
  let ex;
  try {
    const parsed = parse(val, s);
    expect(parsed).toBe(val);

    expect(r1.ok).toBe(true);
    expect(r1.ok && r1.value).toBe(val);

    expect(r2.ok).toBe(true);
    expect(r2.ok && r2.value).toBe(val);
  } catch (err) {
    ex = err;
  }

  if (message !== undefined) {
    assert(ex instanceof TypeError);
    expect(ex.message).toBe(message);

    expect(r1.ok).toBe(false);
    expect(!r1.ok && r1.error).toBe(message);

    expect(r2.ok).toBe(false);
    expect(!r2.ok && r2.error).toBe(message);
  } else {
    expect(ex).toBe(undefined);
  }
};

test('basic', () => {
  {
    const s = v.string();
    t(s, 'ok');
    t(s, 42, 'Expected string. Got 42');
    t(s, true, 'Expected string. Got true');
    t(s, false, 'Expected string. Got false');
    t(s, null, 'Expected string. Got null');
    t(s, undefined, 'Expected string. Got undefined');
    t(s, {}, 'Expected string. Got object');
  }

  {
    const s = v.boolean();
    t(s, true);
    t(s, false);
    t(s, 'hi', 'Expected boolean. Got "hi"');
    t(s, 42, 'Expected boolean. Got 42');
    t(s, null, 'Expected boolean. Got null');
    t(s, undefined, 'Expected boolean. Got undefined');
    t(s, {}, 'Expected boolean. Got object');
  }

  {
    const s = v.number();
    t(s, 42);
    t(s, 'hi', 'Expected number. Got "hi"');
    t(s, true, 'Expected number. Got true');
    t(s, false, 'Expected number. Got false');
    t(s, null, 'Expected number. Got null');
    t(s, undefined, 'Expected number. Got undefined');
    t(s, {}, 'Expected number. Got object');
  }

  t(v.array(v.number()), [1, 2, 3]);
  t(v.array(v.number()), []);

  for (const s of [v.array(v.number()), v.tuple([v.number()])]) {
    t(s, 42, 'Expected array. Got 42');
    t(s, 'hi', 'Expected array. Got "hi"');
    t(s, true, 'Expected array. Got true');
    t(s, false, 'Expected array. Got false');
    t(s, null, 'Expected array. Got null');
    t(s, undefined, 'Expected array. Got undefined');
    t(s, {}, 'Expected array. Got object');
  }

  t(v.tuple([]), []);
  t(v.tuple([]), [42], 'Expected array with length 0. Got array with length 1');
  t(
    v.tuple([v.number()]),
    [],
    'Expected array with length 1. Got array with length 0',
  );

  {
    const s = v.record(v.number());
    t(s, {});
    t(s, {x: 42});
    t(s, 42, 'Expected object. Got 42');
    t(s, 'hi', 'Expected object. Got "hi"');
    t(s, true, 'Expected object. Got true');
    t(s, false, 'Expected object. Got false');
    t(s, null, 'Expected object. Got null');
    t(s, undefined, 'Expected object. Got undefined');
  }

  {
    const s = v.object({x: v.number()});
    t(s, {x: 42});
    t(s, 42, 'Expected object. Got 42');
    t(s, 'hi', 'Expected object. Got "hi"');
    t(s, true, 'Expected object. Got true');
    t(s, false, 'Expected object. Got false');
    t(s, null, 'Expected object. Got null');
    t(s, undefined, 'Expected object. Got undefined');
  }

  t(v.array(v.number()), ['hi'], 'Expected number at 0. Got "hi"');
  t(v.array(v.number()), [1, 2, 'hi'], 'Expected number at 2. Got "hi"');

  t(v.tuple([v.number()]), ['hi'], 'Expected number at 0. Got "hi"');

  t(v.record(v.number()), {x: 'hi'}, 'Expected number at x. Got "hi"');
  t(v.object({x: v.number()}), {x: 'hi'}, 'Expected number at x. Got "hi"');

  {
    const s = v.object({
      x: v.object({
        y: v.object({
          z: v.number(),
        }),
      }),
    });

    t(s, {x: {y: {z: 1}}});

    // Missing
    t(s, {}, 'Missing property x');
    t(s, {x: {}}, 'Missing property y at x');
    t(s, {x: {y: {}}}, 'Missing property z at x.y');

    // Wrong type
    t(s, {x: undefined}, 'Expected object at x. Got undefined');
    t(s, {x: {y: null}}, 'Expected object at x.y. Got null');
    t(s, {x: {y: {z: 'hi'}}}, 'Expected number at x.y.z. Got "hi"');

    // Extra properties
    t(s, {x: {y: {z: 1, a: 2}}}, 'Unexpected property a at x.y');
    t(s, {x: {y: {z: 1, a: 2, b: 3}}}, 'Unexpected properties a and b at x.y');
  }

  {
    const s = v.object({
      x: v.object({
        y: v.number(),
        z: v.number(),
      }),
    });
    t(s, {x: {y: 1, z: 2}});
    t(s, {x: {y: 1}}, 'Missing property z at x');
    t(s, {x: {}}, 'Missing property y at x');
  }

  {
    const s = v.union(v.number());
    t(s, 42);
    t(s, true, 'Expected number. Got true');
  }

  {
    const s = v.union(v.number(), v.string());
    t(s, 42);
    t(s, 'hi');
    t(s, true, 'Expected number or string. Got true');
  }

  {
    const s = v.union(v.number(), v.string(), v.boolean());
    t(s, 42);
    t(s, 'hi');
    t(s, true);
    t(s, null, 'Expected number, string or boolean. Got null');
  }

  {
    const s = v.union(v.number(), v.literal('x'), v.boolean());
    t(s, 42);
    t(s, 'x');
    t(s, true);
    t(s, null, 'Expected number, string or boolean. Got null');
  }

  {
    const s = v.union(v.literal(1), v.literal('yes'), v.literal(true));
    t(s, 1);
    t(s, 'yes');
    t(s, true);
    t(s, 0, 'Expected literal value 1, "yes" or true Got 0');
    t(s, null, 'Expected literal value 1, "yes" or true Got null');
  }
  {
    const s = v.union(v.literal(1), v.literal('yes'), v.boolean());
    t(s, 1);
    t(s, 'yes');
    t(s, true);
    t(s, 0, 'Expected number, string or boolean. Got 0');
    t(s, null, 'Expected number, string or boolean. Got null');
  }

  {
    const s = v.object({
      x: v.number().optional(),
    });

    t(s, {});
    t(s, {x: undefined});
    t(s, {x: 42});
    t(s, {x: null}, 'Expected number at x. Got null');
    t(s, {x: 'hi'}, 'Expected number at x. Got "hi"');
  }

  {
    const s = v.union(
      v.tuple([v.literal(1), v.number()]),
      v.tuple([v.literal('b'), v.string()]),
      v.tuple([v.literal(true), v.boolean()]),
    );
    t(s, [1, 1]);
    t(s, ['b', 'b']);
    t(s, [true, true]);
    t(s, ['d', true], 'Invalid union value: ["d",true]');
    t(s, [1, '1'], 'Invalid union value: [1,"1"]');
    t(s, {}, 'Expected array. Got object');
    t(s, 'a', 'Expected array. Got "a"');

    const s2 = v.object({
      x: s,
    });
    t(s2, {x: []}, 'Invalid union value at x');
  }
});

test('union error message', () => {
  const type = v.union(
    v.tuple([v.literal('a'), v.object({a: v.string()})]),
    v.tuple([v.literal('b'), v.object({b: v.number()})]),
    v.tuple([v.literal('c'), v.object({c: v.boolean()})]),
  );
  // Test once with the union itself, then with union(union) and union(union(union))
  // to verify recursion.
  for (const s of [type, v.union(type), v.union(v.union(type))]) {
    t(s, ['a', {a: 'payload'}]);
    t(s, ['b', {b: 123}]);
    t(s, ['c', {c: true}]);
    t(s, ['a', {b: 'not the right field'}], 'Missing property a at 1');
    t(
      s,
      ['b', {b: 'not a number'}],
      'Expected number at 1.b. Got "not a number"',
    );
    t(s, ['c', {c: 1}], 'Expected boolean at 1.c. Got 1');
  }
});

test('testOptional', () => {
  const s = v.number().optional();

  expect(v.testOptional(123, s)).toEqual({ok: true, value: 123});
  expect(v.testOptional(undefined, s)).toEqual({ok: true, value: undefined});

  expect(v.testOptional('123', s)).toEqual({
    error: 'Expected number. Got "123"',
    ok: false,
  });
  expect(v.testOptional(null, s)).toEqual({
    error: 'Expected number. Got null',
    ok: false,
  });
});

test('array instead of object error message', () => {
  const s = v.object({
    x: v.number(),
  });

  expect(v.test({x: 1}, s)).toEqual({ok: true, value: {x: 1}});
  expect(v.testOptional({x: 1}, s)).toEqual({ok: true, value: {x: 1}});

  expect(v.test([], s)).toEqual({
    error: 'Expected object. Got array',
    ok: false,
  });
  expect(v.testOptional([], s)).toEqual({
    error: 'Expected object. Got array',
    ok: false,
  });
});

test('instanceOfAbstractType', () => {
  const num = v.number();
  const optional = num.optional();

  expect(v.instanceOfAbstractType(num)).toBe(true);
  expect(v.instanceOfAbstractType(optional)).toBe(true);

  expect(v.instanceOfAbstractType({})).toBe(false);
  expect(v.instanceOfAbstractType('foo')).toBe(false);
  expect(v.instanceOfAbstractType(null)).toBe(false);
  expect(v.instanceOfAbstractType(undefined)).toBe(false);
});

test('deepPartial', () => {
  const s = v.deepPartial(
    v.object({
      a: v.object({
        b: v.string(),
      }),
    }),
  );

  expect(v.parse({}, s)).toEqual({});
  expect(v.parse({a: {}}, s)).toEqual({a: {}});
});
