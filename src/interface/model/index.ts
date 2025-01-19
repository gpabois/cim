export type EntityTypes<Id = unknown, Creation = unknown, Data = unknown, Fields = unknown> = {
  id: Id,
  creation: Creation,
  data: Data,
  fields: Fields
}

export type ProjectId = string;
