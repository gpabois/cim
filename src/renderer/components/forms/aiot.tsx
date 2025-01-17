import axios from "axios";
import { AsyncSelect, Input } from "../form";
import { isNone, isSome, Optional } from "@interface/option";
import { AdresseField } from "./adresse";
import { guardCurrentProject } from "@app/guards/project";
import { AiotCreation, aiotCreationSchema } from "@interface/model/aiots";
import { FieldValues, FormProvider, SubmitHandler, UseControllerProps, useForm, UseFormProps, useWatch } from "react-hook-form";
import { Button } from "../button";
import { useYupValidationResolver } from "@app/hooks";

export interface AiotSelectionProps {
  label?: string
}
export function SelectAiot<T extends FieldValues>(props: UseControllerProps<T> & AiotSelectionProps) {
  const project = guardCurrentProject();

  const fetchAiots = async (search: string) => {
    return await window.cim.aiots.list(project.id, {
      filter: {
        $or: [
          {codeAiot: {$like: search}}, 
          {nom: {$like: search}}
        ]
      }
    })
  }

  return <AsyncSelect
    name={props.name}
    label={props.label}
    loadOptions={fetchAiots} 
    transform={(aiot) => ({label: `${aiot.nom} (${aiot.codeAiot})`, value: aiot})}
  />
}

export interface AiotCreationFormProps {
  onSubmit?: SubmitHandler<AiotCreation>
}

export function AiotCreationForm(props: AiotCreationFormProps & UseFormProps<AiotCreation>) {
  const resolver = useYupValidationResolver(aiotCreationSchema);
  const methods = useForm<AiotCreation>({resolver, defaultValues: props.defaultValues});
  const {register, control, setValue, handleSubmit, trigger} = methods;

  /// Précharge le formulaire à partir du code aiot depuis Géorisques.
  const prefillFromGeorisques = async (codeAiot: Optional<string>) => {
    if (isNone(codeAiot)) {
        return;
    }

    const resp = await axios.get(`https://georisques.gouv.fr/api/v1/installations_classees`, {
        params: {
            page: 1,
            page_size: 10,
            codeAIOT: codeAiot
        }
    });

    const results = resp.data.data;
    
    if(results.length > 0) {
      const result = results[0];
      
      setValue("adresse", {
        lines: [
            result.adresse1, 
            result.adresse2, 
            result.adresse3
        ].filter((line) => isSome(line) && line.length > 0),
        commune: result.commune,
        codePostal: result.codePostal
      });

      setValue("nom", result.raisonSociale);
    }
  }

  const codeAiot = useWatch({control, name: "codeAiot", defaultValue: ""});

  return <FormProvider {...methods}>
    <form onSubmit={props.onSubmit && handleSubmit(props.onSubmit)}>
      <Input label="Code AIOT" {...register("codeAiot")}
        buttons={[
          {
            key: "prefill-from-georisques",
            content: "Pré-remplir depuis Géorisques",
            onClick: () => prefillFromGeorisques(codeAiot)
          }
        ]}
      />

      <Input label="Raison sociale" {...register("nom")} />
      <AdresseField label="Adresse de l'établissement" name="adresse"/>
      <Button className="w-full" onClick={trigger}>Enregistrer</Button>
    </form>
  </FormProvider>
}