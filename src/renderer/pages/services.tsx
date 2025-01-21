import api from "@app/api";
import { AsyncResolved } from "@app/components/async";
import { Breadcrumbs } from "@app/components/breadcrumbs";
import { DescriptionList } from "@app/components/descriptionList";
import { ServiceCreationForm } from "@app/components/forms/service";
import { OptionGuard } from "@app/components/option";
import { StackedList } from "@app/components/stackedList";
import { EquipeDetails } from "@app/components/équipe";
import { guardCurrentProject } from "@app/guards/project";
import { useAsync } from "@app/hooks";
import { defaultServiceCreation, ServiceCreation, ServiceTypes } from "@interface/model/services";
import { UpdatorBuilder } from "@interface/query";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { Link, useNavigate } from "react-router";

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

  return <div className="p-2">
    <AsyncResolved state={state}>
      {maybeService =>
        <OptionGuard value={maybeService} redirect="/404">
          {service => <>
            <Breadcrumbs>
              <Link to="/">{t("Home")}</Link>
              <Link to="/services">{t("Services")}</Link>
              <span>{service.nom}</span>
            </Breadcrumbs>
            <DescriptionList>
              {{
                title: service.nom,
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

          </>}
        </OptionGuard>
      }
    </AsyncResolved>
  </div>
}


export function ServicesList() {
  const { id: projectId } = guardCurrentProject();
  const { t } = useTranslation();

  const promiseFn = async ({ projectId }) => {
    return await api.services.list(projectId, {});
  }

  const state = useAsync(promiseFn, {projectId});

  return <div className="p-2">
    <Breadcrumbs>
      <Link to="/">{t("Home")}</Link>
      <span>{t("Services")}</span>
    </Breadcrumbs>
    <div>
      <Link to="/services/create">Nouveau service</Link>
    </div>
    <AsyncResolved state={state}>
      {services => 
        <StackedList>
          {services.map(service => ({
            key: service.id,
            content: <Link to={`/services/${service.id}`}>{service.id}</Link>
          }))}
        </StackedList>
      }
    </AsyncResolved>
  </div>
}
