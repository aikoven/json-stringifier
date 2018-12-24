import {stringify} from '..';

test('custom-types', () => {
  /**
   * Custom stringifier that supports Sets and Maps.
   */
  function customStringify(value: any): string | undefined {
    if (value instanceof Set) {
      return stringify({'@@type': 'Set', values: [...value]}, customStringify);
    }

    if (value instanceof Map) {
      return stringify({'@@type': 'Map', entries: [...value]}, customStringify);
    }

    return stringify(value, customStringify);
  }

  expect(customStringify(new Set([1, 2, 3]))).toBe(
    '{"@@type":"Set","values":[1,2,3]}',
  );

  expect(customStringify(new Map([[1, 'a'], [2, 'b'], [3, 'c']]))).toBe(
    '{"@@type":"Map","entries":[[1,"a"],[2,"b"],[3,"c"]]}',
  );

  expect(customStringify(new Map([[1, new Set(['a', 'b', 'c'])]]))).toBe(
    '{"@@type":"Map","entries":[[1,{"@@type":"Set","values":["a","b","c"]}]]}',
  );

  expect(customStringify({a: new Set([1, 2, 3])})).toBe(
    '{"a":{"@@type":"Set","values":[1,2,3]}}',
  );

  expect(customStringify([new Set([1, 2, 3])])).toBe(
    '[{"@@type":"Set","values":[1,2,3]}]',
  );
});
