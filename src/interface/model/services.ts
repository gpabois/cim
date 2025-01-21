import { EntityTypes } from ".";
import { Contact, contactSchema } from "./contact";
import * as yup from 'yup';

export interface ServiceTypes extends EntityTypes<string, ServiceCreation, ServiceData, ServiceFields> {};

export interface ServiceFields {
  id: string,
  nom: string,
  équipe: Array<Contact>
}

export const serviceFieldsSchema = yup.object({
  nom: yup.string().required(),
  équipe: yup.array(contactSchema)
});

export type ServiceCreation = Omit<ServiceFields, "id">;
export const serviceCreationSchema = serviceFieldsSchema;

export type ServiceData = ServiceFields;

export function defaultServiceCreation() {
  return {
    nom: "", 
    équipe: []
  }
}