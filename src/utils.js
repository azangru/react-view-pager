export function modulo(val, max) {
  return ((val % max) + max) % max;
}

export function clamp(val, min, max) {
  return Math.min(Math.max(min, val), max);
}

export function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

export function max(arr) {
  return Math.max.apply(null, arr);
}

export function range(start, end, max) {
  return [...Array(1 + end - start)].map(val =>
    max ? modulo(start + val, max) : start + val
  );
}

export function pickBy(object, predicate) {
  return Object.keys(object).reduce((result, key) => {
    const value = object[key];
    if (predicate(value, key)) {
      result[key] = value;
    }
    return result;
  }, {});
}

export function areEqualObjects(obj1, obj2) {
  if (Object.keys(obj1).length !== Object.keys(obj2).length) return false;

  return Object.keys(obj1).map(key => {
    const value1 = obj1[key];
    const value2 = obj2[key];
    if (!isObject(value1)) {
      return value1 === value2;
    } else if (!(isObject(value1) && isObject(value2))) {
      return false;
    } else if (Array.isArray(value1) && Array.isArray(value2)) {
      return value1.map((val, index) => val === value2[index]).every(Boolean);
    } else {
      return areEqualObjects(value1, value2);
    }
  }).every(Boolean);
}

export const noop = () => {};

const isObject = (obj) => obj === Object(obj);
