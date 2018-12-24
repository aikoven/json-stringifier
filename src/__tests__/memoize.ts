import {stringify as stringify_} from '..';

test('memoize', () => {
  const stringify = jest.fn(stringify_);

  /**
   * Custom stringifier that memoizes JSON representations of objects.
   */
  function memoizedStringify(value: any): string | undefined {
    if (value !== null && typeof value === 'object') {
      if (cache.has(value)) {
        return cache.get(value);
      } else {
        const json = stringify(value, memoizedStringify);

        cache.set(value, json);

        return json;
      }
    }

    return stringify(value, memoizedStringify);
  }

  const cache = new WeakMap<any, string | undefined>();

  /**
   * Return the number of times `stringify()` have been called for given value.
   */
  function getStringifyTimes(value: any) {
    return stringify.mock.calls.filter(([v]) => v === value).length;
  }

  let state = {
    obj: {a: 1},
    arr: [1, 2, 3],
  };

  expect(memoizedStringify(state)).toBe('{"obj":{"a":1},"arr":[1,2,3]}');
  expect(getStringifyTimes(state.obj)).toBe(1);

  state = {
    ...state,
    arr: [4, 5, 6],
  };

  expect(memoizedStringify(state)).toBe('{"obj":{"a":1},"arr":[4,5,6]}');
  expect(getStringifyTimes(state.obj)).toBe(1);
  expect(getStringifyTimes(state.arr)).toBe(1);

  state = {
    ...state,
    obj: {a: 2},
  };

  expect(memoizedStringify(state)).toBe('{"obj":{"a":2},"arr":[4,5,6]}');
  expect(getStringifyTimes(state.arr)).toBe(1);
});
