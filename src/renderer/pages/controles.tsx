import api from "@app/api";
import { AsyncPending, AsyncResolved } from "@app/components/async";
import { Breadcrumbs } from "@app/components/breadcrumbs";
import { ControleAirCreationForm, PointDeControleAirCreation } from "@app/components/forms/controle";
import { StackedList } from "@app/components/stackedList";
import { guardCurrentProject } from "@app/guards/project";
import { useAsync } from "@app/hooks";
import { ControleTypes } from "@interface/model/controle";
import { isNone, None, Optional } from "@interface/option";
import { createContext, useContext, useState } from "react";
import { Link, useNavigate } from "react-router";
import { FaWind } from "react-icons/fa6";
import { IoWaterSharp } from "react-icons/io5";
import { BiAddToQueue, BiEdit, BiTrash } from "react-icons/bi";
import { useParams } from "react-router";
import { OptionGuard } from "@app/components/option";
import { DescriptionList } from "@app/components/descriptionList";
import { ConditionRejetAir, ControleAirFields, PointDeControleAir } from "@interface/model/controle/air";
import { Tabs } from "@app/components/tab";
import { Button } from "@app/components/button";
import { UpdatorBuilder } from "@interface/query";
import { FormProvider, useForm } from "react-hook-form";
import { Input, MultiInput, Select } from "@app/components/form";
import { Condition } from "@interface/model/condition";
import { Accordeon } from "@app/components/accordeon";
import { ConditionForm } from "@app/components/forms/condition";
import { ParamètreForm } from "@app/components/forms/paramètre";
import { Paramètre } from "@interface/model/paramètre";

export function CreateControle() {
  const {id: projectId} = guardCurrentProject();
  const navigate = useNavigate();
  const [kind, setKind] = useState<Optional<ControleTypes['fields']['kind']>>(None);

  const create = async (form: ControleTypes['creation']) => {
    console.log(form);
    const id = await api.controles.create(projectId, form);
    navigate(`/contrôles/${id}`);
  }

  return <div className="p-2">
    <Breadcrumbs>
      <Link to="/">Home</Link>
      <Link to="/contrôles">Contrôles</Link>
      <span>Nouveau</span>
    </Breadcrumbs>

    <div className="space-y-2">
      <ul className="grid w-full gap-6 md:grid-cols-2 py-2">
        <li>
          <input type="radio" id="kind-air" name="kind" value="air" required onChange={(ev) => setKind(ev.target.value as ControleTypes['fields']['kind'])} />
          <label htmlFor="kind-air" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Rejets canalisés atmosphériques</label>
        </li>
        <li>
          <input type="radio" id="kind-eau" name="kind" value="eau" required onChange={(ev) => setKind(ev.target.value as ControleTypes['fields']['kind'])} />
          <label htmlFor="kind-eau" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Rejets aqueux</label>
        </li>
      </ul>
      {kind == "air" && <ControleAirCreationForm onSubmit={create} />}
      {kind == "eau" && <span>TODO</span>}
    </div>
  </div>
}

export function ControleSymbol(props: {kind: "air" | "eau"}) {
  if(props.kind == "air") {
    return <FaWind/>
  } else {
    return <IoWaterSharp/>
  }
}

export interface PointDeControleAirDetailProps {
  controleId: string,
  id: number, 
  point: PointDeControleAir,
  onUpdated?: () => Promise<void>
}

export type ConditionRejetAirCreation = ConditionRejetAir & {
  kind: "flux" | "conditionsRejet" | "concentrations"
}

export const ControleAirContext = createContext<Optional<{id: string, onUpdate: () => void}>>(None);
export const PointDeControleAirContext = createContext<Optional<{id: number}>>(None);

