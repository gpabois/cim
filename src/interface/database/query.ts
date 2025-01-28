import { isNone } from "../option";
import { Predicate } from "../types";

export type Filter<T> = OpCmp<T> & ObjCmp<T> | OpCmp<T> | T;
export type OpCmp<T> = {
    '$like'?: T,
    '$eq'?: T, 
    '$neq'?: T,
    '$in'?: Array<T>, 
    '$nin'?: Array<T>, 
    '$gt'?: T, 
    '$gte'?: T, 
    '$lt'?: T,
    '$lte'?: T,
    '$or'?: Array<Filter<T>>, 
    '$and'?: Array<Filter<T>>
};
export type ObjCmp<T> = {[K in keyof T]?: Filter<T[K]>}

export interface ChunkQuery<T> {
    filter?: Filter<T> | Predicate<T>
    offset?: number,
    limit?: number
}

export interface SerChunkQuery<T> {
    filter?: Filter<T>,
    offset?: number,
    limit?: number
}

export interface SetField<T, K extends string, U extends ObjectPath<T, K>> {
  U: ObjectPathValue<T, U>
};

export interface Updator<_T> {
  '$set'?: {
    [K: string]: any
  },
  '$setArrayElement'?: {
    [K: string]: any
  },
  '$add'?: {
    [K: string]: any
  },
  '$removeArrayElementAt'?: {
    [K: string]: any
  },
  '$remove'?: {
    [K: string]: any   
  },
  '$merge'?: any
}

/// Builder for an updator
export class UpdatorBuilder<T = any> {
  updator: Updator<T>;
  
  constructor() {
    this.updator = {}
  }

  /// Set a value 
  public set<K extends string>(key: ObjectPath<T, K>, value: ObjectPathValue<T, K>) {
    if(isNone(this.updator.$set)) this.updator.$set = {};
    this.updator.$set![key] = value;
    return this;
  }

  public setArrayElement<K extends string>(key: ObjectPath<T, K>, index: number, value: ObjectArrayElementValue<T, K>) {
    if(isNone(this.updator.$setArrayElement)) this.updator.$setArrayElement = {};
    this.updator.$setArrayElement![`${key}.${index}`] = value;
    return this;
  }

  /// Add an element in an array.
  public add<K extends string>(key: ObjectPath<T, K>, value: ObjectArrayElementValue<T, K>) {
    if(isNone(this.updator.$add)) this.updator.$add = {};
    this.updator.$add![key] = value;
    return this;
  }

  /// Remove element at a given index
  public removeArrayElementAt<K extends string>(key: ObjectPath<T, K>, index: number) {
    if(isNone(this.updator.$removeArrayElementAt)) this.updator.$removeArrayElementAt = {};
    this.updator.$removeArrayElementAt![key] = index;
    return this;
  }

  /// Remove elements from an array based on a predicate.
  public remove<K extends string>(key: ObjectPath<T, K>, predicate: Predicate<ObjectArrayElementValue<T, K>>) {
    if(isNone(this.updator.$remove)) this.updator.$remove = {};
    this.updator.$remove![key] = predicate;
    return this;
  }

  public build(): Updator<T> {
    return this.updator
  }
}

export interface UpdateQuery<T> {
  filter: Filter<T>,
  operations: Updator<T>
}

export type Mutator<T> = (old: T) => T;

type ObjectPath<T, K extends string> = K extends keyof T ? K : K extends `${infer K0}.${infer KR}` ? K0 extends keyof T ? `${K0}.${ObjectPath<T[K0], KR>}` : Extract<keyof T, string> : Extract<keyof T, string>;
type ObjectPathValue<T, K extends string> = K extends keyof T ? T[K] : K extends `${infer K0}.${infer KR}` ? K0 extends keyof T ? ObjectPathValue<T[K0], KR> : never : never; 
type ObjectArrayElementValue<T, K extends string> = ObjectPathValue<T, K> extends Array<infer U> ? U : never;