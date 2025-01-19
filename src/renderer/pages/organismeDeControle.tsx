import api from "@app/api";
import { Breadcrumbs } from "@app/components/breadcrumbs";
import { OrganismeDeControleCreationForm } from "@app/components/forms/organismeDeControle";
import { StackedList } from "@app/components/stackedList";
import { guardCurrentProject } from "@app/guards/project";
import { defaultOrganismeDeControleCreation, OrganismeDeControleCreation, OrganismeDeControleTypes } from "@interface/model/organismes_de_controle";
import { Async, IfFulfilled, PromiseFn } from "react-async";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";

export function CreateOrganismeDeControle() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentProject = guardCurrentProject();

  const create = function(form: OrganismeDeControleCreation) {
    api.organismesDeControle
      .create(currentProject.id, form)
      .then((id: string) => {
        navigate(`/organismesDeControle/${id}`);
      })
  }

  return <>
    <Breadcrumbs>
      <Link to="/">{t("Home")}</Link>
      <Link to="/organismesDeControle">{t("OrganismesDeControle")}</Link>
    </Breadcrumbs>
    <OrganismeDeControleCreationForm defaultValues={defaultOrganismeDeControleCreation()} onSubmit={create} />
  </>
}

export function OrganismesDeControleList() {
  const { id: projectId } = guardCurrentProject();
  const { t } = useTranslation();

  const promiseFn: PromiseFn<Array<OrganismeDeControleTypes["data"]>> = async ({ projectId }, _) => {
    return await api.organismesDeControle.list(projectId, {});
  }

  return <div className="p-2">
    <Breadcrumbs>
      <Link to="/">{t("Home")}</Link>
      <span>{t("OrganismesDeControle")}</span>
    </Breadcrumbs>
    <Async promiseFn={promiseFn} projectId={projectId}>
      {state =>
        <IfFulfilled state={state}>
          {organismesDeControle =>
            <StackedList>
              {organismesDeControle.map(organismeDeControle => ({
                key: organismeDeControle.id,
                content: <Link to={`/organismesDeControle/${organismeDeControle.id}`} > {organismeDeControle.nom}</Link>
              }))}
            </StackedList>
          }
        </IfFulfilled>
      }
    </Async>
  </div>
}
