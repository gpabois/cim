import { None, Optional } from "@shared/option";
import { BaseController } from ".";
import { ProjectId } from "@shared/model";
import { dialog } from "electron/main";
import { Project } from "@shared/project";
import { FsStorage } from "@shared/storage/fs";

export class ProjectController extends BaseController<"project"> {
  constructor() {
    super("project", {});
    
    this.expose({
      new: this.new,
      open: this.open
    })
  }

  async new(): Promise<Optional<ProjectId>> {
    const dir = dialog.showSaveDialogSync({
        title: "Répertoire racine",
        message: "Créer le répertoire racine",
        properties: ["createDirectory"]
      });

    if (dir.length == 0) {
      return None;
    }

    const storage = new FsStorage(dir);
    return await Project.create(storage);
  }

  async open(): Promise<Optional<ProjectId>> {
    const dir = dialog.showOpenDialogSync({
      title: "Répertoire racine",
      message: "Créer le répertoire racine",
      properties: ["openDirectory"]
    });

    if (dir?.length || 0 > 0) {
      const storage = new FsStorage(dir![0]);
      return await Project.open(storage);
    }

    return None;
  }
}