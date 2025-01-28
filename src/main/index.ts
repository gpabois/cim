import { is } from '@electron-toolkit/utils'
import { installExtension, REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { Project } from "@shared/project";
import { EntityTypes, ProjectId } from '@shared/model';

import { AiotsController } from './controllers/aiots';
import { ServicesController } from './controllers/services';
import { ProjectController } from './controllers/project';
import { ICimAPI } from '@shared/bridge';
import { OrganismesDeControleController } from './controllers/organismes-de-contrôle';
import { ControlesController } from './controllers/contrôles';
import { TemplatesController } from './controllers/template';

export interface Hydrator<E extends EntityTypes> {
  hydrate(projectId: ProjectId, row: E["fields"]): Promise<E["data"]>
}

export class Entry implements ICimAPI {
  public project: ProjectController;
  public aiots: AiotsController;
  public services: ServicesController;
  public organismesDeContrôle: OrganismesDeControleController;
  public contrôles: ControlesController;
  public template: TemplatesController;
  
  constructor() {
    this.project = new ProjectController();
    this.aiots = new AiotsController();
    this.services = new ServicesController();
    this.organismesDeContrôle = new OrganismesDeControleController();
    this.contrôles = new ControlesController({
      aiots: this.aiots
    });
    this.template = new TemplatesController();
  }

  /// Enregistre les entrypoints sur le channel de communication avec le processus
  /// renderer
  register(ipcMain: Electron.IpcMain) {
    this.project.register(ipcMain)
    this.aiots.register(ipcMain);
    this.services.register(ipcMain);
    this.organismesDeContrôle.register(ipcMain);
    this.contrôles.register(ipcMain);
    this.template.register(ipcMain);
  }
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.mjs"),
      sandbox: false
    },
  });

  // and load the index.html of the app.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'), { hash: "/" })
  }
}

app.whenReady().then(() => {
  installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS], { loadExtensionOptions: { allowFileAccess: true }, forceDownload: true })
    .then(([redux, react]) => console.log(`Added Extensions:  ${redux.name}, ${react.name}`))
    .catch((err) => console.log('An error occurred: ', err));
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  createWindow();

  app.on("activate", function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  const entry = new Entry();
  // enregistrer les points d'accès depuis le processus du renderer
  entry.register(ipcMain);
});

app.on('before-quit', () => {
  Project.flushAll(); // flush all opened projects
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
