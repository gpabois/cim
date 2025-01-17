import { Button } from "@app/components/button";
import { OrganismeDeControleCreationForm } from "@app/components/forms/organismeDeControle";
import { StackedList } from "@app/components/stackedList";
import { guardCurrentProject } from "@app/guards/project";
import { defaultOrganismeDeControleCreation, OrganismeDeControleCreation } from "@interface/model/organismes_de_controle";
import { useState } from "react";
import { useNavigate } from "react-router";

export function CreateOrganismeDeControle() {
    const navigate = useNavigate();
    const currentProject = guardCurrentProject();
    const [form, updateForm] = useState<OrganismeDeControleCreation>(defaultOrganismeDeControleCreation());

    const create = function(form: OrganismeDeControleCreation) {
        window.cim.organismeDeControles
        .new(currentProject.id, form)
        .then((id) => {
            navigate(`/organismesDeControle/${id}`);
        })
    }

    return <>
        <OrganismeDeControleCreationForm value={form} onChange={updateForm}/>
        <Button onClick={() => create(form)}>Enregistrer</Button>
    </>
}

export function OrganismesDeControleList() {
  const currentProject = guardCurrentProject();

  return <StackedList>
    {[]}
  </StackedList>
}