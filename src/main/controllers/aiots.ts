import { SerChunkQuery, Filter, Updator } from "@shared/database/query";
import { ProjectId } from "@shared/model";
import { AiotCreation, AiotData, AiotFields, AiotTypes } from "@shared/model/aiots";
import { mapSome, Optional } from "@shared/option";
import { Project } from "@shared/project";
import { Crud } from "@shared/types";
import { Hydrator } from "..";
import { imap } from "itertools";
import { BaseController, exposeCrud } from ".";
import { partial } from "ramda";

export class AiotsController extends BaseController<"aiots"> implements Crud<AiotTypes>, Hydrator<AiotTypes> {
  constructor() {
    super("aiots", {});
    this.expose(exposeCrud<AiotTypes>(this));
  }

  /// Hydrate les données de l'AIOT
  async hydrate(_projectId: ProjectId, aiot: AiotFields): Promise<AiotData> {
    return {
      ...aiot,
      département: aiot.adresse.codePostal.slice(0, 2)
    }
  }

  async create(projectId: ProjectId, aiot: AiotCreation): Promise<string> {
    const project = Project.get(projectId)!;
    const aiots = project.db.getCollection("aiots");
    aiots.insert(aiot);
    return aiot.codeAiot;
  }

  async list(projectId: ProjectId, query: SerChunkQuery<AiotFields>): Promise<AiotData[]> {
    const project = Project.get(projectId)!;
    const aiots = project.db.getCollection("aiots");

    return Promise.all([
      ...imap(
        aiots.findBy(query),
        fields => this.hydrate(projectId, fields)
      )
    ])
  }

  async get(projectId: ProjectId, codeAiot: string): Promise<Optional<AiotData>> {
    const project = Project.get(projectId)!;
    const aiots = project.db.getCollection("aiots");
    
    return mapSome(
      aiots.findOneBy({codeAiot}), 
      fields => this.hydrate(projectId, fields)
    );
  }

  async update(projectId: ProjectId, filter: Filter<AiotFields>, updator: Updator<AiotFields>): Promise<void> {
    const project = Project.get(projectId)!;
    const aiots = project.db.getCollection("aiots");
    aiots.update(filter, updator);
  }
}