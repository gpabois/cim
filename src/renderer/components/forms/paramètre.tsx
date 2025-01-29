import { Paramètre } from "@shared/model/paramètre";
import { Input } from "../form";
import { FieldPath, FieldValues, FormProvider, SubmitHandler, UseControllerProps, useForm, useFormContext } from "react-hook-form";

export interface ParamètreFieldProps {
  label?: string
}

export function ParamètreField<
  T extends FieldValues = FieldValues, 
  N extends FieldPath<T> = FieldPath<T>
>(props: UseControllerProps<T, N> & ParamètreFieldProps) {
  const {register} = useFormContext();

  return <div className="flex flex-row space-x-2 w-full">
    <Input label="Valeur" {...register(`${props.name}.valeur`)} />
    <Input label="Unité" {...register(`${props.name}.unité`)} />
  </div>
}

export interface ParamètreFormProps {
  onSubmit?: SubmitHandler<Paramètre>,
  defaultValues?: Paramètre
}

export function ParamètreForm(props: ParamètreFormProps) {
  const methods = useForm<Paramètre>({defaultValues: props.defaultValues});
  const submit = (form) => props.onSubmit?.(form)

  return <FormProvider {...methods}>
    <form onSubmit={methods.handleSubmit(submit)}>
      <Input label="Valeur" {...methods.register(`valeur`)} />
      <Input label="Unité" {...methods.register(`unité`)} />  
      <Input type="submit" value="Enregistrer"></Input>
    </form>
  </FormProvider>
}