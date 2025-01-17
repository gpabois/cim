import { Breadcrumbs } from "@app/components/breadcrumbs";
import { guardCurrentProject } from "@app/guards/project";
import { ServiceCreation } from "@interface/model/services";
import { Link, useNavigate } from "react-router";

/// Créée un nouvel AIOT.
export function CreateService() {
  const navigate = useNavigate();
  const currentProject = guardCurrentProject();

  const create = async (form: ServiceCreation) => {
    await window.cim.services.create(currentProject.id, form);
    navigate(`/services`);
  }

  return <div className="p-2">
    <Breadcrumbs>
      <Link to="/">Home</Link>
      <Link to="/services">Services</Link>
      <span>Nouveau</span>
    </Breadcrumbs>
    <div className="space-y-2">
      <AiotCreationForm defaultValues={form} onSubmit={create}/>
    </div>
  </div>
}