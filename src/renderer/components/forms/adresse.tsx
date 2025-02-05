import { FieldPath, FieldValues, FormProvider, UseControllerProps, useForm} from "react-hook-form";
import { Input, MultiInput } from "@renderer/components/form";
import { useScopedFormContext } from "@renderer/hooks";
import { Adresse } from "@shared/model/adresse";
import { useState } from "react";
import { Button } from "../button";
import { BiEdit } from "react-icons/bi";
import { isSome } from "@shared/option";

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
        <div className="p-2 border border-gray-200 rounded">
          <MultiInput label="Lignes" name={name('lines')} />
          <Input label="Commune" {...register(`commune`)} />
          <Input label="Code postal" {...register(`codePostal`)} />
        </div>
    </div>
  </>
}

export interface EditableAdresseProps {
  defaultValues?: Adresse
  onSubmit?: (adresse: Adresse) => void
}

export function EditableAdresse(props: EditableAdresseProps) {
  type ModeKind = "edit" | "view";
  const [mode, setMode] = useState<ModeKind>("view");

  const submit = (adresse: Adresse) => {
    props.onSubmit?.(adresse);
    setMode("view")
  }

  if(mode == "view") {

    if(isSome(props.defaultValues)) {
        const adresse = props.defaultValues;
        return <div className="flex flex-col">
        <Button theme="barebone" onClick={() => setMode("edit")}><BiEdit/></Button>
        {adresse.lines.map((line) => <span key={line}>{line}</span>)}
        <span>{adresse.commune} ({adresse.codePostal})</span>

      </div>
    } else {
      return <div>
        N/D <Button theme="barebone" onClick={() => setMode("edit")}><BiEdit/></Button>
      </div>
    }

  } else {
    return <AdresseForm onSubmit={submit} defaultValues={props.defaultValues}>
      <Button theme="danger" onClick={() => setMode("view")}>Annuler</Button>
    </AdresseForm>
  }
}

export interface AdresseFormProps {
  defaultValues?: Adresse
  onSubmit?: (adresse: Adresse) => void
  children?: React.ReactNode
}

export function AdresseForm(props: AdresseFormProps) {
  const methods = useForm<Adresse>({defaultValues: props.defaultValues});

  const submit = (adresse: Adresse) => {
    props.onSubmit?.(adresse)
  }

  return <FormProvider {...methods}>
    <form onSubmit={methods.handleSubmit(submit)}>
        <MultiInput label="Lignes" name={"lines"} />
        <Input label="Commune" {...methods.register(`commune`)} />
        <Input label="Code postal" {...methods.register(`codePostal`)} />
        <div className="flex space-x-2 pt-2">
          <Input type="submit" value="Enregistrer"/>
          {props.children}
        </div>
    </form>
  </FormProvider>
}