import api from "@renderer/api";
import { AsyncPending, AsyncResolved } from "@renderer/components/async";
import { PointDeControleAirCreationForm } from "@renderer/components/forms/contrôle";
import { guardCurrentProject } from "@renderer/guards/project";
import { useAsync } from "@renderer/hooks";
import { None, Optional } from "@shared/option";
import { useContext, useState } from "react";
import { Link } from "react-router";
import { BiAddToQueue, BiEdit, BiTrash } from "react-icons/bi";
import { useParams } from "react-router";
import { OptionGuard } from "@renderer/components/option";
import { DescriptionList } from "@renderer/components/description-list";
import { ControleAirFields, PointDeControleAir } from "@shared/model/controle/air";
import { Button } from "@renderer/components/button";
import { UpdatorBuilder } from "@shared/database/query";
import { Accordeon } from "@renderer/components/accordeon";
import { ControleContext } from "@renderer/context/contrôle";
import { ControleSymbol } from "@renderer/components/contrôle";
import { PointDeControleAirDetail } from "./air/details";
import { useForm } from "react-hook-form";
import { Input } from "@renderer/components/form";
import { ControleFields } from "@shared/model/controle";
import { GUNEnvIcon } from "@renderer/components/icons";
import { Page } from "@renderer/components/page";

function InfosGénérales() {
  const {id: projectId} = guardCurrentProject();
  const controle = useContext(ControleContext)!;

  type ModeKind = "edit-lien-gunenv";
  const [mode, setMode] = useState<Optional<ModeKind>>(None);

  const updateField = <Field extends keyof NonNullable<ControleFields>>(field: Field) => async (value: any) => {
    const updator = new UpdatorBuilder().set(`${field}` as any, value[field]).build();
    await api.controles.update(projectId, {"id": controle.id}, updator);
    setMode(None);
    controle.onUpdate();
  }

  const updateLienProcédureGUNEnv = updateField("lienProcédureGUNenv");
  const editLienProcédureGUNEnvForm = useForm<{lienProcédureGUNenv: string}>({defaultValues: controle});

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
            {mode !== "edit-lien-gunenv" && <div className="flex items-center space-x-2">
              {controle.lienProcédureGUNenv  ? <a onClick={(_) => api.ui.openWindow(controle.lienProcédureGUNenv!)}>{controle.lienProcédureGUNenv}</a> : "-"}
              <Button theme="barebone" onClick={() => setMode("edit-lien-gunenv")}><BiEdit/></Button>
            </div>}
            {mode === "edit-lien-gunenv" && <>
                <form className="flex space-x-2 items-center" onSubmit={editLienProcédureGUNEnvForm.handleSubmit(updateLienProcédureGUNEnv)}>
                  <Input className="flex-1" {...editLienProcédureGUNEnvForm.register("lienProcédureGUNenv")}/>
                  <div className="flex space-x-2">
                    <Input type="submit" value={"Enregistrer"}/>
                    <Button theme="danger" onClick={() => setMode(None)}>Annuler</Button>
                  </div>
                </form>
              </>}
          </>
        }
      ]
    }}
  </DescriptionList>
}

function Notification() {
  const {id: projectId} = guardCurrentProject();
  const controle = useContext(ControleContext)!;

  type ModeKind = "edit-date-envoi" | "edit-date-réception";

  const [mode, setMode] = useState<Optional<ModeKind>>(None);

  const editDateEnvoiForm = useForm<{dateEnvoi: string}>({defaultValues: controle.notification});
  const editDateReceptionForm = useForm<{dateRéception: string}>({defaultValues: controle.notification});

  const updateField = <Field extends keyof NonNullable<ControleFields["notification"]>>(field: Field) => async (value: any) => {
    const updator = new UpdatorBuilder().set(`notification.${field}` as any, value[field]).build();
    await api.controles.update(projectId, {"id": controle.id}, updator);
    setMode(None);
    controle.onUpdate();
  }

  const updateDateEnvoi = updateField("dateEnvoi");
  const updateDateReception = updateField("dateRéception");

  /// Génère un courrier de notification
  const generateCourrierNotification = async () => {
    await api.template.generateAndSave(projectId, "COURRIER_ANNONCE_CI_AIR.docx", controle);
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
            content: <>
              {mode !== "edit-date-envoi" && <div className="flex items-center space-x-2">
                {controle.notification?.dateEnvoi || "N/D"}
                <Button theme="barebone" onClick={() => setMode("edit-date-envoi")}><BiEdit/></Button>
              </div>}
              {mode === "edit-date-envoi" && <>
                <form className="flex space-x-2 items-center" onSubmit={editDateEnvoiForm.handleSubmit(updateDateEnvoi)}>
                  <Input className="flex-1" type="date" {...editDateEnvoiForm.register("dateEnvoi")}/>
                  <div className="flex space-x-2">
                    <Input type="submit" value={"Enregistrer"}/>
                    <Button theme="danger" onClick={() => setMode(None)}>Annuler</Button>
                  </div>
                </form>
              </>}
            </>
          },
          {
            key: "dateRéception",
            heading: "Date de réception",
            content: <>
              {mode !== "edit-date-réception" && <div className="flex items-center space-x-2">
                <span>{controle.notification?.dateRéception || "N/D"}</span>
                <Button theme="barebone" onClick={() => setMode("edit-date-réception")}><BiEdit/></Button>
              </div>}
              {mode === "edit-date-envoi" && <>
                <form className="flex space-x-2 items-center" onSubmit={editDateReceptionForm.handleSubmit(updateDateReception)}>
                  <Input className="flex-1" type="date" {...editDateReceptionForm.register("dateRéception")}/>
                  <div className="flex space-x-2">
                    <Input type="submit" value={"Enregistrer"}/>
                    <Button theme="danger" onClick={() => setMode(None)}>Annuler</Button>
                  </div>
                </form>
              </>}
            </>
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
                    <Accordeon>
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
