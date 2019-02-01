export function modulo(val: number, max: number) {
  return ((val % max) + max) % max;
}

export function clamp(val: number, min: number, max:number) {
  return Math.min(Math.max(min, val), max);
}

export function sum(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0);
}

export function max(arr: number[]) {
  return Math.max.apply(null, arr);
}

export function range(start: number, end: number, max: number) {
  return [...Array(1 + end - start)].map(val =>
    max ? modulo(start + val, max) : start + val
  );
}

export function pickBy(object: object, predicate: (value: any, key: string) => boolean) {
  return Object.keys(object).reduce((result, key) => {
    const value = object[key];
    if (predicate(value, key)) {
      result[key] = value;
    }
    return result;
  }, {});
}

export function areEqualObjects(obj1: object, obj2: object) {
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

const isObject = (obj: unknown) => obj === Object(obj);
