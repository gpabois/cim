import { EntityTypes } from ".";
import { Contact, contactSchema } from "./contact";
import * as yup from 'yup';

export interface ServiceTypes extends EntityTypes<string, ServiceCreation, ServiceData, ServiceFields> {};

export interface ServiceFields {
    nom: string,
    équipe: Array<Contact>
}

export const serviceFieldsSchema = yup.object({
  nom: yup.string().required(),
  équipe: yup.array(contactSchema)
});

export type ServiceCreation = ServiceFields;
export const serviceCreationSchema = serviceFieldsSchema;

export type ServiceData = ServiceFields & {id: ServiceTypes['id']};

export function defaultServiceCreation() {
  return {
    nom: "", 
    équipe: []
  }
}