import api from "@renderer/api";
import { Button } from "@renderer/components/button";
import { ConditionSymbol } from "@renderer/components/contrôle";
import { DescriptionList } from "@renderer/components/description-list";
import { ConditionForm } from "@renderer/components/forms/condition";
import { ConditionRejetAirCreationForm, UpdateEmissairesForm } from "@renderer/components/forms/contrôle";
import { ParamètreForm } from "@renderer/components/forms/paramètre";
import { Tabs } from "@renderer/components/tab";
import { ControleContext, PointDeControleAirContext } from "@renderer/context/contrôle";
import { guardCurrentProject } from "@renderer/guards/project";
import { UpdatorBuilder } from "@shared/database/query";
import { Condition } from "@shared/model/condition";
import { ConditionRejetAir, PointDeControleAir } from "@shared/model/controle/air";
import { Paramètre } from "@shared/model/paramètre";
import { isNone, None, Optional } from "@shared/option";
import { useContext, useState } from "react";
import { BiAddToQueue, BiEdit, BiTrash } from "react-icons/bi";

export type ConditionAirKind = "flux" | "conditionsRejet" | "concentrations";

export interface PointDeControleAirDetailProps {
  controleId: string,
  id: number, 
  point: PointDeControleAir,
  onUpdated?: () => Promise<void>
}

function RejetsList({rejets, kind}: {rejets: Array<ConditionRejetAir>, kind: ConditionAirKind}) {
  const {id: projectId} = guardCurrentProject();
  const controle = useContext(ControleContext)!;
  const point = useContext(PointDeControleAirContext)!;

  const deleteRejet = async (index: number) => {
    const updator = new UpdatorBuilder().removeArrayElementAt(`points.${point.id}.${kind}`, index).build();
    await api.controles.update(projectId, {id: controle.id}, updator);
    controle.onUpdate();
  }

  const editExigence = (rejetId: number) => (async (form: Condition) => {
    const updator = new UpdatorBuilder().set(`points.${point.id}.${kind}.${rejetId}.exigence`, form).build();
    await api.controles.update(projectId, {id: controle.id}, updator);
    controle.onUpdate();
  });

  const editResultat = (rejetId: number) => (async (form: Paramètre) => {
    const updator = new UpdatorBuilder().set(`points.${point.id}.${kind}.${rejetId}.résultat`, form).build();
    await api.controles.update(projectId, {id: controle.id}, updator);
    controle.onUpdate();  
  });

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

export function PointDeControleAirDetail(props: PointDeControleAirDetailProps) {
  const {id: projectId} = guardCurrentProject();
  const point = props.point;
  const controleCtx = useContext(ControleContext)!;

  type ModeKind = {
    kind: "nouveau", 
    entity: "flux" | "conditionsRejet" | "concentrations"
  } | {kind: "édition", entity: "émissaires"};
  
  const [mode, setMode] = useState<Optional<ModeKind>>(None);

  const updateEmissaires = async ({émissaires}: Pick<PointDeControleAir, "émissaires">) => {
    let updator = new UpdatorBuilder().set(`points.${props.id}.émissaires`, émissaires).build();
    await api.controles.update(projectId, {id: controleCtx.id}, updator);
    controleCtx?.onUpdate();   
  }

  const addConditionRejet = (kind: ConditionAirKind) => async (form: ConditionRejetAir) => {
    let updator = new UpdatorBuilder().add(`points.${props.id}.${kind}`, form).build();
    await api.controles.update(projectId, {id: props.controleId}, updator);
    props.onUpdated?.();
    setMode(None); 
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
            content: <>{mode?.kind == "édition" && mode?.entity === "émissaires" ? 
              <UpdateEmissairesForm defaultValues={point} onSubmit={updateEmissaires} /> 
              : <div>
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
                <ConditionRejetAirCreationForm onSubmit={addConditionRejet("conditionsRejet")}/>
                : <RejetsList rejets={props.point.conditionsRejet} kind="conditionsRejet"/>
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
                  <ConditionRejetAirCreationForm onSubmit={addConditionRejet("concentrations")}/>
                  : <RejetsList rejets={props.point.concentrations} kind="concentrations"/>
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
                <ConditionRejetAirCreationForm onSubmit={addConditionRejet("flux")}/>
                : <RejetsList rejets={props.point.flux} kind="flux"/>
              }
            </>
          }
        ]}
      </Tabs>
    </PointDeControleAirContext.Provider>
  </>
}
