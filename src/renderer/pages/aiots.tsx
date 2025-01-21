import { OptionGuard } from "@app/components/option";
import { Link, useNavigate } from "react-router";
import { AiotCreationForm } from "@app/components/forms/aiot";
import { guardCurrentProject } from "@app/guards/project";
import { useParams } from "react-router";
import { groupby, imap, sorted } from "itertools";
import { DescriptionList } from "@app/components/descriptionList";
import { StackedList } from "@app/components/stackedList";
import { Breadcrumbs } from "@app/components/breadcrumbs";
import { AiotCreation, AiotData, AiotTypes, defaultAiotCreation } from "@interface/model/aiots";
import api from "@app/api";

import { UpdatorBuilder } from "@interface/query";
import { EquipeDetails } from "@app/components/équipe";
import { Contact } from "@interface/model/contact";
import { useAsync } from "@app/hooks";
import { AsyncPending, AsyncResolved } from "@app/components/async";

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
          {controles.map(controle => controle.kind)}
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

  return <div className="p-2">
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
            <Breadcrumbs>
              <Link to="/">Home</Link>
              <Link to="/aiots">AIOTS</Link>
              <span>{aiot.nom}</span>
            </Breadcrumbs>
            <DescriptionList>
              {{
                title: aiot.nom,
                description: aiot.codeAiot,
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
            <h2>Contrôles</h2>
            <AiotControles aiot={aiot} />
          </>}
        </OptionGuard>
      }
    </AsyncResolved>
  </div>
}

export function AiotsList() {
  const {id: projectId} = guardCurrentProject();

  const promiseFn = async ({ projectId }) => {
    const promise = api.aiots.list(projectId, {});
    return await promise;
  };

  const state = useAsync(promiseFn, {projectId});

  return <div className="p-2">
    <Breadcrumbs>
      <Link to="/">Home</Link>
      <span>AIOTS</span>
    </Breadcrumbs>
    <div className="mb-2">
      <Link to="/aiots/create">Nouvel AIOT</Link>
    </div>
    <AsyncResolved state={state}>
      {aiots =>
        <StackedList>
          {aiots.map(aiot => ({
            key: aiot.codeAiot,
            content: <Link to={`/aiots/${aiot.codeAiot}`}>{aiot.nom}</Link>,
            subcontent: <>{aiot.adresse.lines.join(', ')}, {aiot.adresse.commune}, {aiot.adresse.codePostal}</>
          }))}
        </StackedList>
      } 
    </AsyncResolved>
  </div>
}
