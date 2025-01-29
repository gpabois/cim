import { ControleTypes } from "@shared/model/controle";
import { BaseController, exposeCrud } from ".";
import { Hydrator } from "..";
import { Crud } from "@shared/types";
import { ProjectId } from "@shared/model";
import snowflake from "@shared/snowflake";
import { Filter, SerChunkQuery, Updator } from "@shared/database/query";
import { imap } from "itertools";
import { Project } from "@shared/project";
import { mapSome, Optional } from "@shared/option";
import { AiotsController } from "./aiots";

export interface ControlesControllerArgs {
  aiots: AiotsController 
}

export class ControlesController extends BaseController<"contrôles"> implements Crud<ControleTypes>, Hydrator<ControleTypes> {
  aiots: AiotsController

  constructor(args: ControlesControllerArgs) {
    super("contrôles", {});
    this.expose(exposeCrud<ControleTypes>(this));
    this.aiots = args.aiots;
  }

  async hydrate(projectId: ProjectId, fields: ControleTypes["fields"]): Promise<ControleTypes["data"]> {
    const aiot = (await this.aiots.get(projectId, fields.codeAiot))!;

    return {
      ...fields,
      nom: `${fields.année} - ${aiot.nom}`,
      aiot
    }
  }

  async create(projectId: ProjectId, create: ControleTypes["creation"]): Promise<string> {
    const project = Project.get(projectId)!;
    const services = project.db.getCollection("contrôles");
    const insert: ControleTypes["fields"] = {
      id: `${snowflake.nextId()}`,
      ...create
    }
    services.insert(insert);
    return insert.id;
  }

  async list(projectId: ProjectId, query: SerChunkQuery<ControleTypes["fields"]>): Promise<ControleTypes["data"][]> {
    const project = Project.get(projectId)!;
    const services = project.db.getCollection("contrôles");

    return await Promise.all([...imap(
      services.findBy(query), 
      fields => this.hydrate(projectId, fields)
    )])
  }

  async get(projectId: ProjectId, id: string): Promise<Optional<ControleTypes["data"]>> {
    const project = Project.get(projectId)!;
    const services = project.db.getCollection("contrôles");
    const fields = services.findOneBy({id});
    return await mapSome(
      fields, 
      fields => this.hydrate(projectId, fields)
    );
  }

  async update(projectId: ProjectId, filter: Filter<ControleTypes["fields"]>, updator: Updator<ControleTypes["fields"]>): Promise<void> {
    const project = Project.get(projectId)!;
    const coll = project.db.getCollection("contrôles");
    coll.update(filter, updator);
  }
}