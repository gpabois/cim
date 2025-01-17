import { FieldPath, FieldValues, UseControllerProps} from "react-hook-form";
import { Input, MultiInput } from "@app/components/form";
import { useScopedFormContext } from "@app/hooks";

export interface AdresseFieldProps {
  label?: string
}

export function AdresseField<
  T extends FieldValues = FieldValues, 
  N extends FieldPath<T> = FieldPath<T>
>(props: UseControllerProps<T, N> & AdresseFieldProps) {
  const {register, name} = useScopedFormContext(props.name);

  return <>
    {props.label && <h2 className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{props.label}</h2>}
    <div>
        <MultiInput label="Lignes" name={name('lines')} />
        <Input label="Commune" {...register(`commune`)} />
        <Input label="Code postal" {...register(`codePostal`)} />
    </div>
  </>
}