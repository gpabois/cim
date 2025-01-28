import api from "@renderer/api";
import { Breadcrumbs } from "@renderer/components/breadcrumbs";
import { ControleAirCreationForm } from "@renderer/components/forms/contrôle";
import { guardCurrentProject } from "@renderer/guards/project";
import { ControleKind, ControleTypes } from "@shared/model/controle";
import { None, Optional } from "@shared/option";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

export function CreateControle() {
  const {id: projectId} = guardCurrentProject();
  const navigate = useNavigate();
  const [kind, setKind] = useState<Optional<ControleKind>>(None);

  /// Crée le contrôle
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