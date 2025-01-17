import { Option, OptionGuard } from "@app/components/option";
import { useCurrentProject } from "@app/hooks";
import { Async, DeferFn, IfFulfilled, PromiseFn, useAsync } from "react-async";
import { Link, useNavigate } from "react-router";
import { AiotCreationForm } from "@app/components/forms/aiot";
import { guardCurrentProject } from "@app/guards/project";
import { useParams } from "react-router";
import { isNone, None, Optional } from "@interface/option";
import { groupby, imap, sorted } from "itertools";
import { Groups } from "@interface/types";
import { DescriptionList } from "@app/components/descriptionList";
import { StackedList } from "@app/components/stackedList";
import { Breadcrumbs } from "@app/components/breadcrumbs";
import { AiotCreation, AiotData, defaultAiotCreation } from "@interface/model/aiots";
import { ControleData } from "@interface/model/controle";
import { Contact } from "@interface/model/contact";
import api from "@app/api";
import { useState } from "react";
import { Button } from "@app/components/button";
import { ContactForm } from "@app/components/forms/contact";

import {BiSolidAddToQueue, BiEdit } from "react-icons/bi"

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
        <AiotCreationForm defaultValues={defaultAiotCreation()} onSubmit={create}/>
      </div>
    </div>
}

export interface AiotEquipeProps {
  aiot: AiotData,
  onContactAdded?: (contact: Contact) => void
  onContactUpdated?: (index: number, contact: Contact) => void
}

export function AiotEquipe(props: AiotEquipeProps) {
  const project = guardCurrentProject();
  const {aiot} = props;
  const [mode, setMode] = useState<{kind: "Nouveau"} | {kind: "Edition", index: number} | undefined>(None);

  const addContact = async (contact: Contact) => {
    await api.aiots.addContact(project.id, {codeAiot: aiot.codeAiot}, contact);
    setMode(None);
    props.onContactAdded?.(contact);
  }

  const updateContact = (index: number) => ((contact: Contact) => {
    api.aiots.updateContact(project.id, {codeAiot: aiot.codeAiot}, index, contact);
    setMode(None);
    props.onContactUpdated?.(index, contact)
  })

  return <>
    <Button size="sm" theme="barebone" onClick={() => setMode({kind: "Nouveau"})}><BiSolidAddToQueue/></Button>
    {isNone(mode) && <StackedList>
      {aiot.équipe.map((contact, index) => ({
        key: contact.nom,
        content: <div className="flex flex-row space-x-2">
          <span>{contact.genre == "homme" && "M." }{contact.genre == "femme" && "Mme."} {`${contact.prénom ? `${contact.prénom} ` : ""}${contact.nom} - ${contact.fonction}`}</span>
          <Button theme="barebone" size="sm" onClick={() => setMode({kind: "Edition", index})}><BiEdit/></Button>
        </div>,
        subcontent: <div className="flex space-x-2 items-center">
          {contact.courriel && <span>@: <a href={`mailto:${contact.courriel}`}>{contact.courriel}</a></span>}
          {contact.téléphone && <span>Tél: {contact.téléphone}</span>}
        </div>
      }))}
    </StackedList>
    }
    {mode?.kind == "Edition" && <ContactForm defaultValues={aiot.équipe[mode.index]} onSubmit={updateContact(mode.index)} onCancel={() => setMode(None)}/>}
    {mode?.kind == "Nouveau" && <ContactForm onSubmit={addContact} onCancel={() => setMode(None)}/>}
  </>
}

export interface AiotControles {
  aiot: AiotData
}

export function AiotControles(props: AiotControles) {
  const project = guardCurrentProject();

  const fetch: PromiseFn<Groups<ControleData>> = async ({project, codeAiot}, _) => {
    const controles = await api.controles.list(project.id, {
        filter: {
            codeAiot
        }
    });

    let groups = imap(groupby(controles, (controle) => controle.année), ([key, items]) => ({key, items: [...items]}));
    let perYear = [...sorted(groups, ((group) => group.key), true)];
    return perYear
  }

  const state = useAsync({
    promiseFn: fetch,
    project,
    codeAiot: props.aiot.codeAiot
  })

  return <>
    <IfFulfilled state={state}>
      {controlesPerYear => 
        controlesPerYear.map(({key: année, items: controles}) => <>
          <h3>{année}</h3>
          {controles.map(controle => controle.kind)}
        </>)
      }
    </IfFulfilled>
  </>
}

export function AiotDetails() {
    const {codeAiot} = useParams();
    const project = guardCurrentProject();
    
    const fetch: PromiseFn<{data: Optional<AiotData>}> = async ({project, codeAiot}, _) => {
      return {data: await api.aiots.get(project.id, codeAiot)};
    };

    const refetch: DeferFn<{data: Optional<AiotData>}> = async ([project, codeAiot]) => {
      return {data: await api.aiots.get(project.id, codeAiot)};
    }

    return <div className="p-2">
      <Async promiseFn={fetch} deferFn={refetch} project={project} codeAiot={codeAiot}>
      {(state) => (
        <IfFulfilled state={state}>
          {({data: maybeAiot})=> 
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
                      {key:"address", heading: "Adresse", content: <div className="flex flex-col">
                        {aiot.adresse.lines.map((line) => <span key={line}>{line}</span>)}
                        <span>{aiot.adresse.commune} ({aiot.adresse.codePostal})</span>
                      </div>},
                      {key: "équipe", heading: "Equipe", content: <AiotEquipe aiot={aiot} onContactUpdated={(_) => state.run(project, codeAiot)} onContactAdded={(_) => state.run(project, codeAiot)}/>}
                    ]
                  }}
                </DescriptionList>
                <h2>Contrôles</h2>
                <AiotControles aiot={aiot}/>
              </>}
            </OptionGuard>
          }
        </IfFulfilled>
      )}
      </Async>
    </div>
}

export function AiotsList() {
  const maybeProject = useCurrentProject();
  
  const fetchList: PromiseFn<Array<AiotData>> = async ({project}, _) => {
      return await window.cim.aiots.list(project.id, {});
  };

  return <div className="p-2">
    <Breadcrumbs>
      <Link to="/">Home</Link>
      <span>AIOTS</span>
    </Breadcrumbs>
    <Option 
      value={maybeProject}
      onSome={(project) => <>
          <div className="mb-2">
              <Link to="/aiots/create">Nouvel AIOT</Link>
          </div>
          <Async promiseFn={fetchList} project={project}>
            <Async.Fulfilled<Array<AiotData>>>{aiots => 
              <StackedList>
              {aiots.map(aiot => ({
                key: aiot.codeAiot,
                content: <Link to={`/aiots/${aiot.codeAiot}`}>{aiot.nom}</Link>, 
                subcontent: <>{aiot.adresse.lines.join(', ')}, {aiot.adresse.commune}, {aiot.adresse.codePostal}</>
              }))}                    
              </StackedList>                       
            }</Async.Fulfilled>
        </Async>
      </>}
    />
  </div>
}