export function PointDeControleAirDetail(props: PointDeControleAirDetailProps) {
  const {id: projectId} = guardCurrentProject();
  const point = props.point;
  const controleCtx = useContext(ControleAirContext)!;

  type ModeKind = {
    kind: "nouveau", 
    entity: "flux" | "conditionsRejet" | "concentrations"
  } | {kind: "édition", entity: "émissaires"};
  
  const [mode, setMode] = useState<Optional<ModeKind>>(None);
  
  const UpdateEmissairesForm = () => {
    const methods = useForm<{émissaires: Array<string>}>({defaultValues: {émissaires: props.point.émissaires}});
    
    const submit = async ({émissaires}) => {
      let updator = new UpdatorBuilder().set(`points.${props.id}.émissaires`, émissaires).build();
      await api.controles.update(projectId, {id: controleCtx.id}, updator);
      controleCtx?.onUpdate();
    }

    return <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(submit)} className="space-y-2">
        <MultiInput label="Emissaires" name="émissaires"/>
        <Input type="submit" value="Enregistrer"/>
      </form>
    </FormProvider>    
  };  
  
  const ConditionSymbol = ({kind}: {kind: Condition['kind']}) => {
    if(kind == "MAX") return "<=";
    if(kind == "MIN") return ">=";
    return "~"
  }

  const DetailRejets = ({rejets, kind}: {rejets: Array<ConditionRejetAir>, kind: "flux" | "conditionsRejet" | "concentrations"}) => {
    const deleteRejet = async (index: number) => {
      const updator = new UpdatorBuilder().removeArrayElementAt(`points.${props.id}.${kind}`, index).build();
      await api.controles.update(projectId, {id: controleCtx.id}, updator);
      controleCtx.onUpdate();
    }

    const editExigence = (rejetId: number) => (async (form: Condition) => {
      const updator = new UpdatorBuilder().set(`points.${props.id}.${kind}.${rejetId}.exigence`, form).build();
      await api.controles.update(projectId, {id: controleCtx.id}, updator);
      controleCtx.onUpdate();
    })

    const editResultat = (rejetId: number) => (async (form: Paramètre) => {
      const updator = new UpdatorBuilder().set(`points.${props.id}.${kind}.${rejetId}.résultat`, form).build();
      await api.controles.update(projectId, {id: controleCtx.id}, updator);
      controleCtx.onUpdate();  
    })

    type ModeKind = {kind: "édition", entity: "exigence" | "résultat", id: number};

    const [mode, setMode] = useState<Optional<ModeKind>>(None);

    return <DescriptionList>
    {{
      fields: rejets.map((rejet, id) => ({
        key: rejet.nom,
        heading: <div className="flex items-center text-sm">
          <span className="flex-1">{rejet.nom}</span>

        </div>,
        content: <div className="flex space-x-2">
          <span className="flex-1">
            {mode?.kind == "édition" && mode?.entity == "exigence" ? 
              <ConditionForm onSubmit={editExigence(id)} defaultValues={rejet.exigence}/>
            : <div className="flex space-x-2">
                <span>
                  <ConditionSymbol kind={rejet.exigence.kind}/> 
                  {rejet.exigence.param.valeur} 
                  {rejet.exigence.param.unité} 
                </span>
                <Button theme="barebone" onClick={() => setMode({kind: "édition", entity: "exigence", id})}><BiEdit/></Button>
              </div>
            }
          </span>
          <span className="flex-1">
            {mode?.kind == "édition" && mode?.entity == "résultat" &&
              <ParamètreForm 
                  onSubmit={editResultat(id)} 
                  defaultValues={rejet.résultat || {valeur: 0, unité: rejet.exigence.param.unité}}
              />
            }
            {isNone(mode) && 
              <>
                {rejet.résultat ? <span>{rejet.résultat.valeur} {rejet.résultat.unité}</span>: <span>-</span>}
                <Button theme="barebone" onClick={() => setMode({kind: "édition", entity: "résultat", id})}><BiEdit/></Button>
              </>
            }
          </span>
          <Button theme="barebone" className="text-red-600" onClick={() => deleteRejet(id)}><BiTrash/></Button>
        </div>
      }))
    }}
  </DescriptionList>
  }

  const RejetForm = ({kind}: {kind: ConditionRejetAirCreation['kind']}) => {
    const methods = useForm<ConditionRejetAir>();
    const {register, handleSubmit} = methods;

    const submit = async (form) => {
      let updator = new UpdatorBuilder().add(`points.${props.id}.${kind}`, form).build();
      await api.controles.update(projectId, {id: props.controleId}, updator);
      props.onUpdated?.();
      setMode(None);
    };

    return <FormProvider {...methods}>
      <form onSubmit={handleSubmit(submit)} className="space-y-2">
        <Input label="Nom" {...register("nom")}/>
        <div className="flex space-x-2">
          <Input className="flex-1" label="Valeur" {...register("exigence.param.valeur")}></Input>
          <Input className="flex-1" label="Unité" {...register("exigence.param.unité")}></Input>
        </div>
        <Select label="Type" {...register("exigence.kind")} transform={(v) => ({label: v, value: v})} options={["MAX", "MIN", "REF"]}></Select>
        <Input type="submit" value="Enregistrer"/>
      </form>
    </FormProvider>
  }

  return <>
    <PointDeControleAirContext.Provider value={{id: props.id}}>
      <DescriptionList>
        {{
          fields: [{
            key: "émissaires",
            heading: <div className="flex space-x-2 items-center">
              <span className="flex">Emissaires</span>
              <Button theme="barebone" onClick={() => setMode({kind: "édition", entity: "émissaires"})}><BiEdit/></Button>
            </div>,
            content: <>{mode?.kind == "édition" && mode?.entity === "émissaires" ? <UpdateEmissairesForm/> : <div>
                <ul>
                  {point.émissaires.map((émissaire, index) => <li key={index}>{émissaire}</li>)}
                </ul>
              </div>
            }
            </>
          }]
        }}
      </DescriptionList>
      <Tabs>
        {[
          {
            id: "conditions-rejet", 
            label: <div className="flex items-center text-sm space-x-2">
              <span className="flex-1">Conditions de rejet</span>
              <Button theme="barebone" onClick={() => setMode({kind: "nouveau", entity: "conditionsRejet"})}><BiAddToQueue/></Button>
            </div>, 
            content: <>
              {mode?.kind == "nouveau" && mode?.entity == "conditionsRejet" ? 
                <RejetForm kind="conditionsRejet"></RejetForm> 
                : <DetailRejets rejets={props.point.conditionsRejet} kind="conditionsRejet"></DetailRejets>
              }
            </>
          }, {
            id: "concentrations", 
            label: <div className="flex items-center text-sm space-x-2">
              <span className="flex-1">Concentrations</span>
              <Button theme="barebone" onClick={() => setMode({kind: "nouveau", entity: "concentrations"})}><BiAddToQueue/></Button>
            </div>, 
            content: <>
              {mode?.kind == "nouveau" && mode?.entity == "concentrations" ? 
                  <RejetForm kind="concentrations"></RejetForm>
                : <DetailRejets rejets={props.point.concentrations} kind="concentrations"></DetailRejets>
              }
            </>
          }, {
            id: "flux", 
            label: <div className="flex items-center text-sm space-x-2">
              <span className="flex-1">Flux</span>
              <Button theme="barebone" onClick={() => setMode({kind: "nouveau", entity: "flux"})}><BiAddToQueue/></Button>
            </div>, 
            content: <>
              {mode?.kind == "nouveau" && mode?.entity == "flux" ? 
                <RejetForm kind="flux"></RejetForm>
                : <DetailRejets rejets={props.point.flux} kind="flux"></DetailRejets>
              }
            </>
          }
        ]}
      </Tabs>
    </PointDeControleAirContext.Provider>
  </>
}

