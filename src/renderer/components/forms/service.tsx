import { guardCurrentProject } from "@app/guards/project";
import { AsyncSelect, Input } from "../form";
import { FormProvider, SubmitHandler, useForm, useFormContext } from "react-hook-form";
import { useYupValidationResolver } from "@app/hooks";
import { ServiceCreation, serviceCreationSchema, ServiceTypes } from "@interface/model/services";
import { useTranslation } from "react-i18next";

export interface SelectServiceProps {
  name: string,
  onChange?: (service: ServiceTypes["id"]) => void,
  label?: string
}

export function SelectService(props: SelectServiceProps) {
  const project = guardCurrentProject();
  const { register } = useFormContext();
  const fetch = async (search: string) => {
    return await window.cim.services.list(project.id, {
      filter: {
        $or: [
          { id: { $like: search } },
          { nom: { $like: search } }
        ]
      }
    })
  }

  return <AsyncSelect
    {...register(props.name)}
    label={props.label}
    loadOptions={fetch}
    transform={({ id: value, nom: label }) => ({ label, value })}
  />
}

export interface ServiceCreationFormProps {
  defaultValues?: ServiceCreation,
  onSubmit?: SubmitHandler<ServiceCreation>
}

export function ServiceCreationForm(props: ServiceCreationFormProps) {
  const { t } = useTranslation();
  const resolver = useYupValidationResolver(serviceCreationSchema);
  const methods = useForm<ServiceCreation>({ resolver, defaultValues: props.defaultValues });
  const { register, handleSubmit } = methods;

  const submit = (service: ServiceCreation) => props.onSubmit?.(service);

  return <FormProvider {...methods}>
    <form onSubmit={handleSubmit(submit)} className="space-y-2">
      <Input label="Nom" {...register("nom")} />
      <Input type="button" value={t("Save")}></Input>
    </form>
  </FormProvider>
}

