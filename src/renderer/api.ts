import { ProjectId } from "@shared/model";
import { AiotTypes } from "@shared/model/aiots";
import { Contact } from "@shared/model/contact";
import { ControleTypes } from "@shared/model/controle";
import { EntityTypes } from "@shared/model/index";
import { OrganismeDeControleTypes } from "@shared/model/organismes-de-controle";
import { ServiceTypes } from "@shared/model/services";
import { Filter, UpdatorBuilder } from "@shared/database/query";
import { Crud } from "@shared/types";

function registerCrud<
  Types extends EntityTypes,
  Prefix extends keyof Window['cim'] = any
>(prefix: Prefix): Crud<Types> {
  return window.cim[prefix] as any as Crud<Types>;
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
