import { isSome } from "../option";
import { Filter, OpCmp } from "./query";
import { Predicate } from "../types";
import { any, all } from "itertools";

export type ObjCmp<T> = { [K in keyof T]?: Filter<T[K]> }

function isPredicate<T>(value: any): value is Predicate<T> {
  return typeof value === 'function'
}

function isObject(value: any): value is Object {
  return value === Object(value)
}

function isFilterExpression<T>(cmp: Filter<T>): cmp is OpCmp<T> & ObjCmp<T> {
  if (isObject(cmp))
    return any(Object.entries(cmp).filter(([k, _]) => k.startsWith('$')).filter((_) => true));

  return false;
}

/// Transforme un filtre en prédicat
export function transformFilter<T>(cmp: Filter<T>): Predicate<T> {
  if (isObject(cmp)) {

    if (isFilterExpression(cmp)) {
      let sub: Array<(T) => boolean> = [];
      if (isSome(cmp.$like)) sub.push((value) => {
        let valStr = value as string;
        let pattern = cmp.$like as string;
        return valStr.includes(pattern)
      });
      if (isSome(cmp.$eq)) sub.push((value) => value === cmp.$eq);
      if (isSome(cmp.$neq)) sub.push((value) => value !== cmp.$neq);
      if (isSome(cmp.$in)) sub.push((value) => cmp.$in!.includes(value));
      if (isSome(cmp.$nin)) sub.push((value) => !cmp.$nin!.includes(value));

      if (isSome(cmp.$or)) {
        const ors = cmp.$or.map(transformFilter);
        sub.push((value) => any(ors.map((f) => f(value))));
      }

      if (isSome(cmp.$and)) {
        const ands = cmp.$and.map(transformFilter);
        sub.push((value) => all(ands.map((f) => f(value))));
      }

      return (value) => all(sub.map((f) => f(value)));
    }

    const sub = Object.entries(cmp).map(([prop, cmp]) => {
      let prop_filter = transformFilter(cmp);
      return (value) => prop_filter(value[prop]);
    })

    return (value) => all(sub.map((f) => f(value)));
  }

  return (value) => value === cmp
}

/// Assure de retourner un prédicat quelque soit le type (filtre ou prédicat)
export function assertPredicate<T>(value: Predicate<T> | Filter<T>): Predicate<T> {
  if (isPredicate(value)) return value;
  return transformFilter(value)
}