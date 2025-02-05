import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { ConditionRejetAir, ControleAirCreation, PointDeControleAir } from "@shared/model/controle/air";
import { Input, MultiInput, RhfSelect } from "../form";
import { SelectAiotId } from "./aiot";
import { Button } from "../button";

export interface ControleAirCreationFormProps {
  defaultValues?: ControleAirCreation
  onSubmit?: SubmitHandler<ControleAirCreation>;
}

// Formulaire pour créer un contrôle inopiné sur l'air
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

// Formulaire pour créer un point de contrôle sur l'air.
export function PointDeControleAirCreationForm(props: PointDeControleAirCreationFormProps) {
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

export interface UpdateEmissairesFormProps {
  defaultValues: Pick<PointDeControleAir, "émissaires">,
  onSubmit?: (form: Pick<PointDeControleAir, "émissaires">) => void
}

export const UpdateEmissairesForm = (props: UpdateEmissairesFormProps) => {
  const methods = useForm<Pick<PointDeControleAir, "émissaires">>({defaultValues: props.defaultValues});
  
  const submit = async (form) => {
    props.onSubmit?.(form)
  }

  return <FormProvider {...methods}>
    <form onSubmit={methods.handleSubmit(submit)} className="space-y-2">
      <MultiInput label="Emissaires" name="émissaires"/>
      <Input type="submit" value="Enregistrer"/>
    </form>
  </FormProvider>    
};  

export interface ConditionRejetAirCreationForm {
  onSubmit?: (ConditionRejetAir) => void;
}

export const ConditionRejetAirCreationForm = (props: ConditionRejetAirCreationForm) => {
  const methods = useForm<ConditionRejetAir>();
  const {register, handleSubmit} = methods;

  const submit = async (form) => {
    props.onSubmit?.(form);
  };

  return <FormProvider {...methods}>
    <form onSubmit={handleSubmit(submit)} className="space-y-2">
      <Input label="Nom" {...register("nom")}/>
      <div className="flex space-x-2">
        <Input className="flex-1" label="Valeur" {...register("exigence.param.valeur")}></Input>
        <Input className="flex-1" label="Unité" {...register("exigence.param.unité")}></Input>
      </div>
      <RhfSelect label="Type" {...register("exigence.kind")} transform={(v) => ({label: v, value: v})} options={["MAX", "MIN", "REF"]}></RhfSelect>
      <Input type="submit" value="Enregistrer"/>
    </form>
  </FormProvider>
}



