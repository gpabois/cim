import { Breadcrumbs } from "@app/components/breadcrumbs";
import { Button } from "@app/components/button";
import { ControleAirCreationFields } from "@app/components/forms/controle";
import { Option } from "@app/components/option";
import { StackedList } from "@app/components/stackedList";
import { guardCurrentProject } from "@app/guards/project";
import { useCurrentProject } from "@app/hooks";
import { Controle, ControleDAO, NouveauControle, NouveauControleAir } from "@interface/model";
import { isSome, None, Optional } from "@interface/option";
import { useState } from "react";
import { Async, PromiseFn } from "react-async";
import { Link, useNavigate } from "react-router";

export function CreateControle() {
  const project = guardCurrentProject();
  const navigate = useNavigate();
  const [kind, setKind] = useState<Optional<Controle['kind']>>(None);
  const [controle, updateControle] = useState<Optional<NouveauControle>>(None);

  const create = async () => {
    if(isSome(controle)) {
      let id = await window.cim.controles.new(project.id, controle);
      navigate(`/contrôles/${id}`);
    }
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
            <input type="radio" id="kind-air" name="kind" value="air" required onChange={(ev) => setKind(ev.target.value as Controle['kind'])}/>
            <label htmlFor="kind-air" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Rejets canalisés atmosphériques</label>
        </li>
        <li>
            <input type="radio" id="kind-eau" name="kind" value="eau"  required onChange={(ev) => setKind(ev.target.value as Controle['kind'])}/>
            <label htmlFor="kind-eau" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Rejets aqueux</label>
        </li>
      </ul>
      {kind == "air" && <ControleAirCreationFields value={controle as NouveauControleAir} onChange={updateControle}/>}
      {kind == "eau" && <span>TODO</span>}
      
      <Button className="w-full" onClick={() => create()}>Enregistrer</Button>
    </div>
  </div>
}

export function ControlesList() {
  const maybeProject = useCurrentProject();
  
  const fetchList: PromiseFn<Array<ControleDAO>> = async ({project}, _) => {
      return await window.cim.controles.list(project.id, {});
  };

  return <div className="p-2">
    <Breadcrumbs>
      <Link to="/">Home</Link>
      <span>Contrôles</span>
    </Breadcrumbs>
    <Option 
      value={maybeProject}
      onSome={(project) => <>
          <div className="mb-2">
              <Link to="/contrôles/create">Nouveau contrôle</Link>
          </div>
          <Async promiseFn={fetchList} project={project}>
            <Async.Fulfilled<Array<ControleDAO>>>{controles => 
              <StackedList>
              {controles.map(controle => ({
                key: controle.id,
                content: <Link to={`/contrôles/${controle.id}`}>{controle.année} - {controle.aiot.nom} - {controle.kind}</Link>, 
              }))}                    
              </StackedList>                       
            }</Async.Fulfilled>
        </Async>
      </>}
    />
  </div>
}