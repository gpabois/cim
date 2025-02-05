import api from "@renderer/api";
import { AsyncResolved } from "@renderer/components/async";
import { Button } from "@renderer/components/button";
import { DescriptionList } from "@renderer/components/description-list";
import { EditableField } from "@renderer/components/form";
import { OrganismeDeControleCreationForm } from "@renderer/components/forms/organisme-de-contrôle";
import { OptionGuard } from "@renderer/components/option";
import { Page } from "@renderer/components/page";
import { StackedList } from "@renderer/components/stacked-list";
import { guardCurrentProject } from "@renderer/guards/project";
import { useAsync } from "@renderer/hooks";
import { UpdatorBuilder } from "@shared/database/query";
import { defaultOrganismeDeControleCreation, OrganismeDeControleCreation, OrganismeDeControleFields } from "@shared/model/organismes-de-controle";
import { useTranslation } from "react-i18next";
import { BiAddToQueue, BiTrash } from "react-icons/bi";
import { useParams } from "react-router";
import { Link, useNavigate } from "react-router";

export function OrganismeDeControleDetails() {
  const { t } = useTranslation();
  const {id: projectId} = guardCurrentProject();
  const {id} = useParams();
  const navigate = useNavigate();

  const promiseFn = async ({ projectId, id }) => {
    return await api.organismesDeControle.get(projectId, id);
  };

  const state = useAsync(promiseFn, {projectId, id});
  
  const updateField = <Field extends keyof NonNullable<OrganismeDeControleFields>>(field: Field) => async (value: any) => {
    const updator = new UpdatorBuilder().set(`${field}` as any, value).build();
    await api.organismesDeControle.update(projectId, {id}, updator);
    state.run({projectId, id});
  }

  const deleteOrganisme = async () => {
    await api.organismesDeControle.remove(projectId, {id});
    navigate("/organismes-de-contrôle")
  }

  return <>
    <AsyncResolved state={state}>
      {maybeOrganismeDeControle => <OptionGuard value={maybeOrganismeDeControle} redirect="/404">
        {organisme => <Page
            heading={
              <EditableField onSubmit={updateField("nom")} defaultValues={organisme.nom}>
                {organisme.nom}
              </EditableField> 
            }
            action={
              <div className="flex">
                <Button theme="danger" onClick={deleteOrganisme}><BiTrash/></Button>
              </div>
            }
            breadcrumbs={[
              <Link to="/">{t("Home")}</Link>,
              <Link to="/organismes-de-contrôle">Organismes de contrôle</Link>,
              <span>{organisme.nom}</span>
            ]}
          >
          <DescriptionList>
            {{
              fields: []
            }}
          </DescriptionList>
        </Page>}
      </OptionGuard>}
    </AsyncResolved>
  </>
}

export function CreateOrganismeDeControle() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentProject = guardCurrentProject();

  const create = function(form: OrganismeDeControleCreation) {
    api.organismesDeControle
      .create(currentProject.id, form)
      .then((id: string) => {
        navigate(`/organismes-de-contrôle/${id}`);
      })
  }

  return <Page 
      heading="Nouvel organisme de contrôle" 
      breadcrumbs={[
        <Link to="/">{t("Home")}</Link>,
        <Link to="/organismes-de-contrôle">{t("OrganismesDeControle")}</Link>,
        <span>Nouveau</span>
      ]}
    >
    <div className="py-2 px-2">
      <OrganismeDeControleCreationForm 
        defaultValues={defaultOrganismeDeControleCreation()} 
        onSubmit={create} 
      />
    </div>
  </Page>
}

export function OrganismesDeControleList() {
  const { id: projectId } = guardCurrentProject();
  const { t } = useTranslation();

  const promiseFn = async ({ projectId }) => {
    return await api.organismesDeControle.list(projectId, {});
  }

  const state = useAsync(promiseFn, {projectId});

  return <Page
    heading="Liste des organismes de contrôle"
    action={<Link to="/organismes-de-contrôle/create"><BiAddToQueue/></Link>}
    breadcrumbs={[
      <Link to="/">{t("Home")}</Link>,
      <span>{t("OrganismesDeControle")}</span>
    ]}
    >
    <AsyncResolved state={state}>
      {organismesDeControle =>
        <StackedList>
          {organismesDeControle.map(organismeDeControle => ({
            key: organismeDeControle.id,
            content: <Link to={`/organismes-de-contrôle/${organismeDeControle.id}`} > {organismeDeControle.nom}</Link>
          }))}
        </StackedList>
      }
    </AsyncResolved>
  </Page>
}
