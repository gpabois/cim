import { EntityTypes, ProjectId } from "./model";
import { Optional } from "./option";
import { Filter, SerChunkQuery, Updator } from "./database/query";

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export type Predicate<T> = (arg: T) => boolean;

export interface Group<T, K = any> {
  key: K,
  items: Array<T>
}

export type Groups<T, K = any> = Array<Group<T, K>>;

export interface Crud<Types extends EntityTypes> {
  create: (projectId: ProjectId, aiot: Types['creation']) => Promise<Types["id"]>,
  remove: (projectId: ProjectId, query: Filter<Types['fields']>) => Promise<void>,
  list: (projectId: ProjectId, query: SerChunkQuery<Types['fields']>) => Promise<Array<Types['data']>>,
  get: (projectId: ProjectId, id: Types['id']) => Promise<Optional<Types['data']>>,
  update: (projectId: ProjectId, filter: Filter<Types['fields']>, updator: Updator<Types['fields']>) => Promise<void>
}
