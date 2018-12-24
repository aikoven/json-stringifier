import {stringify} from '..';

test('circular', () => {
  /**
   * Custom stringifier that handles circular references.
   */
  function safeStringify(value: any, seen?: Set<object>): string | undefined {
    if (value !== null && typeof value === 'object') {
      if (seen && seen.has(value)) {
        return '"<circular>"';
      }

      if (seen == null) {
        seen = new Set();
      }
      seen.add(value);

      const json = stringify(value, child => safeStringify(child, seen));

      seen.delete(value);

      return json;
    }

    return stringify(value);
  }

  const obj: any = {};
  obj.self = obj;
  const child = {parent: obj};
  obj.children = [child, child];

  expect(safeStringify(obj)).toBe(
    '{"self":"<circular>","children":[{"parent":"<circular>"},{"parent":"<circular>"}]}',
  );
});
