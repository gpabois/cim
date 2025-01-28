import { None, Optional } from "../option";
import { Storage } from "../storage";
import { isSome } from "../../interface/option";
import { ChunkQuery, Filter, Mutator, Updator } from "./query";
import { assertPredicate } from "./filter";
import { first, ifilter, Predicate } from "itertools";
import { assertMutator } from "./mutator";

export interface BaseCollection {
  flush(): void;
}

export class Collection<T = any> implements BaseCollection {
  private name: string
  private storage: Storage
  private items: Optional<Array<T>>
  private dirty: boolean

  constructor(name: string, storage: Storage) {
    this.name = name;
    this.items = None;
    this.storage = storage;
    this.dirty = false;
  }

  /// Initialise une nouvelle collection
  public static initialise<T>(name: string, storage: Storage): Collection<T> {
    const filepath = `${name}.json`
    storage.write(filepath, Buffer.from("[]"));
    return new Collection(name, storage);
  }

  /// Charge la collection dans la mémoire
  private load() {
    const filepath = `${this.name}.json`;
    if(this.storage.exists(filepath)) {
      this.items = JSON.parse(
        Buffer.from(
          this.storage.read(filepath)
        ).toString()
      );
    } else {
      this.items = [];
      this.dirty = true;
    }
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
    if (this.isLoaded() === false) return;
    if (this.isDirty() === false) return;

    const filepath = `${this.name}.json`;
    const bytes = Buffer.from(JSON.stringify(this.items!));
    this.storage.write(filepath, bytes);
    this.dirty = false;
  }

  /// Itère les éléments de la collection
  /// La fonction génère une copie profonde de l'objet en mémoire,
  /// pour éviter d'éventuels effets de bord.
  public *iter(): Generator<T> {
    if (!this.isLoaded()) this.load();
    for (const item of this.items!) {
      yield structuredClone(item)
    }
  }

  /// Filtre les éléments de la collection
  public *findBy(args: ChunkQuery<T>): Generator<T> {
    let iter: IterableIterator<T> = this.iter();

    if (isSome(args.filter)) {
      const predicate = assertPredicate(args.filter);
      iter = ifilter(this.iter(), predicate);
    }

    yield* iter
  }

  /// Récupère un élément à partir d'un prédicat
  public findOneBy(predicate: Predicate<T> | Filter<T>): Optional<T> {
    return first(this.findBy({ filter: predicate }))
  }

  /// Insère un nouvel élément dans la collection
  public insert(data: T) {
    if (!this.isLoaded()) this.load();
    this.items?.push(data);
    this.dirty = true;
  }

  public update(predicate_or_filter: Filter<T> | Predicate<T>, updator_or_mutator: Updator<T> | Mutator<T>) {
    const predicate = assertPredicate(predicate_or_filter);
    const mutator = assertMutator(updator_or_mutator);

    if (!this.isLoaded()) this.load();

    let dirty = false;

    this.items = this.items?.map(item => {
      if (predicate(item)) {
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
    if (!this.isLoaded()) this.load();
    this.items = this.items?.filter((value) => !predicate(value));
    this.dirty = true;
  }
}
