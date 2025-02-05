import { Condition } from "@shared/model/condition";
import {  Input, RhfSelect } from "../form";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";

export interface ConditionFormProps {
  defaultValues?: Condition,
  onSubmit?: SubmitHandler<Condition>
}

export function ConditionForm(props: ConditionFormProps) {
  const methods = useForm<Condition>({defaultValues: props.defaultValues})
  const submit = (form) => props.onSubmit?.(form)

  return <FormProvider {...methods}>
    <form onSubmit={methods.handleSubmit(submit)} className="flex flex-row items-center space-x-1">
      <Input label="Valeur" {...methods.register("param.valeur")}/>
      <Input label="Unité" {...methods.register("param.unité")}/>
      <RhfSelect label="Type" {...methods.register("kind")} transform={(v) => ({label: v, value: v})} options={["MAX", "MIN", "REF"]}></RhfSelect>
      <Input type="submit" value="Enregistrer"/>
    </form>
  </FormProvider>
}