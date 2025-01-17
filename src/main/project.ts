import snowflake from "./snowflake";
import { Database, open_database } from "./database";
import path from "node:path";
import fs from "node:fs/promises";
import { Template } from "./template";
import { ProjectId } from "@interface/model";

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

    public static async open(root: string): Promise<ProjectId> {
        let project_id = `${snowflake.nextId()}`;

        let db = await open_database(root);
        let tpl = new Template(root);
    
        let project = new Project({db, tpl});
        currentProjects[project_id] = project;
        return project_id;
    } 

    public static flushAll() {
        Object.entries(currentProjects).map(([_, project]) => project.flush())
    }

    public static async create(root: string): Promise<ProjectId> {
        await fs.mkdir(root);
        await fs.writeFile(path.join(root, ".cim"), "");
        let db = new Database({root});
        await db.initialise();
        return await Project.open(root);
    }

    constructor(args: ProjectArgs) {
        this.db = args.db;
        this.tpl = args.tpl;
    }

    public flush() {
        this.db.flush();
    }

    public async generateDocumentFromTemplate<T=any>(name: string, data: T): Promise<Uint8Array> {
      return await this.tpl.generateFromName(name, data)
    }
}