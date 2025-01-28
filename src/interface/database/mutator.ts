import { any } from "itertools";
import merge from "deepmerge";

import { isSome } from "../option";
import { Mutator, Updator } from "./query";

export function assertMutator<T>(value: Mutator<T> | Updator<T>): Mutator<T> {
  if (isMutator(value)) return value as Mutator<T>;
  return transformUpdator(value as Updator<T>)
}

function isMutator<T>(value: any): value is Mutator<T> {
  return typeof value == 'function';
}

function isObject(value: any): value is Object {
  return value === Object(value)
}

function isUpdator<T>(cmp: Updator<T>): cmp is Updator<T> {
  if (isObject(cmp))
    return any(Object.entries(cmp).filter(([k, _]) => k.startsWith('$')).filter((_) => true));

  return false;
}

export function modifyPath(path: string, modifier: (value: any) => any, entity: any) {
  var segments = path.split('.')
  var cursor = entity;

  while(segments.length > 0) {
    const segment = segments.shift()!;
    // tail
    if (segments.length == 0) {
      if(Array.isArray(cursor)) {
        cursor[parseInt(segment)] = modifier(cursor[parseInt(segment)]);
        cursor = cursor[parseInt(segment)];
      } else {
        cursor[segment] = modifier(cursor[segment]);
      }
    } else {
      if(Array.isArray(cursor)) {
        cursor = cursor[parseInt(segment)];
      } else {
        cursor = cursor[segment];
      }
    }
  }

  return entity;
}

export function transformUpdator<T>(updator: Updator<T>): (old: T) => T {
  if (isUpdator(updator)) {
    const mutators: Array<Mutator<T>> = [];

    if (isSome(updator.$set)) {
      mutators.push((value: T) => {
        const newDoc = structuredClone(value);
        return Object.entries(updator.$set!)
        .reduce((doc, [path, value]) => modifyPath(path, (_) => value, doc), newDoc)
      })
    }

    if (isSome(updator.$setArrayElement)) {
      mutators.push((value: T) => {
        const newDoc = structuredClone(value);
        return Object.entries(updator.$setArrayElement!).reduce((doc, [path, value]) => {
          return modifyPath(path, (_) => value, doc)
        }, newDoc)
      })
    }

    if (isSome(updator.$add)) {
      mutators.push((value: T) => {
        const newDoc = structuredClone(value);
        return Object.entries(updator.$add!)
        .reduce((doc, [path, value]) => modifyPath(path, (arr) => [...arr, value], doc), newDoc)
      })
    }

    if (isSome(updator.$removeArrayElementAt)) {
      mutators.push((value: T) => {
        const newDoc = structuredClone(value);
        const removeFn = (index: number) => (arr: Array<any>) => {
          arr.splice(index, 1); 
          return arr;
        }

        return Object.entries(updator.$removeArrayElementAt!)
        .reduce((doc, [path, at]) => modifyPath(path, removeFn(at), doc), newDoc)
      })
    }

    if (isSome(updator.$remove)) {
      mutators.push((value: T) => {
        const newDoc = structuredClone(value);
        const removeFn = (predicate: (val: any) => boolean) => (arr: Array<any>) => arr.filter(i => !predicate(i));
        return Object.entries(updator.$remove!)
        .reduce((doc, [path, predicate]) => modifyPath(path, removeFn(predicate), doc), newDoc)
      })
    }

    if (isSome(updator.$merge)) {
      mutators.push((value: T) => {
        const newValue = structuredClone(value);
        return merge.all([newValue, updator.$merge]) as T
      })
    }

    return (old: T) => mutators.reduce((acc, mutator) => mutator(acc), old)
  }

  return (arg: T) => arg
}
