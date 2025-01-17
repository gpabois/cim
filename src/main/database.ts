import path from 'node:path';
import fs from 'node:fs';
import { ifilter, first, any, all, Predicate } from "itertools";
import merge from "deepmerge";
import * as R from "ramda";

import { isNone, isSome, None, Optional } from "@interface/option";
import { ChunkQuery, Filter, Mutator, OpCmp, Updator } from "@interface/query";

export async function open_database(root: string): Promise<Database> {
    return new Database({root})
}

export interface DatabaseArgs {
    root: string
}

export interface BaseCollection {
    flush(): void;
}

export class Collection<T=any> implements BaseCollection {
    private root: string
    private name: string

    private items: Optional<Array<T>>
    private dirty: boolean

    constructor(root: string, name: string) {
        this.root = root;
        this.name = name;
        this.items = None;
        this.dirty = false;
    }

    /// Initialise une nouvelle collection
    public static initialise<T>(root: string, name: string): Collection<T> {
        const filepath = path.join(root, `${name}.json`)
        fs.writeFileSync(filepath, "[]", "utf-8");
        return new Collection(root, name);
    }

    /// Charge la collection dans la mémoire
    private load() {
        const filepath = path.join(this.root, `${this.name}.json`);
        const bytes = fs.readFileSync(filepath, {encoding: "utf-8"});
        this.items = JSON.parse(bytes);
    }

    /// La collection est chargée en mémoire
    private isLoaded(): boolean {
        return isSome(this.items);
    }

    /// La collection est sale, elle doit être flushed
    private isDirty(): boolean {
        return this.dirty
    }

    /// Flush les modifications dans le stockage
    public flush() {
        if(this.isLoaded() === false) return; 
        if(this.isDirty() === false) return;

        const filepath = path.join(this.root, `${this.name}.json`);
        fs.writeFileSync(filepath, JSON.stringify(this.items!), "utf-8");
        this.dirty = false;
    }

    /// Itère les éléments de la collection
    /// La fonction génère une copie profonde de l'objet en mémoire,
    /// pour éviter d'éventuels effets de bord.
    public *iter(): Generator<T> {
        if(!this.isLoaded()) this.load();
        for(const item of this.items!) {
            yield structuredClone(item)
        }
    }

    /// Filtre les éléments de la collection
    public *findBy(args: ChunkQuery<T>): Generator<T> {
        let iter: IterableIterator<T> = this.iter();

        if(isSome(args.filter)) {
            const predicate = assertPredicate(args.filter);
            iter = ifilter(this.iter(), predicate);
        }

        yield* iter
    }

    /// Récupère un élément à partir d'un prédicat
    public findOneBy(predicate: Predicate<T> | Filter<T>): Optional<T> {
        return first(this.findBy({filter: predicate}))
    }

    /// Insère un nouvel élément dans la collection
    public insert(data: T) {
        if(!this.isLoaded()) this.load();
        this.items?.push(data);
        this.dirty = true;
    }

    public update(predicate_or_filter: Filter<T> | Predicate<T>, updator_or_mutator: Updator<T> | Mutator<T>) {
      const predicate = assertPredicate(predicate_or_filter);
      const mutator = assertMutator(updator_or_mutator);

      if(!this.isLoaded()) this.load();

      let dirty = false;

      this.items = this.items?.map(item => {
        if(predicate(item)) {
          dirty = true;
          return mutator(item)
        };
        return item;
      });

      this.dirty = dirty;  
    }

    /// Retire un ou plusieurs éléments de la collection à partir d'un prédicat.
    public remove(predicate_or_filter: Predicate<T> | Filter<T>) {
        const predicate = assertPredicate(predicate_or_filter);
        if(!this.isLoaded()) this.load();
        this.items = this.items?.filter((value) => !predicate(value));
        this.dirty = true;  
    }
}


function assertPredicate<T>(value: Predicate<T> | Filter<T>): Predicate<T> {
    if(isPredicate(value)) return value;
    return transformFilter(value)
}

function assertMutator<T>(value: Mutator<T> | Updator<T>): Mutator<T> {
  if(isMutator(value)) return value as Mutator<T>;
  return transformUpdator(value as Updator<T>)
}

function isMutator<T>(value: any): value is Mutator<T> {
  return typeof value == 'function';
}