export function ControleDetails() {
  const {id: projectId} = guardCurrentProject();
  const {id} = useParams();
  

  const fetch = async ({projectId, id}) => api.controles.get(projectId, id);

  const state = useAsync(fetch, {projectId, id});
  const [mode, setMode] = useState<Optional<"nouveau">>(None);
  const refresh = () => state.run({projectId, id});

  /// Génère un courrier de notification
  const generateCourrierNotification = async () => {
    await api.template.generateAndSave(projectId, "COURRIER_ANNONCE_CI_AIR", state.data);
  }

  /// Ajoute un point de contrôle air.
  const addPointDeControleAir = async (pdc: PointDeControleAir) => {
    const updator = new UpdatorBuilder<ControleAirFields>().add("points", pdc).build();
    await api.controles.update(projectId, {id}, updator);
    refresh(); 
    setMode(None);
  }

  const removePointDeControleAir = async (index: number) => {
    const updator = new UpdatorBuilder<ControleAirFields>().removeArrayElementAt("points", index).build();
    await api.controles.update(projectId, {id}, updator);
    refresh();
  }

  return <div className="p-2 w-full">
    <AsyncPending state={state}>
      <Breadcrumbs>
        <Link to="/">Home</Link>
        <Link to="/contrôles">Contrôles</Link>
        <span>...</span>
      </Breadcrumbs>
    </AsyncPending>
    <AsyncResolved state={state}>
      {maybeControle => <OptionGuard value={maybeControle} redirect="/404">
      {controle => <>
          <ControleAirContext.Provider value={{onUpdate: refresh, id: controle.id}}>
            <Breadcrumbs>
              <Link to="/">Home</Link>
              <Link to="/contrôles">Contrôles</Link>
              <span>{controle.année}</span>
              <span>{controle.aiot.nom}</span>
            </Breadcrumbs>

            <DescriptionList>
              {{
                title: <div className="flex space-x-2 items-center">
                  <ControleSymbol kind={controle.kind}/>
                  <span>{controle.nom}</span>
                </div>,
                fields: []
              }}
            </DescriptionList>
            
            <Tabs>
              {[
                {
                  id: "points-de-controle",
                  label: <span className="flex space-x-2 w-full">
                    <h2 className="flex-1 font-semibold">Points de contrôles</h2>
                    <Button onClick={() => setMode("nouveau")} theme="barebone"><BiAddToQueue/></Button>
                  </span>,
                  content: <>
                    <div>
                      {mode == "nouveau" &&
                        <PointDeControleAirCreation 
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
                  content: <>
                    <Button onClick={generateCourrierNotification}>Courrier de notification</Button>
                  </>
                }
              ]}
            </Tabs>
          </ControleAirContext.Provider>
        </>
      }
      </OptionGuard>}
    </AsyncResolved>
  </div>
}

export function ControlesList() {
  const {id: projectId} = guardCurrentProject();

  const promiseFn = async ({ projectId }) => {
    return await api.controles.list(projectId, {});
  };

  const state = useAsync(promiseFn, {projectId});

  return <div className="p-2">
    <div className="flex items-center space-x-2">
      <Breadcrumbs className="flex-1">
        <Link to="/">Home</Link>
        <span>Contrôles</span>
      </Breadcrumbs>
      <div className="mb-2">
        <Link to="/contrôles/create"><BiAddToQueue/></Link>
      </div>
    </div>
    <AsyncResolved state={state}>
    {controles =>
      <StackedList>
        {controles.map(controle => ({
          key: controle.id,
          content: <div className="flex items-center space-x-2">
              <ControleSymbol kind={controle.kind}/>
              <Link to={`/contrôles/${controle.id}`}>{controle.nom}</Link>
            </div>,
        }))}
      </StackedList>
    }
    </AsyncResolved>
  </div>
}
