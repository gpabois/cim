import api from "@renderer/api";
import { AsyncPending, AsyncResolved } from "@renderer/components/async";
import { Breadcrumbs } from "@renderer/components/breadcrumbs";
import { PointDeControleAirCreationForm } from "@renderer/components/forms/contrôle";
import { StackedList } from "@renderer/components/stacked-list";
import { guardCurrentProject } from "@renderer/guards/project";
import { useAsync } from "@renderer/hooks";
import { None, Optional } from "@shared/option";
import { useState } from "react";
import { Link } from "react-router";
import { BiAddToQueue, BiTrash } from "react-icons/bi";
import { useParams } from "react-router";
import { OptionGuard } from "@renderer/components/option";
import { DescriptionList } from "@renderer/components/description-list";
import { ControleAirFields, PointDeControleAir } from "@shared/model/controle/air";
import { Tabs } from "@renderer/components/tab";
import { Button } from "@renderer/components/button";
import { UpdatorBuilder } from "@shared/database/query";
import { Accordeon } from "@renderer/components/accordeon";
import { ControleAirContext } from "@renderer/context/contrôle";
import { ControleSymbol } from "@renderer/components/contrôle";
import { PointDeControleAirDetail } from "./air/details";

export * from './create';

export function ControleDetails() {
  const {id: projectId} = guardCurrentProject();
  const {id} = useParams();
  
  const fetch = async ({projectId, id}) => api.controles.get(projectId, id);

  const state = useAsync(fetch, {projectId, id});
  const [mode, setMode] = useState<Optional<"nouveau">>(None);
  const refresh = () => state.run({projectId, id});

  /// Génère un courrier de notification
  const generateCourrierNotification = async () => {
    await api.template.generateAndSave(projectId, "COURRIER_ANNONCE_CI_AIR.docx", state.data);
  }

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