function isPredicate<T>(value: any): value is Predicate<T> {
    return typeof value === 'function'
}

function isObject(value: any): value is Object {
    return value === Object(value)
}

function isFilterExpression<T>(cmp: Filter<T>): cmp is OpCmp<T> & ObjCmp<T> {
    if(isObject(cmp))
        return any(Object.entries(cmp).filter(([k, _]) => k.startsWith('$')).filter((_) => true));

    return false;
}

function isUpdator<T>(cmp: Updator<T>): cmp is Updator<T> {
  if(isObject(cmp))
      return any(Object.entries(cmp).filter(([k, _]) => k.startsWith('$')).filter((_) => true));

  return false;
}

export type ObjCmp<T> = {[K in keyof T]?: Filter<T[K]>}

function transformFilter<T>(cmp: Filter<T>): (T) => boolean {
    if(isObject(cmp)) {

        if(isFilterExpression(cmp)) {   
            let sub: Array<(T) => boolean> = []; 
            if(isSome(cmp.$like)) sub.push((value) => {
              let valStr = value as string;
              let pattern = cmp.$like as string;
              return valStr.includes(pattern)
            });
            if(isSome(cmp.$eq)) sub.push((value) => value === cmp.$eq);
            if(isSome(cmp.$neq)) sub.push((value) => value !== cmp.$neq);
            if(isSome(cmp.$in)) sub.push((value) => cmp.$in!.includes(value));
            if(isSome(cmp.$nin)) sub.push((value) => !cmp.$nin!.includes(value));
    
            if(isSome(cmp.$or)) {
                const ors = cmp.$or.map(transformFilter);
                sub.push((value) => any(ors.map((f) => f(value))));
            }
    
            if(isSome(cmp.$and)) {
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

export function transformUpdator<T>(updator: Updator<T>): (old: T) => T {
  if(isUpdator(updator)) {
    const mutators: Array<Mutator<T>> = [];

    if(isSome(updator.$set)) {
      mutators.push((value: T) => {
        const newValue = structuredClone(value);
        //@ts-ignore
        return Object.entries(updator.$set!).reduce((acc, [k, v]) => R.assoPath(k.split('.'), v, acc), newValue)
      })
    }
  
    if(isSome(updator.$setArrayElement)) {
      mutators.push((value: T) => {
        const newValue = structuredClone(value);
        return Object.entries(updator.$setArrayElement!).reduce((acc, [k, v]) => {
          let path = k.split('.');
          let index = parseInt(path.pop()!);
          return R.modifyPath(path, (arr) => {arr[index] = v; return arr}, acc);
        }, newValue)
      })
    }

    if(isSome(updator.$add)) {
      mutators.push((value: T) => {
        const newValue = structuredClone(value);
        return Object.entries(updator.$add!).reduce((acc, [k, v]) => R.modifyPath(k.split('.'), (arr) => [...arr, v], acc), newValue)
      })     
    }

    if(isSome(updator.$removeArrayElementAt)) {
      mutators.push((value: T) => {
        const newValue = structuredClone(value);
        //@ts-ignore
        return Object.entries(updator.$removeArrayElementAt!).reduce((acc, [k, v]) => R.modifyPath(k.split('.'), (arr) => {arr.splice(v, 1); return arr}), newValue)
      })     
    }

    if(isSome(updator.$remove)) {
      mutators.push((value: T) => {
        const newValue = structuredClone(value);
        return Object.entries(updator.$remove!).reduce((acc, [k, v]) => R.modifyPath(k.split('.'), (arr) => arr.filter(i => !v(i)), acc), newValue)
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

export class Database {
    root: string;
    opened: Record<string, BaseCollection>;

    constructor(args: DatabaseArgs) {
        this.root = args.root;
        this.opened = {}
    }  

    /// Initialise la base de données
    async initialise() {
        Collection.initialise(this.root, "aiots");
        Collection.initialise(this.root, "contrôles");
        Collection.initialise(this.root, "services");
        Collection.initialise(this.root, "organismes-de-contrôle");
    }

    public flush() {
        Object.entries(this.opened).forEach(([_, col]) => col.flush());
    }

    public getCollection<T>(name: string): Collection<T> {
        if(isNone(this.opened[name])) {
            this.opened[name] = new Collection<T>(this.root, name);
        }

        return this.opened[name] as Collection<T>;
    }
}