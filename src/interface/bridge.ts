import { ProjectId } from "./model"
import { AiotTypes } from "./model/aiots"
import { ControleTypes } from "./model/controle"
import { OrganismeDeControleTypes } from "./model/organismes-de-controle"
import { ServiceTypes } from "./model/services"
import { Optional } from "./option"
import { Crud } from "./types"

/// Interface entre le renderer et le main (exposé par preload)
export interface ICimAPI {
  ui: {
    openWindow(url: string): Promise<void>
    closeApp(): Promise<void>
    minimizeMainWindow(): Promise<void>
    maximizeMainWindow(): Promise<void>
  },
  template: {
    generateAndSave<T>(project: ProjectId, name: string, data: T): Promise<void>
  },
  services: Crud<ServiceTypes>,
  aiots: Crud<AiotTypes>,
  organismesDeContrôle: Crud<OrganismeDeControleTypes>,
  contrôles: Crud<ControleTypes>,
  project: {
      new: () => Promise<Optional<ProjectId>>,
      open: () => Promise<Optional<ProjectId>>,
      save: (projectId: ProjectId) => Promise<void>
  },
}