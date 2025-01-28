import { EntityTypes } from "..";
import { Contact } from "../contact";
import { OrganismeDeControleTypes } from "../organismes-de-controle";
import { ControleAirCreation, ControleAirData, ControleAirFields } from "./air";

export type ControleKind = ControleFields["kind"];

export interface ControleTypes extends EntityTypes<string, ControleCreation, ControleData, ControleFields>{}

export type ControleCreation = ControleAirCreation;
export type ControleData = ControleAirData;
export type ControleFields = ControleAirFields;

export interface RéceptionConforme {
  résultat: "choix-conforme",
  dateRéception: string,
}
export interface RéceptionNonConforme {
  résultat: "choix-non-conforme",
  dateRéception: string,
}
export interface AbsenceDeRéponse {
  résultat: "absence-de-réponse",
  commentaire: string
}

export type Selection = RéceptionConforme | RéceptionNonConforme | AbsenceDeRéponse;
export interface Notification {
  dateEnvoi: string
}
export interface Mandatement {
  dateEnvoi?: string,
  dateRéceptionCommande?: string,
  commentaires: string
}
export interface Exécution {
  dateExecution?: string
}

export interface BaseControleFields {
  id: string,
  année: number,
  codeAiot: string,
  kind: "eau" | "air",
  notification?: Notification,
  sélection?: Selection,
  mandatement?: Mandatement,
  exécution?: Exécution,
  référencesRéglementaires: Array<string>,
  périodeSouhaitée: string,
  préconisations: string,
  contacts: Array<Contact>,
  inspection?: {
      serviceId: string,
      inspecteur?: Contact,
      souhaiteParticiperAuControle: boolean,
  },
  organismeDeControle?: {
    id: OrganismeDeControleTypes['id'],
    contact: Array<Contact>
  }
}

export type BaseControleCreation = Omit<BaseControleFields, "id">;

export function defaultBaseControleCreation(): BaseControleCreation {
  return {
    année:  new Date().getFullYear(),
    codeAiot: "",
    kind: "air",
    référencesRéglementaires: [],
    périodeSouhaitée: "",
    préconisations:"",
    contacts: []
  }
}

