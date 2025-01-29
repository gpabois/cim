import { Adresse, adresseSchema, defaultAdresse } from "./adresse"
import { Contact, contactSchema } from "./contact"
import { ServiceTypes } from "./services"
import { EntityTypes } from "."
import * as yup from 'yup'

export interface AiotTypes extends EntityTypes<
  string,
  AiotCreation,
  AiotData,
  AiotFields
>{}

export interface AiotFields {
  nom: string,
  codeAiot: string,
  lienGunEnv?: string,
  adresse: Adresse,
  adresseAdministrative?: Adresse,
  équipe: Array<Contact>,  
  serviceId?: ServiceTypes['id']
}

export const aiotFieldsSchema = yup.object({
  nom: yup.string().required(),
  codeAiot: yup.string().required(),
  équipe: yup.array(contactSchema),
  adresse: adresseSchema
})

export interface AiotData extends AiotFields {
  service?: ServiceTypes['data'],
  département: string
}

export interface AiotCreation extends AiotFields {}
export const aiotCreationSchema = aiotFieldsSchema;

export interface AiotInsert extends AiotFields {}

export function defaultAiotCreation(): AiotCreation {
    return {
        nom: "",
        codeAiot: "",
        équipe: [],
        adresse: defaultAdresse(),
        serviceId: ""
    }
}