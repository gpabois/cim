import api from "@renderer/api";
import { AsyncResolved } from "@renderer/components/async";
import { Breadcrumbs } from "@renderer/components/breadcrumbs";
import { DescriptionList } from "@renderer/components/description-list";
import { ServiceCreationForm } from "@renderer/components/forms/service";
import { OptionGuard } from "@renderer/components/option";
import { StackedList } from "@renderer/components/stacked-list";
import { EquipeDetails } from "@renderer/components/équipe";
import { guardCurrentProject } from "@renderer/guards/project";
import { useAsync } from "@renderer/hooks";
import { defaultServiceCreation, ServiceCreation, ServiceTypes } from "@shared/model/services";
import { UpdatorBuilder } from "@shared/database/query";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { Link, useNavigate } from "react-router";
import { Page } from "@renderer/components/page";
import { BiAddToQueue } from "react-icons/bi";

/// Créée un nouveau service.
export function CreateService() {
  const navigate = useNavigate();
  const currentProject = guardCurrentProject();

  const create = async (form: ServiceCreation) => {
    const id = await api.services.create(currentProject.id, form);
    navigate(`/services/${id}`);
  }

  return <div className="p-2">
    <Breadcrumbs>
      <Link to="/">Accueil</Link>
      <Link to="/services">Services</Link>
      <span>Nouveau</span>
    </Breadcrumbs>
    <div className="space-y-2">
      <ServiceCreationForm defaultValues={defaultServiceCreation()} onSubmit={create} />
    </div>
  </div>
}

/// Récupère les détails d'un service
export function ServiceDetails() {
  const { id: projectId } = guardCurrentProject();
  const { id } = useParams();
  const { t } = useTranslation();

  const promiseFn = async ({ projectId, id }) => {
    return await api.services.get(projectId, id) 
  }

  const refresh = async () => {
    await state.run({projectId, id});
  }

  const state = useAsync(promiseFn, {projectId, id});

  const addContact = async (contact) => {
    const updator = new UpdatorBuilder<ServiceTypes['fields']>().add("équipe", contact).build();
    await api.services.update(projectId, {id}, updator);
    await refresh();
  }

  const updateContact = async (contactId, contact) => {
    const updator = new UpdatorBuilder<ServiceTypes['fields']>().setArrayElement("équipe", contactId, contact).build();
    await api.services.update(projectId, {id}, updator);
    await refresh();
  }

  const removeContact = async (contactId) => {
    const updator = new UpdatorBuilder<ServiceTypes['fields']>().removeArrayElementAt("équipe", contactId).build();
    await api.services.update(projectId, {id}, updator);
    await refresh();
  }
  
  return <AsyncResolved state={state}>
    {maybeService =>
      <OptionGuard value={maybeService} redirect="/404">
        {service => <>
          <Page
            heading={service.nom}
            breadcrumbs={[
              <Link to="/">{t("Home")}</Link>,
              <Link to="/services">{t("Services")}</Link>,
              <span>{service.nom}</span>
            ]}
          >
            <DescriptionList>
              {{
                fields: [{ 
                  key: "équipe", 
                  heading: "Equipe", 
                  content: <EquipeDetails 
                      équipe={service.équipe} 
                      addContactFn={addContact} 
                      updateContactFn={updateContact}
                      removeContactFn={removeContact}
                    /> 
                }]
              }}
            </DescriptionList>
          </Page>
        </>}
      </OptionGuard>
    }
  </AsyncResolved>
}


export function ServicesList() {
  const { id: projectId } = guardCurrentProject();
  const { t } = useTranslation();

  const promiseFn = async ({ projectId }) => {
    return await api.services.list(projectId, {});
  }

  const state = useAsync(promiseFn, {projectId});

  return <Page 
      heading="Liste des services de l'inspection"
      breadcrumbs={[
        <Link to="/">{t("Home")}</Link>,
        <span>{t("Services")}</span>
      ]}
      action={<Link to="/services/create"><BiAddToQueue/></Link>}
    >
    <AsyncResolved state={state}>
      {services => 
        <StackedList>
          {services.map(service => ({
            key: service.id,
            content: <Link to={`/services/${service.id}`}>{service.nom}</Link>
          }))}
        </StackedList>
      }
    </AsyncResolved>
  </Page>
}
