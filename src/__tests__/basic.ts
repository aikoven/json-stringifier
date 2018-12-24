import {stringify} from '..';

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#Description
test('basic', () => {
  expect(stringify({})).toBe('{}');
  expect(stringify(true)).toBe('true');
  expect(stringify('foo')).toBe('"foo"');
  expect(stringify([1, 'false', false])).toBe('[1,"false",false]');
  expect(stringify([NaN, null, Infinity])).toBe('[null,null,null]');
  expect(stringify({x: 5})).toBe('{"x":5}');

  expect(stringify(new Date('2006-01-02T15:04:05.000Z'))).toBe(
    '"2006-01-02T15:04:05.000Z"',
  );

  expect(stringify({x: 5, y: 6})).toBe('{"x":5,"y":6}');

  // TODO: support primitive wrappers
  // expect(
  //   stringify([new Number(3), new String('false'), new Boolean(false)]),
  // ).toBe('[3,"false",false]');

  // String-keyed array elements are not enumerable and make no sense in JSON
  let a = ['foo', 'bar'];
  (a as any)['baz'] = 'quux'; // a: [ 0: 'foo', 1: 'bar', baz: 'quux' ]
  expect(stringify(a)).toBe('["foo","bar"]');

  expect(stringify({x: [10, undefined, function() {}, Symbol('')]})).toBe(
    '{"x":[10,null,null,null]}',
  );

  // Standard data structures
  expect(
    stringify([
      new Set([1]),
      new Map([[1, 2]]),
      new WeakSet([{a: 1}]),
      new WeakMap([[{a: 1}, 2]]),
    ]),
  ).toBe('[{},{},{},{}]');

  // TypedArray
  expect(
    stringify([new Int8Array([1]), new Int16Array([1]), new Int32Array([1])]),
  ).toBe('[{"0":1},{"0":1},{"0":1}]');

  expect(
    stringify([
      new Uint8Array([1]),
      new Uint8ClampedArray([1]),
      new Uint16Array([1]),
      new Uint32Array([1]),
    ]),
  ).toBe('[{"0":1},{"0":1},{"0":1},{"0":1}]');
  expect(stringify([new Float32Array([1]), new Float64Array([1])])).toBe(
    '[{"0":1},{"0":1}]',
  );

  // toJSON()
  expect(
    stringify({
      x: 5,
      y: 6,
      toJSON() {
        return this.x + this.y;
      },
    }),
  ).toBe('11');

  // Symbols:
  expect(stringify({x: undefined, y: Object, z: Symbol('')})).toBe('{}');
  expect(stringify({[Symbol('foo')]: 'foo'})).toBe('{}');

  // Non-enumerable properties:
  expect(
    stringify(
      Object.create(null, {
        x: {value: 'x', enumerable: false},
        y: {value: 'y', enumerable: true},
      }),
    ),
  ).toBe('{"y":"y"}');
});
