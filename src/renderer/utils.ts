import * as R from 'ramda';
import { FieldValues, Path, UseFormRegister } from 'react-hook-form';

export const oPath = (...parts: string[]): string => R.join('.')(parts)

export type ScopedFieldPath<T extends FieldValues, S extends Path<T>, U extends string> = `${S}.${U}` extends Path<T> ? U : never;

export const scopedRegister = <T extends FieldValues = FieldValues, S extends Path<T> = any>(register: UseFormRegister<T>, scope: S) => {
  return <U extends string>(name: ScopedFieldPath<T, S, U>) => register(`${scope}.${name}` as any);
}