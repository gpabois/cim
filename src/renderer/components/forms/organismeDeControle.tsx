import Form from "@app/components/form";
import { AdresseField } from "@app/components/forms/adresse";
import { OrganismeDeControleCreation } from "@interface/model/organismes_de_controle";
import { FormProvider, SubmitHandler, useForm, UseFormProps } from "react-hook-form";
import { Button } from "../button";

export interface OrganismeDeControleCreationFormProps {
  onSubmit?: SubmitHandler<OrganismeDeControleCreation>
}

export function OrganismeDeControleCreationForm(props: OrganismeDeControleCreationFormProps & UseFormProps<OrganismeDeControleCreation>) {
  const methods = useForm<OrganismeDeControleCreation>({defaultValues: props.defaultValues});
  const {register, handleSubmit, trigger} = methods;
  return <FormProvider {...methods}>
      <form onSubmit={props.onSubmit && handleSubmit(props.onSubmit)}>
      <Form.Input label="Nom" {...register("nom")}/>
      <AdresseField name="adresse"/>
      <Button className="w-full" onClick={trigger}>Enregistrer</Button>
  </form>
  </FormProvider>
}