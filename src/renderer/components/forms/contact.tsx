import { Contact, contactSchema } from "@interface/model/contact";
import { Input } from "../form";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { Button } from "../button";
import {BiFemaleSign, BiMaleSign, BiQuestionMark  } from "react-icons/bi"
import { useYupValidationResolver } from "@app/hooks";

export interface ContactFormProps {
  defaultValues?: Contact,
  onSubmit?: SubmitHandler<Contact>
  onCancel?: () => void
}

export function ContactForm(props: ContactFormProps) {
  const resolver = useYupValidationResolver(contactSchema);
  const methods = useForm<Contact>({resolver, defaultValues: props.defaultValues});
  const {register, handleSubmit} = methods;
  const cancel = () => props?.onCancel?.();
  
  const submit = (contact: Contact) => {
    console.log(contact);
    props.onSubmit?.(contact);
  };

  return <FormProvider {...methods}>
    <form onSubmit={handleSubmit(submit)} className="space-y-2">
      <div className="flex flex-row space-x-2 items-center">
        <div className="flex flex-row space-x-2">
          <Input type="radio" label={<BiFemaleSign/>} value="femme" {...register("genre")}></Input>
          <Input type="radio" label={<BiMaleSign/>} value="homme" {...register("genre")}></Input>
          <Input type="radio" label={<BiQuestionMark/>} value="NSP" {...register("genre")}></Input>
        </div>
        <Input className="flex-1" label="Prénom" {...register("prénom") }/>
        <Input className="flex-1"  label="Nom" {...register("nom") }/>
      </div>
      <Input label="Fonction" {...register("fonction")}/>
      <Input label="Courriel" {...register("courriel")}/>
      <Input label="Téléphone" {...register("téléphone")}/>  
      <div className="flex flex-row space-x-2">
        <Input type="submit" value="Enregistrer"/>
        <Button onClick={cancel} theme="danger">Annuler</Button>
      </div>
    </form>
  </FormProvider>
}
