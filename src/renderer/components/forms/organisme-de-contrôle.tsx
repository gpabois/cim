import Form from "@renderer/components/form";
import { AdresseField } from "@renderer/components/forms/adresse";
import { OrganismeDeControleCreation } from "@shared/model/organismes-de-controle";
import { FormProvider, SubmitHandler, useForm, UseFormProps } from "react-hook-form";

export interface OrganismeDeControleCreationFormProps {
  onSubmit?: SubmitHandler<OrganismeDeControleCreation>
}

export function OrganismeDeControleCreationForm(props: OrganismeDeControleCreationFormProps & UseFormProps<OrganismeDeControleCreation>) {
  const methods = useForm<OrganismeDeControleCreation>({defaultValues: props.defaultValues});
  const {register, handleSubmit} = methods;
  return <FormProvider {...methods}>
    <form onSubmit={props.onSubmit && handleSubmit(props.onSubmit)} className="space-y-2">
      <Form.Input label="Nom" {...register("nom")}/>
      <AdresseField label="Adresse" name="adresse"/>
      <Form.Input type="submit" className="w-full" value={"Enregistrer"}/>
  </form>
  </FormProvider>
}