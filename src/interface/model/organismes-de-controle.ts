import { EntityTypes } from ".";
import { Adresse, defaultAdresse } from "./adresse";
import { Contact } from "./contact";

export interface OrganismeDeControleTypes extends EntityTypes<string, OrganismeDeControleCreation, OrganismeDeControleData, OrganismeDeControleFields>{}

export interface OrganismeDeControleFields {
  id: string,
  adresse: Adresse,
  nom: string,
  équipe: Array<Contact>
}

export type OrganismeDeControleData = OrganismeDeControleFields;

export type OrganismeDeControleCreation = Omit<OrganismeDeControleFields, "id">;

export function defaultOrganismeDeControleCreation(): OrganismeDeControleCreation {
  return {
      adresse: defaultAdresse(),
      nom: "",
      équipe: []
  }
}
