import { ProjectId } from "@interface/model";
import { AiotTypes } from "@interface/model/aiots";
import { Contact } from "@interface/model/contact";
import { ControleTypes } from "@interface/model/controle";
import { EntityTypes } from "@interface/model/index";
import { OrganismeDeControleTypes } from "@interface/model/organismes_de_controle";
import { ServiceTypes } from "@interface/model/services";
import { Filter, UpdatorBuilder } from "@interface/query";
import { Crud } from "@interface/types";

function registerCrud<
  Types extends EntityTypes,
  Prefix extends keyof Window['cim'] = any
>(prefix: Prefix): Crud<Types> {
  return window.cim[prefix] as Crud<Types>;
}

const aiotsCrud = registerCrud<AiotTypes>('aiots');

export default {
  aiots: {
    async addContact(projectId: ProjectId, query: Filter<AiotTypes['fields']>, contact: Contact): Promise<void> {
      let updator = new UpdatorBuilder<AiotTypes['fields']>().add('équipe', contact).build();
      await aiotsCrud.update(projectId, query, updator)
    },
    async updateContact(projectId: ProjectId, query: Filter<AiotTypes['fields']>, index: number, contact: Contact): Promise<void> {
      let updator = new UpdatorBuilder<AiotTypes['fields']>().setArrayElement('équipe', index, contact).build();
      await aiotsCrud.update(projectId, query, updator)
    },
    async removeContact(projectId: ProjectId, query: Filter<AiotTypes['fields']>, contactId: number): Promise<void> {
      let updator = new UpdatorBuilder<AiotTypes['fields']>().removeArrayElementAt('équipe', contactId).build();
      await aiotsCrud.update(projectId, query, updator)
    },
    ...aiotsCrud
  },
  services: registerCrud<ServiceTypes>('services'),
  organismesDeControle: registerCrud<OrganismeDeControleTypes>('organismesDeControle'),
  controles: registerCrud<ControleTypes>('controles'),
  template: {
    async generateAndSave<T>(project: ProjectId, name: string, data: T): Promise<void> {
      await window.cim.template.generateAndSave(project, name, data)
    }
  }
}
