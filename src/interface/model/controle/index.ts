import { EntityTypes } from "..";
import { Contact } from "../contact";
import { OrganismeDeControleTypes } from "../organismes_de_controle";
import { ControleAirCreation, ControleAirData, ControleAirFields } from "./air";

export interface ControleTypes extends EntityTypes<string, ControleCreation, ControleData, ControleFields>{}

export type ControleCreation = ControleAirCreation;
export type ControleData = ControleAirData;
export type ControleFields = ControleAirFields;

export interface BaseControleFields {
  id: string,
  année: number,
  codeAiot: string,
  kind: "eau" | "air",
  dateNotificationExploitant?: string,
  dateRéceptionChoixExploitant?: string,
  dateMandatement?: string,
  dateRéalisation?: string,
  dateRapportReçu?: string,
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

