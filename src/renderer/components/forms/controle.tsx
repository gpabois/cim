import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { ControleAirCreation, PointDeControleAir } from "@interface/model/controle/air";
import { Input, MultiInput } from "../form";
import { SelectAiotId } from "./aiot";
import { Button } from "../button";

export interface ControleAirCreationFormProps {
  defaultValues?: ControleAirCreation
  onSubmit?: SubmitHandler<ControleAirCreation>;
}

export function ControleAirCreationForm(props: ControleAirCreationFormProps) {
  const methods = useForm<ControleAirCreation>({defaultValues: props.defaultValues});
  const {register, handleSubmit} = methods;
  const submit = (form: ControleAirCreation) => props.onSubmit?.(form)

  return <FormProvider {...methods}>
    <form onSubmit={handleSubmit(submit)} className="space-y-2">
      <Input type="hidden" value="air" {...register("kind")} />
      <Input type="number" label="Année" {...register("année")}/>
      <SelectAiotId label="AIOT" name="codeAiot" />
      <Input type="submit" className="w-full" value="Enregistrer"/>
    </form>
  </FormProvider>
}

export interface PointDeControleAirCreationFormProps {
  onSubmit?: SubmitHandler<PointDeControleAir>
  onCancel?: () => void
}

export function PointDeControleAirCreation(props: PointDeControleAirCreationFormProps) {
  const methods = useForm<PointDeControleAir>();
  const {handleSubmit} = methods;

  const cancel = () => {
    props.onCancel?.();
  }
  
  const submit = (pdc: PointDeControleAir) => {
    props.onSubmit?.({...pdc, concentrations: [], conditionsRejet: [], flux: []})
  }

  return <FormProvider {...methods}>
    <form onSubmit={handleSubmit(submit)} className="space-y-2">
      <MultiInput label="Emissaires" name="émissaires"/>
      <div className="flex space-x-2">
        <Input type="submit" value="Enregistrer"></Input>
        <Button theme="danger" onClick={cancel}>Annuler</Button>
      </div>
    </form>
  </FormProvider>
}

export interface ConditionRejetAirFields
{
  withEditableResult?: boolean
}

export function ConditionRejetAirFields(_props: ConditionRejetAirFields) {
  return <></>
}



