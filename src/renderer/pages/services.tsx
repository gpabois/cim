import api from "@app/api";
import { Breadcrumbs } from "@app/components/breadcrumbs";
import { DescriptionList } from "@app/components/descriptionList";
import { ServiceCreationForm } from "@app/components/forms/service";
import { OptionGuard } from "@app/components/option";
import { StackedList } from "@app/components/stackedList";
import { guardCurrentProject } from "@app/guards/project";
import { defaultServiceCreation, ServiceCreation, ServiceTypes } from "@interface/model/services";
import { Optional } from "@interface/option";
import { Async, DeferFn, IfFulfilled, PromiseFn } from "react-async";
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

  const promiseFn: PromiseFn<{ data: Optional<ServiceTypes["data"]> }> = async ({ projectId, id }, _) => {
    return { data: await api.services.get(projectId, id) }
  }

  const deferFn: DeferFn<{ data: Optional<ServiceTypes["data"]> }> = async ([projectId, id]) => {
    return { data: await api.services.get(projectId, id) }
  }


  return <Async deferFn={deferFn} promiseFn={promiseFn} projectId={projectId} id={id}>
    {state =>
      <IfFulfilled state={state}>
        {({ data: maybeService }) =>
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
                  fields: []
                }}
              </DescriptionList>

            </>}
          </OptionGuard>
        }
      </IfFulfilled>
    }
  </Async>
}


export function ServicesList() {
  const { id: projectId } = guardCurrentProject();
  const { t } = useTranslation();

  const promiseFn: PromiseFn<Array<ServiceTypes["data"]>> = async ({ projectId }, _) => {
    return await api.services.list(projectId, {});
  }

  return <div className="p-2">
    <Breadcrumbs>
      <Link to="/">{t("Home")}</Link>
      <span>{t("Services")}</span>
    </Breadcrumbs>
    <div>
      <Link to="/services/create">Nouveau service</Link>
    </div>
    <Async promiseFn={promiseFn} projectId={projectId}>
      {state =>
        <IfFulfilled state={state}>
          {services => <StackedList>
            {services.map(service => ({
              key: service.id,
              content: <Link to={`/services/${service.id}`}>{service.id}</Link>
            }))}
          </StackedList>}
        </IfFulfilled>
      }
    </Async>
  </div>
}
