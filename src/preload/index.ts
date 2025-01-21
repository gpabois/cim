import {contextBridge, ipcRenderer } from 'electron';
import { Filter, SerChunkQuery, Updator } from '@interface/query';
import { Crud } from '@interface/types';
import { EntityTypes } from '@interface/model/index';
import { ProjectId } from '@interface/model';
import { AiotTypes } from '@interface/model/aiots';
import { ControleTypes } from '@interface/model/controle';
import { OrganismeDeControleTypes } from '@interface/model/organismes_de_controle';
import { ServiceTypes } from '@interface/model/services';

export function registerCrud<Types extends EntityTypes>(prefix: string): Crud<Types> {
 return {
    create: (project: ProjectId, nouveau: Types['creation']) => ipcRenderer.invoke(`cim.${prefix}.create`, project, nouveau),
    list: (projectId: ProjectId, query: SerChunkQuery<Types['fields']>) => ipcRenderer.invoke(`cim.${prefix}.list`, projectId, query),
    get: async (projectId: ProjectId, id: Types['id']) => {
      return await ipcRenderer.invoke(`cim.${prefix}.get`, projectId, id);
    },
    update: (projectId: ProjectId, predicate: Filter<Types['fields']>, updator: Updator<Types['fields']>) => ipcRenderer.invoke(`cim.${prefix}.update`, projectId, predicate, updator)
  }
}

contextBridge.exposeInMainWorld('cim', {
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
    },
    aiots: {
      ...registerCrud<AiotTypes>("aiots")
    },
    controles: {
      ...registerCrud<ControleTypes>("controles")
    },
    organismeDeControles: {
      ...registerCrud<OrganismeDeControleTypes>("organismesDeControle")
    }
})