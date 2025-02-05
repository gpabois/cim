import api from "@renderer/api";
import { AsyncPending, AsyncResolved } from "@renderer/components/async";
import { PointDeControleAirCreationForm } from "@renderer/components/forms/contrôle";
import { guardCurrentProject } from "@renderer/guards/project";
import { None, Optional } from "@shared/option";
import { useContext, useState } from "react";
import { Link, useParams } from "react-router";
import { BiAddToQueue, BiTrash } from "react-icons/bi";
import { OptionGuard } from "@renderer/components/option";
import { DescriptionList } from "@renderer/components/description-list";
import { Button } from "@renderer/components/button";
import { UpdatorBuilder } from "@shared/database/query";
import { Accordeon } from "@renderer/components/accordeon";
import { ControleContext } from "@renderer/context/contrôle";
import { ControleSymbol } from "@renderer/components/contrôle";
import { PointDeControleAirDetail } from "./air/details";
import { EditableField } from "@renderer/components/form";
import { ControleFields } from "@shared/model/controle";
import { GUNEnvIcon } from "@renderer/components/icons";
import { Page } from "@renderer/components/page";
import { EditableContact } from "@renderer/components/forms/contact";
import { ControleAirFields, PointDeControleAir } from "@shared/model/controle/air";
import { useAppDispatch, useAppSelector, useAsync } from "@renderer/hooks";
import { setCurrentPoint, setCurrentTab } from "@renderer/features/controleViewSlice";

function InfosGénérales() {
  const {id: projectId} = guardCurrentProject();
  const controle = useContext(ControleContext)!;

  const updateField = <Field extends keyof NonNullable<ControleFields>>(field: Field) => async (value: any) => {
    const updator = new UpdatorBuilder().set(`${field}` as any, value).build();
    await api.controles.update(projectId, {"id": controle.id}, updator);
    controle.onUpdate();
  }

  return <DescriptionList>
    {{
      fields: [
        {
          key: "lien-procédure-gunenv",
          heading: <div className="flex items-center space-x-2">
            <span>Lien vers la procédure</span>
            <GUNEnvIcon/>
          </div>,
          content: <>
            <EditableField defaultValues={controle.lienProcédureGUNenv} onSubmit={updateField("lienProcédureGUNenv")}>
              {controle.lienProcédureGUNenv  ? <a onClick={(_) => api.ui.openWindow(controle.lienProcédureGUNenv!)}>{controle.lienProcédureGUNenv}</a> : "-"}
            </EditableField>
          </>
        }, {
          key: "contact-exploitant",
          heading: "Contact exploitant",
          content: <EditableContact choices={controle.aiot.équipe} value={controle.contactExploitant} onSubmit={updateField("contactExploitant")}/>
        }
      ]
    }}
  </DescriptionList>
}

function Notification() {
  const {id: projectId} = guardCurrentProject();
  const controle = useContext(ControleContext)!;


  const updateField = <Field extends keyof NonNullable<ControleFields["notification"]>>(field: Field) => async (value: any) => {
    const updator = new UpdatorBuilder().set(`notification.${field}` as any, value[field]).build();
    await api.controles.update(projectId, {"id": controle.id}, updator);
    controle.onUpdate();
  }

  /// Génère un courrier de notification
  const generateCourrierNotification = async () => {
    const {onUpdate, ...data} = controle;
    await api.template.generateAndSave(projectId, "COURRIER_ANNONCE_CI_AIR.docx", data);
  }

  return <>
    <DescriptionList>
      {{
        fields: [
          {
            key: "genCourrierNotif",
            heading: "Courrier de notification",
            content: <>
                  <Button onClick={generateCourrierNotification}>Courrier de notification</Button>
            </>
          },
          {
            key: "dateEnvoi",
            heading: "Date d'envoi",
            content: <EditableField type="date" onSubmit={updateField("dateEnvoi")} defaultValues={controle.notification?.dateEnvoi}>
              {controle.notification?.dateEnvoi || "N/D"}
            </EditableField>
          },
          {
            key: "dateRéception",
            heading: "Date de réception",
            content: <EditableField type="date" onSubmit={updateField("dateRéception")} defaultValues={controle.notification?.dateRéception}>
              {controle.notification?.dateRéception || "N/D"}
            </EditableField>
          },
        ]
      }}
    </DescriptionList>

  </>
}

