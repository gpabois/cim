import { Input } from "../form";
import { FieldPath, FieldValues, UseControllerProps, useFormContext } from "react-hook-form";

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