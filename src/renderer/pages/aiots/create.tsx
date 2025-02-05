import api from "@renderer/api";
import { Breadcrumbs } from "@renderer/components/breadcrumbs";
import { AiotCreationForm } from "@renderer/components/forms/aiot";
import { guardCurrentProject } from "@renderer/guards/project";
import { AiotCreation, defaultAiotCreation } from "@shared/model/aiots";
import { Link, useNavigate } from "react-router";

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