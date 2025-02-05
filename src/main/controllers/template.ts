import { ProjectId } from "@shared/model";
import { BaseController } from ".";
import { dialog } from "electron/main";
import { isSome } from "@shared/option";
import { Project } from "@shared/project";
import fs from 'node:fs';

export class TemplatesController extends BaseController<"template"> {
  constructor() {
    super("template", {});
    this.expose({
      generateAndSave: (...args) => this.generateAndSave(...args)
    })
  }

  async generateAndSave<T>(projectId: ProjectId, name: string, data: T): Promise<void> {
    const project = Project.get(projectId)!;

    const file = dialog.showSaveDialogSync({
      title: "Sauvegarder le document généré par le modèle",
  
      properties: ["showOverwriteConfirmation"]
    })

    if(isSome(file)) {
      const bytes = await project.tpl.generateFromName(name, data);
      fs.writeFileSync(file, bytes);
    }
  }
}