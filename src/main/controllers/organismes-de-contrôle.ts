import { OrganismeDeControleTypes } from "@shared/model/organismes-de-controle";
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

export class OrganismesDeControleController extends BaseController<"organismesDeContrôle"> implements Crud<OrganismeDeControleTypes>, Hydrator<OrganismeDeControleTypes> {
  constructor() {
    super("organismesDeContrôle", {});
    this.expose(exposeCrud<OrganismeDeControleTypes>(this));
  }

  async hydrate(_projectId: ProjectId, fields: OrganismeDeControleTypes["fields"]): Promise<OrganismeDeControleTypes["data"]> {
    return fields
  }

  async create(projectId: ProjectId, create: OrganismeDeControleTypes["creation"]): Promise<string> {
    const project = Project.get(projectId)!;
    const services = project.db.getCollection("services");
    const insert: OrganismeDeControleTypes["fields"] = {
      id: `${snowflake.nextId()}`,
      ...create
    }
    services.insert(insert);
    return insert.id;
  }

  async list(projectId: ProjectId, query: SerChunkQuery<OrganismeDeControleTypes["fields"]>): Promise<OrganismeDeControleTypes["data"][]> {
    const project = Project.get(projectId)!;
    const services = project.db.getCollection("organismes-de-contrôle");
    return await Promise.all([...imap(services.findBy(query), fields => this.hydrate(projectId, fields))])
  }

  async get(projectId: ProjectId, id: string): Promise<Optional<OrganismeDeControleTypes["data"]>> {
    const project = Project.get(projectId)!;
    const services = project.db.getCollection("organismes-de-contrôle");
    return mapSome(services.findOneBy({id}), partial(this.hydrate, [projectId]));
  }

  async update(projectId: ProjectId, filter: Filter<OrganismeDeControleTypes["fields"]>, updator: Updator<OrganismeDeControleTypes["fields"]>): Promise<void> {
    const project = Project.get(projectId)!;
    const coll = project.db.getCollection("organismes-de-contrôle");
    coll.update(filter, updator);
  }
}