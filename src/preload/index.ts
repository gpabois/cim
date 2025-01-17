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
    create: (project: ProjectId, nouveau: Types['creation']) => ipcRenderer.invoke(`${prefix}.new`, project, nouveau),
    list: (projectId: ProjectId, query: SerChunkQuery<Types['fields']>) => ipcRenderer.invoke(`${prefix}.list`, projectId, query),
    get: (projectId: ProjectId, id: Types['id']) => ipcRenderer.invoke(`${prefix}.get`, projectId, id),
    update: (projectId: ProjectId, predicate: Filter<Types['fields']>, updator: Updator<Types['fields']>) => ipcRenderer.invoke(`${prefix}.update`, projectId, predicate, updator)
  }
}

contextBridge.exposeInMainWorld('cim', {
    template: {
      generateAndSave<T>(project: ProjectId, name: string, data: T) {
        return ipcRenderer.invoke('cim.template.generateAndSave', project, name, data)
      }
    },
    services: {
      ...registerCrud<ServiceTypes>('cim.services')
    },
    project: {
        open: (): Promise<ProjectId> => ipcRenderer.invoke('cim.project.open'),
        new: (): Promise<ProjectId> => ipcRenderer.invoke('cim.project.new'),
    },
    aiots: {
      ...registerCrud<AiotTypes>("cim.aiots")
    },
    controles: {
      ...registerCrud<ControleTypes>("cim.controles")
    },
    organismeDeControles: {
      ...registerCrud<OrganismeDeControleTypes>("cim.organismesDeControle")
    }
})