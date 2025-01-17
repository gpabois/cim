import { guardCurrentProject } from "@app/guards/project";
import { AsyncSelect, Input } from "../form";
import { FormProvider, SubmitHandler, useForm, useFormContext } from "react-hook-form";
import { useYupValidationResolver } from "@app/hooks";
import { ServiceCreation, serviceCreationSchema } from "@interface/model/services";
import { Button } from "../button";

export interface SelectServiceProps {
  name: string,
  onChange?: (Service) => void,
  label?: string
}

export function SelectService(props: SelectServiceProps) {
  const project = guardCurrentProject();
  const {register} = useFormContext();
  const fetch = async (search: string) => {
    return await window.cim.services.list(project.id, {
      filter: {
        $or: [
          {id: {$like: search}}, 
          {nom: {$like: search}}
        ]
      }
    })
  }

  return <AsyncSelect
    {...register(props.name)}
    label={props.label}
    loadOptions={fetch} 
    transform={({id: value, nom: label}) => ({label, value})}
  />
}

export interface ServiceCreationFormProps {
  defaultValues?: ServiceCreation,
  onSubmit?: SubmitHandler<ServiceCreation>
}

export function ServiceCreationForm(props: ServiceCreationFormProps) {
    const resolver = useYupValidationResolver(serviceCreationSchema);
    const methods = useForm<ServiceCreation>({resolver, defaultValues: props.defaultValues});
    const {register, handleSubmit, trigger} = methods;

    return <FormProvider {...methods}>
      <form onSubmit={props.onSubmit && handleSubmit(props.onSubmit)}>
        <Input label="Nom" {...register("nom")} />
        <Button className="w-full" onClick={trigger}>Enregistrer</Button>
      </form>
    </FormProvider>
}

