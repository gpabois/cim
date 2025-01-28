import { ServiceTypes } from "@shared/model/services";
import { BaseController, exposeCrud } from ".";
import { Hydrator } from "..";
import { Crud } from "@shared/types";
import { ProjectId } from "@shared/model";
import snowflake from "@shared/snowflake";
import { Filter, SerChunkQuery, Updator } from "@shared/database/query";
import { imap } from "itertools";
import { Project } from "@shared/project";
import { mapSome, Optional } from "@shared/option";
import { partial } from "ramda";

export class ServicesController extends BaseController<"services"> implements Crud<ServiceTypes>, Hydrator<ServiceTypes> {
  constructor() {
    super("services", {});
    this.expose(exposeCrud<ServiceTypes>(this));
  }

  async hydrate(_projectId: ProjectId, fields: ServiceTypes["fields"]): Promise<ServiceTypes["data"]> {
    return fields
  }

  async create(projectId: ProjectId, create: ServiceTypes["creation"]): Promise<string> {
    const project = Project.get(projectId)!;
    const services = project.db.getCollection("services");
    const insert: ServiceTypes["fields"] = {
      id: `${snowflake.nextId()}`,
      ...create
    }
    services.insert(insert);
    return insert.id;
  }

  async list(projectId: ProjectId, query: SerChunkQuery<ServiceTypes["fields"]>): Promise<ServiceTypes["data"][]> {
    const project = Project.get(projectId)!;
    const services = project.db.getCollection("services");
    return Promise.all([...imap(services.findBy(query), partial(this.hydrate, [projectId]))]);
  }

  async get(projectId: ProjectId, id: string): Promise<Optional<ServiceTypes["data"]>> {
    const project = Project.get(projectId)!;
    const services = project.db.getCollection("services");
    return mapSome(services.findOneBy({id}), partial(this.hydrate, [projectId]));
  }

  async update(projectId: ProjectId, filter: Filter<ServiceTypes["fields"]>, updator: Updator<ServiceTypes["fields"]>): Promise<void> {
    const project = Project.get(projectId)!;
    const coll = project.db.getCollection("services");
    coll.update(filter, updator);
  }
}