export function ControleDetails() {
  const {id: projectId} = guardCurrentProject();
  const {id} = useParams();
  
  const fetch = async ({projectId, id}) => api.controles.get(projectId, id);

  const state = useAsync(fetch, {projectId, id});
  const [mode, setMode] = useState<Optional<"nouveau">>(None);
  const refresh = () => state.run({projectId, id});


  /// Ajoute un point de contrôle air.
  const addPointDeControleAir = async (pdc: PointDeControleAir) => {
    const updator = new UpdatorBuilder<ControleAirFields>().add("points", pdc).build();
    await api.controles.update(projectId, {id}, updator);
    refresh(); 
    setMode(None);
  }

  // Retire un point de contrôle air
  const removePointDeControleAir = async (index: number) => {
    const updator = new UpdatorBuilder<ControleAirFields>().removeArrayElementAt("points", index).build();
    await api.controles.update(projectId, {id}, updator);
    refresh();
  }

  const currentTab = useAppSelector((state) => state.controleView.currentTab);
  const currentPoint = useAppSelector((state) => state.controleView.currrentPoint);
  const dispatch = useAppDispatch();
 
  return <>
    <AsyncPending state={state}>
      <Page heading="..." breadcrumbs={[<Link to="/">Home</Link>, <Link to="/contrôles">Contrôles</Link>, <span>...</span>]}>
        <div></div>
      </Page>
    </AsyncPending>
    <AsyncResolved state={state}>
    {maybeControle => <OptionGuard value={maybeControle} redirect="/404">
      {controle => <>
          <ControleContext.Provider value={{onUpdate: refresh, ...controle}}>
            <Page 
              breadcrumbs={[
                <Link to="/">Home</Link>,
                <Link to="/contrôles">Contrôles</Link>,
                <Link to={`/contrôles?année=${controle.année}`}>{controle.année}</Link>,
                <span>{controle.aiot.nom}</span>
              ]}
              heading={
                <div className="flex space-x-2 items-center">
                  <ControleSymbol kind={controle.kind}/>
                  <span>{controle.année} - <Link to={`/aiots/${controle.aiot.codeAiot}`}>{controle.aiot.nom}</Link></span>
                  {controle.lienProcédureGUNenv  && <a onClick={() => api.ui.openWindow(controle.lienProcédureGUNenv!)}><GUNEnvIcon/></a>}
                </div>
              }
              selectedTab={currentTab}
              onSelectedTab={(tab) => dispatch(setCurrentTab(tab))}
              tabs={[
                {
                  id: "infos-générales",
                  label: "Générales",
                  content: <InfosGénérales/>
                },
                {
                  id: "points-de-controle",
                  label: <span className="flex space-x-2 w-full">
                    <span className="flex-1 font-semibold">Points de contrôles</span>
                    <Button onClick={() => setMode("nouveau")} theme="barebone"><BiAddToQueue/></Button>
                  </span>,
                  content: <>
                    <div>
                      {mode == "nouveau" &&
                        <PointDeControleAirCreationForm 
                          onCancel={() => setMode(None)} 
                          onSubmit={addPointDeControleAir}
                        />
                      }
                    </div>
                    <Accordeon selected={currentPoint} onSelected={(id) => dispatch(setCurrentPoint(id))}>
                      {controle.points.map((point, index) => ({
                        key: `${index}`,
                        title: <div className="flex w-full">
                          <span className="font-semibold text-sm flex-1">Point de contrôle n°{`${index + 1}`}</span>
                          <Button theme="barebone" onClick={() => removePointDeControleAir(index)}><BiTrash className="text-red-600"/></Button>
                        </div>,
                        content: <PointDeControleAirDetail
                          controleId={id!}
                          id={index} 
                          point={point}
                          onUpdated={async () => state.run({projectId, id})}
                        />
                      }))}               
                    </Accordeon>
                  </>
                }, {
                  id: "Notification",
                  label: "Notification",
                  content: <Notification/>
                }, {
                  id: "sélection",
                  label: "Sélection",
                  content: <></>
                }
              ]}
            >
            </Page>
          </ControleContext.Provider>
        </>
      }
      </OptionGuard>}
    </AsyncResolved>
  </>
}
