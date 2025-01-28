import snowflake from "./snowflake";
import { Database } from "@shared/database/index";
import { Template } from "./template";
import { ProjectId } from "@shared/model";
import { Storage } from "./storage";

export interface ProjectArgs {
    db: Database,
    tpl: Template
}

const currentProjects: Record<string, Project> = {}

export class Project {
    db: Database;
    tpl: Template

    public static get(id: ProjectId): Project | undefined {
        return currentProjects[id]
    }

    constructor(args: ProjectArgs) {
      this.db = args.db;
      this.tpl = args.tpl;
    }

    /// Crée un projet depuis une zone de stockage
    public static async create(storage: Storage): Promise<ProjectId> {
      storage.write(".cim", Buffer.from([0xC13]));
      Database.create(storage);
      Template.create(storage);
      return await Project.open(storage);
    }

    /// Ouvre un projet depuis une zone de stockage
    public static async open(rootStorage: Storage): Promise<ProjectId> {
      let projectId = `${snowflake.nextId()}`;

      let db = await new Database({rootStorage})
      let tpl = new Template({rootStorage});
  
      let project = new Project({db, tpl});
      currentProjects[projectId] = project;
      return projectId;
    } 

    public static flushAll() {
        Object.entries(currentProjects).map(([_, project]) => project.flush())
    }

    public flush() {
        this.db.flush();
    }

    public async generateDocumentFromTemplate<T=any>(name: string, data: T): Promise<Uint8Array> {
      return await this.tpl.generateFromName(name, data)
    }
}