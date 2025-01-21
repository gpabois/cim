import { is } from '@electron-toolkit/utils'
import { installExtension, REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import { Project } from "./project";
import { Filter, SerChunkQuery, Updator } from "@interface/query";

import fs from 'node:fs/promises'
import { isSome, None } from "@interface/option";
import { EntityTypes } from "@interface/model/index";
import { AiotTypes } from "@interface/model/aiots";
import * as R from 'ramda';
import { ProjectId } from '@interface/model';
import { ServiceTypes } from '@interface/model/services';
import snowflake from './snowflake';
import { ControleTypes } from '@interface/model/controle';
import { OrganismeDeControleTypes } from '@interface/model/organismes_de_controle';

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

export interface CrudHandlers<E extends EntityTypes> {
  prefix: string,
  colName: string,
  id: string,
  onCreate: (project: Project, creation: E['creation']) => Promise<E['fields']>,
  hydrateData: (project: Project, fields: E['fields']) => Promise<E['data']>
}

function registerCrud<Types extends EntityTypes>(args: CrudHandlers<Types>) {
  ipcMain.handle(`cim.${args.prefix}.create`, async (_event: any, id: ProjectId, creation: Types['creation']) => {
    let project = Project.get(id)!;
    let col = project?.db.getCollection<Types['fields']>(args.colName);
    let insert = await args.onCreate(project, creation);
    col?.insert(insert);
    return insert[args.id];
  });

  ipcMain.handle(`cim.${args.prefix}.list`, async (_event: any, projectId: ProjectId, query: SerChunkQuery<Types['fields']>) => {
    let project = Project.get(projectId)!;
    let col = project?.db.getCollection<Types['fields']>(args.colName)!;
    let rows = [...col.findBy(query)];
    return await Promise.all(rows?.map(R.partial(args.hydrateData, [project])));
  });

  ipcMain.handle(`cim.${args.prefix}.get`, async (_event: any, projectId: ProjectId, id: string) => {
    let project = Project.get(projectId)!;
    let col = project?.db.getCollection<Types['fields']>(args.colName)!;
    let maybeEntity = await col.findOneBy({ [args.id]: id });
    if (isSome(maybeEntity)) {
      return await args.hydrateData(project, maybeEntity)
    }
    return None;
  });

  ipcMain.handle(`cim.${args.prefix}.update`, async (_event: any, projectId: ProjectId, filter: Filter<Types['fields']>, updator: Updator<Types['fields']>) => {
    let project = Project.get(projectId);
    let col = project?.db.getCollection<Types['fields']>(args.colName)!;
    await col.update(filter, updator);
  });
}

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

  ipcMain.handle('cim.project.new', async () => {
    let dir = dialog.showSaveDialogSync({
      title: "Répertoire racine",
      message: "Créer le répertoire racine",
      properties: ["createDirectory"]
    });

    if (dir.length == 0) {
      return undefined;
    }

    return await Project.create(dir);
  });

  ipcMain.handle('cim.project.open', async () => {
    let dir = dialog.showOpenDialogSync({
      title: "Répertoire racine",
      message: "Créer le répertoire racine",
      properties: ["openDirectory"]
    });

    if (dir?.length || 0 > 0) {
      return await Project.open(dir![0])
    }

    return undefined;
  });

  ipcMain.handle('cim.template.generateAndSave', async (_event: any, id: ProjectId, name: string, data: any) => {
    let filepath = dialog.showSaveDialogSync({
      title: "Document généré",
      message: "Emplacement où sera stocké le document ainsi généré",
      filters: [{ extensions: ["docx"], name: "Document Word" }]
    });

    let project = Project.get(id);
    const bytes = await project?.generateDocumentFromTemplate(name, data);

    if (isSome(bytes)) {
      await fs.writeFile(filepath, bytes);
    }

  })

  const hydrateAiotData = async (_: Project, aiot: AiotTypes['fields']): Promise<AiotTypes['data']> => {
    return {
      ...aiot,
      département: aiot.adresse.codePostal.slice(0, 2)
    }
  }

  const hydrateControleData = async (project: Project, controle: ControleTypes['fields']): Promise<ControleTypes['data']> => {
    const aiots = project.db.getCollection<AiotTypes['fields']>('aiots');
    const aiot = await hydrateAiotData(
      project,
      await aiots.findOneBy({codeAiot: controle.codeAiot})!
    );

    return {
      ...controle, 
      nom: `${controle.année} - ${aiot.nom} (#${aiot.codeAiot})`,
      aiot
    }
  }

  registerCrud<AiotTypes>({
    id: "codeAiot",
    prefix: "aiots",
    colName: "aiots",
    onCreate: async (_, creation) => creation,
    hydrateData: hydrateAiotData
  });

  registerCrud<ServiceTypes>({
    id: "id",
    prefix: "services",
    colName: "services",
    async onCreate(_, creation) {
      const id = `${snowflake.nextId()}`;
      return {
        id,
        ...creation
      }
    },
    //@ts-ignore
    async hydrateData(_, fields) {
      return fields
    },
  });

  registerCrud<ControleTypes>({
    id: "id",
    prefix: "controles",
    colName: "contrôles",
    async onCreate(_, creation) {
      const id = `${snowflake.nextId()}`;
      return {
        ...{
          id, 
          points: []
        },
        ...creation,

      }
    },
    hydrateData: hydrateControleData,
  });

  registerCrud<OrganismeDeControleTypes>({
    id: "id",
    prefix: "organismesDeControle",
    colName: "organismesDeControle",
    async onCreate(_, creation) {
      const id = `${snowflake.nextId()}`;
      return {
        id, ...creation
      }
    },
    async hydrateData(_, fields) {
      return fields
    },
  });


});

app.on('before-quit', () => {
  Project.flushAll(); // flush all opened projects
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
