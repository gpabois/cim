import {contextBridge, ipcRenderer } from 'electron';
import { Filter, SerChunkQuery, Updator } from '@shared/database/query';
import { Crud } from '@shared/types';
import { EntityTypes } from '@shared/model/index';
import { ProjectId } from '@shared/model';
import { AiotTypes } from '@shared/model/aiots';
import { ControleTypes } from '@shared/model/controle';
import { OrganismeDeControleTypes } from '@shared/model/organismes-de-controle';
import { ServiceTypes } from '@shared/model/services';
import { ICimAPI } from '@shared/bridge';

export function registerCrud<Types extends EntityTypes>(prefix: string): Crud<Types> {
 return {
    create: (project: ProjectId, nouveau: Types['creation']) => ipcRenderer.invoke(`cim.${prefix}.create`, project, nouveau),
    list: (projectId: ProjectId, query: SerChunkQuery<Types['fields']>) => ipcRenderer.invoke(`cim.${prefix}.list`, projectId, query),
    remove: (projectId: ProjectId, query: Filter<Types["fields"]>) => ipcRenderer.invoke(`cim.${prefix}.remove`, projectId, query),
    get: async (projectId: ProjectId, id: Types['id']) => {
      return await ipcRenderer.invoke(`cim.${prefix}.get`, projectId, id);
    },
    update: (projectId: ProjectId, predicate: Filter<Types['fields']>, updator: Updator<Types['fields']>) => ipcRenderer.invoke(`cim.${prefix}.update`, projectId, predicate, updator)
  }
}

/// Pont entre le renderer et le main process
const cimBridge: ICimAPI = {
  ui: {
    async openWindow(url: string): Promise<void> {
      await ipcRenderer.invoke('cim.ui.openWindow', url)
    },
    closeApp: () => ipcRenderer.invoke("cim.ui.closeApp"),
    maximizeMainWindow: () => ipcRenderer.invoke("cim.ui.maximizeMainWindow"),
    minimizeMainWindow: () => ipcRenderer.invoke("cim.ui.minimizeMainWindow")
  },
  template: {
    generateAndSave<T>(project: ProjectId, name: string, data: T) {
      return ipcRenderer.invoke('cim.template.generateAndSave', project, name, data)
    }
  },
  services: {
    ...registerCrud<ServiceTypes>('services')
  },
  project: {
      open: (): Promise<ProjectId> => ipcRenderer.invoke('cim.project.open'),
      new: (): Promise<ProjectId> => ipcRenderer.invoke('cim.project.new'),
      save: (projectId: ProjectId): Promise<void> => ipcRenderer.invoke("cim.project.save", projectId)
  },
  aiots: {
    ...registerCrud<AiotTypes>("aiots")
  },
  contrôles: {
    ...registerCrud<ControleTypes>("contrôles")
  },
  organismesDeContrôle: {
    ...registerCrud<OrganismeDeControleTypes>("organismesDeContrôle")
  }
};

contextBridge.exposeInMainWorld('cim', cimBridge)