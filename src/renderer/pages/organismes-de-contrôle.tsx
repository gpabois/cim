import api from "@renderer/api";
import { AsyncResolved } from "@renderer/components/async";
import { Breadcrumbs } from "@renderer/components/breadcrumbs";
import { OrganismeDeControleCreationForm } from "@renderer/components/forms/organisme-de-contrôle";
import { StackedList } from "@renderer/components/stacked-list";
import { guardCurrentProject } from "@renderer/guards/project";
import { useAsync } from "@renderer/hooks";
import { defaultOrganismeDeControleCreation, OrganismeDeControleCreation } from "@shared/model/organismes-de-controle";
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

  return <div className="p-2">
    <Breadcrumbs>
      <Link to="/">{t("Home")}</Link>
      <Link to="/organismesDeControle">{t("OrganismesDeControle")}</Link>
    </Breadcrumbs>
    <OrganismeDeControleCreationForm defaultValues={defaultOrganismeDeControleCreation()} onSubmit={create} />
  </div>
}

export function OrganismesDeControleList() {
  const { id: projectId } = guardCurrentProject();
  const { t } = useTranslation();

  const promiseFn = async ({ projectId }) => {
    return await api.organismesDeControle.list(projectId, {});
  }

  const state = useAsync(promiseFn, {projectId});

  return <div className="p-2">
    <Breadcrumbs>
      <Link to="/">{t("Home")}</Link>
      <span>{t("OrganismesDeControle")}</span>
    </Breadcrumbs>
    <div className="mb-2">
      <Link to="/organismesDeControle/create">Nouvel organisme de contrôle</Link>
    </div>
    <AsyncResolved state={state}>
      {organismesDeControle =>
        <StackedList>
          {organismesDeControle.map(organismeDeControle => ({
            key: organismeDeControle.id,
            content: <Link to={`/organismesDeControle/${organismeDeControle.id}`} > {organismeDeControle.nom}</Link>
          }))}
        </StackedList>
      }
    </AsyncResolved>
  </div>
}
