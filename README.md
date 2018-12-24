# json-stringifier [![npm version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]

Alternative to `JSON.stringify()` that supports altering the behavior of the
stringification process at string level.

## Rationale

It's common to use objects in immutable fashion. We could optimize the
serialization of these objects by caching their JSON representation. However,
there's no way to achieve this using built-in `JSON.stringify()` function: its
[`replacer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_replacer_parameter)
parameter only allows substituting serialized values, but not resulting strings.
`stringify()` function provided by this library accepts a `stringifier`
parameter that lets us override the stringification of values in the object
tree. See [Memoization](#Memoization) example.

Another use case is when you have a strict schema for some objects inside your
object tree. With this library you can use
[`fast-json-stringify`](https://github.com/fastify/fast-json-stringify) for
these objects and the regular stringification for the rest.

## Installation

    $ npm install ice-to-plain

## Examples

### Memoization

Custom stringifier that memoizes JSON representations of objects:

```js
import {stringify} from 'json-stringifier';

const cache = new WeakMap();

function memoizedStringify(value) {
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

let state = {
  obj: {a: 1},
  arr: [1, 2, 3],
};

memoizedStringify(state); // '{"obj":{"a":1},"arr":[1,2,3]}'

state = {
  ...state,
  arr: [4, 5, 6],
};

memoizedStringify(state); // state.obj stringification is bypassed
```

### Handling Circular References

Custom stringifier that handles circular references:

```js
function safeStringify(value, seen) {
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

const obj = {};
obj.self = obj;
obj.child = {parent: obj};

safeStringify(obj); // '{"self":"<circular>","child":{"parent":"<circular>"}}'
```

### Support Additional Structures

Custom stringifier that supports Sets and Maps:

```js
function customStringify(value) {
  if (value instanceof Set) {
    return stringify({'@@type': 'Set', values: [...value]}, customStringify);
  }

  if (value instanceof Map) {
    return stringify({'@@type': 'Map', entries: [...value]}, customStringify);
  }

  return stringify(value, customStringify);
}

customStringify({
  set: new Set([1, 2, 3]),
  map: new Map([[1, 'a'], [2, 'b'], [3, 'c']])),
});
// '{"set":{"@@type":"Set","values":[1,2,3]},"map":{"@@type":"Map","entries":[[1,"a"],[2,"b"],[3,"c"]]}}'
```

## API

`stringifier(value, stringify = stringifier)`

- `value` — The value to convert to a JSON string.
- `stringify` (optional) — A function that is called to get the JSON string for
  each property value when `value` is an object, or each element when `value` is
  an array. `stringify` is called with a single argument — the property value or
  array element and must return a string or `undefined`. Note that `stringify`
  is not called with the `value` itself. Defaults to `stringifier`, which gives
  recursive stringification.
- Returns a JSON string representing the given value or `undefined` if `value`
  is `undefined`, a function or a symbol.

## Comparison with JSON.stringify()

`stringify(value)` behaves mostly the same as `JSON.stringify(value)` with few
exceptions:

- [`toJSON()`](<https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#toJSON()_behavior>)
  is always called with no arguments.
- Primitive wrapper types `Boolean`, `Number` and `String` are not supported
  (yet).

[npm-image]: https://badge.fury.io/js/json-stringifier.svg [npm-url]:
https://badge.fury.io/js/json-stringifier [travis-image]:
https://travis-ci.org/aikoven/json-stringifier.svg?branch=master [travis-url]:
https://travis-ci.org/aikoven/json-stringifier
