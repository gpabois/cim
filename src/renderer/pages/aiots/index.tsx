import { OptionGuard } from "@renderer/components/option";
import { Link, useNavigate } from "react-router";
import { AiotCreationForm } from "@renderer/components/forms/aiot";
import { guardCurrentProject } from "@renderer/guards/project";
import { useParams } from "react-router";
import { groupby, imap, sorted } from "itertools";
import { DescriptionList } from "@renderer/components/description-list";
import { Breadcrumbs } from "@renderer/components/breadcrumbs";
import { AiotCreation, AiotData, AiotTypes, defaultAiotCreation } from "@shared/model/aiots";
import api from "@renderer/api";

import { UpdatorBuilder } from "@shared/database/query";
import { EquipeDetails } from "@renderer/components/équipe";
import { Contact } from "@shared/model/contact";
import { useAsync } from "@renderer/hooks";
import { AsyncPending, AsyncResolved } from "@renderer/components/async";
import { GUNEnvIcon } from "@renderer/components/icons";
import { Page } from "@renderer/components/page";

export * from './list'

/// Créée un nouvel AIOT.
export function CreateAiot() {
  const navigate = useNavigate();
  const currentProject = guardCurrentProject();

  const create = async (form: AiotCreation) => {
    console.log(form);
    await api.aiots.create(currentProject.id, form);
    navigate(`/aiots/${form.codeAiot}`);
  }

  return <div className="p-2">
    <Breadcrumbs>
      <Link to="/">Home</Link>
      <Link to="/aiots">AIOTS</Link>
      <span>Nouveau</span>
    </Breadcrumbs>
    <div className="space-y-2">
      <AiotCreationForm defaultValues={defaultAiotCreation()} onSubmit={create} />
    </div>
  </div>
}

export interface AiotControles {
  aiot: AiotData
}

export function AiotControles(props: AiotControles) {
  const project = guardCurrentProject();

  const fetch = async ({ project, codeAiot }) => {
    const controles = await api.controles.list(project.id, {
      filter: {
        codeAiot
      }
    });

    let groups = imap(groupby(controles, (controle) => controle.année), ([key, items]) => ({ key, items: [...items] }));
    let perYear = [...sorted(groups, ((group) => group.key), true)];
    return perYear
  }

  const state = useAsync(fetch, {
    project,
    codeAiot: props.aiot.codeAiot
  })

  return <>
    <AsyncResolved state={state}>
      {controlesPerYear =>
        controlesPerYear.map(({ key: année, items: controles }) => <>
          <h3>{année}</h3>
          {controles.map(controle => <Link to={`/contrôles/${controle.id}`}>{controle.nom}</Link>)}
        </>)
      }
    </AsyncResolved>
  </>
}

export function AiotDetails() {
  const { codeAiot } = useParams();
  const { id: projectId } = guardCurrentProject();

  const promiseFn = async ({ projectId, codeAiot }) => {
    return await api.aiots.get(projectId, codeAiot);
  };

  const state = useAsync(promiseFn, {projectId, codeAiot});

  const refresh = () => state.run({projectId, codeAiot});

  const addContact = async (contact: Contact) => {
    const updator = new UpdatorBuilder<AiotTypes['fields']>().add("équipe", contact).build();
    await api.aiots.update(projectId, {codeAiot}, updator);
    await refresh();
  }

  const updateContact = async (contactId: number, contact: Contact) => {
    const updator = new UpdatorBuilder<AiotTypes['fields']>().setArrayElement("équipe", contactId, contact).build();
    await api.aiots.update(projectId, {codeAiot}, updator);
    await refresh();
  }

  const removeContact = async (contactId: number) => {
    const updator = new UpdatorBuilder<AiotTypes['fields']>().removeArrayElementAt("équipe", contactId).build();
    await api.aiots.update(projectId, {codeAiot}, updator);
    await refresh();
  }

  return <div>
    <AsyncPending state={state}>
    <Breadcrumbs>
        <Link to="/">Home</Link>
        <Link to="/aiots">AIOTS</Link>
        <span>...</span>
    </Breadcrumbs>
    </AsyncPending>
    <AsyncResolved state={state}>
      {maybeAiot =>
        <OptionGuard value={maybeAiot} redirect="/404">
          {aiot => <>
            <Page 
              breadcrumbs={
                [
                  <Link to="/">Home</Link>,
                  <Link to="/aiots">AIOTS</Link>,
                  <span>{aiot.nom}</span>
                ]
              }
              heading={
                <>
                  <span>{aiot.nom}</span>
                  <a className="cursor-pointer" onClick={() => api.ui.openWindow(aiot.lienGunEnv || `https://gunenv.din.developpement-durable.gouv.fr/aiot/?searchTerms=${aiot.codeAiot}`)}><GUNEnvIcon className="text-white"/></a>
                </>
              }
              subheading={aiot.codeAiot}
              tabs={[
                {
                  id: "infos-générales",
                  label: "Informations générales",
                  content: <DescriptionList>
                  {{
                    fields: [
                      {
                        key: "address", heading: "Adresse", content: <div className="flex flex-col">
                          {aiot.adresse.lines.map((line) => <span key={line}>{line}</span>)}
                          <span>{aiot.adresse.commune} ({aiot.adresse.codePostal})</span>
                        </div>
                      },
                      { key: "équipe", heading: "Equipe", content: <EquipeDetails 
                          équipe={aiot.équipe}
                          addContactFn={addContact}
                          removeContactFn={removeContact}
                          updateContactFn={updateContact}
                        /> 
                      }
                    ]
                  }}
                </DescriptionList>
                }, {
                  id: "contrôles",
                  label: "Contrôles",
                  content: <AiotControles aiot={aiot} />
                }
              ]}
            />
          </>}
        </OptionGuard>
      }
    </AsyncResolved>
  </div>
}

