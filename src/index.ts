export type Stringifier = (value: any) => string | undefined;

export function stringify(
  value: any,
  stringifier: Stringifier = stringify,
): string | undefined {
  switch (typeof value) {
    case 'undefined':
      return undefined;
    case 'number':
      if (isFinite(value)) {
        return '' + value;
      } else {
        return 'null';
      }
    case 'boolean':
      return '' + value;
    case 'string':
      return stringToJson(value);
    case 'object':
      if (value === null) {
        return 'null';
      }
      if (Array.isArray(value)) {
        return arrayToJson(value, stringifier);
      }

      if (typeof value.toJSON === 'function') {
        return stringify(value.toJSON(), stringifier);
      }

      return objectToJson(value, stringifier);
  }

  return undefined;
}

// copied from pino
//
// magically escape strings for json
// relying on their charCodeAt
// everything below 32 needs JSON.stringify()
// 34 and 92 happens all the time, so we
// have a fast case for them
function stringToJson(str: string) {
  var result = '';
  var last = 0;
  var found = false;
  var point = 255;
  const l = str.length;
  if (l > 100) {
    return JSON.stringify(str);
  }
  for (var i = 0; i < l && point >= 32; i++) {
    point = str.charCodeAt(i);
    if (point === 34 || point === 92) {
      result += str.slice(last, i) + '\\';
      last = i;
      found = true;
    }
  }
  if (!found) {
    result = str;
  } else {
    result += str.slice(last);
  }
  return point < 32 ? JSON.stringify(str) : '"' + result + '"';
}

function arrayToJson(array: Array<any>, stringifier: Stringifier): string {
  if (array.length === 0) {
    return '[]';
  }

  let itemJson = stringifier(array[0]);
  let ret = '[' + (itemJson === undefined ? 'null' : itemJson);

  for (let i = 1; i < array.length; i++) {
    itemJson = stringifier(array[i]);
    ret += ',' + (itemJson === undefined ? 'null' : itemJson);
  }
  return ret + ']';
}

function objectToJson(
  obj: {[key: string]: any},
  stringifier: Stringifier,
): string {
  let ret = '{';
  let comma = false;

  for (const key of Object.keys(obj)) {
    const valueJson = stringifier(obj[key]);
    if (valueJson === undefined) {
      continue;
    }
    if (comma) {
      ret += ',';
    }
    ret += stringToJson(key) + ':' + valueJson;
    comma = true;
  }
  return ret + '}';
}
