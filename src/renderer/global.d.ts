import { AiotTypes } from "@interface/model/aiots"
import { ControleTypes } from "@interface/model/controle"
import { EntityTypes } from "@interface/model/index"
import { OrganismeDeControleTypes } from "@interface/model/organismes_de_controle"
import { ServiceTypes } from "@interface/model/services"
import { SerChunkQuery } from "@interface/query"

export interface ICimAPI {
  template: {
    generateAndSave<T>(project: ProjectId, name: string, data: T): Promise<void>
  },
  services: Crud<ServiceTypes>,
  aiots: Crud<AiotTypes>,
  organismeDeControles: Crud<OrganismeDeControleTypes>,
  controles: Crud<ControleTypes>,
  project: {
      new: () => Promise<ProjectId | undefined>,
      open: () => Promise<ProjectId | undefined>
  },
}
  
declare global {
  interface Window {
    cim: ICimAPI
  }
}