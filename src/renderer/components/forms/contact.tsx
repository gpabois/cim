import { Contact, contactSchema, contactToString } from "@shared/model/contact";
import { Input, Select } from "../form";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { Button } from "../button";
import {BiEdit, BiFemaleSign, BiMaleSign, BiQuestionMark  } from "react-icons/bi"
import { useYupValidationResolver } from "@renderer/hooks";
import { useState } from "react";
import { isSome } from "@shared/option";
import { IoMail, IoPhonePortrait } from "react-icons/io5";

export interface EditableContactProps {
  value?: Contact
  onSubmit?: (contact: Contact) => void
}

export function EditableContact(props: Omit<ContactFormProps, "defaultValues"> & EditableContactProps) {
  type ModeKind = "edit" | "view";
  const [mode, setMode] = useState<ModeKind>("view");
  const contact = props.value;

  const submit = (contact: Contact) => {
    props.onSubmit?.(contact);
    setMode("view");
  }

  if(mode == "view") {
    if (isSome(contact)) {
      return <div>
        <div className="flex flex-row space-x-2 font-semibold">
          <span>{contactToString(contact)}</span>
          <Button theme="barebone" size="sm" onClick={() => setMode("edit")}><BiEdit /></Button>
        </div>
        <div className="flex space-x-2 items-center text-gray-600 text-xs">
          {contact.courriel && <span className="flex items-center space-x-2"><IoMail/> <a href={`mailto:${contact.courriel}`}>{contact.courriel}</a></span>}
          {contact.téléphone && <span className="flex items-center space-x-2"><IoPhonePortrait/> {contact.téléphone}</span>}
        </div>
      </div>
    } else {
      return <div className="flex items-center space-x-2">
        <span>N/D</span>
        <Button theme="barebone" size="sm" onClick={() => setMode("edit")}><BiEdit /></Button>
      </div>
    }
  } else {
    return <ContactForm 
      defaultValues={contact} 
      choices={props.choices}
      onCancel={() => setMode("view")} onSubmit={submit}></ContactForm>
  }
}

export interface ContactFormProps {
  defaultValues?: Contact,
  onSubmit?: SubmitHandler<Contact>
  choices?: Array<Contact>
  onCancel?: () => void
}


export function ContactForm(props: ContactFormProps) {
  const resolver = useYupValidationResolver(contactSchema);
  const methods = useForm<Contact>({resolver, defaultValues: props.defaultValues});
  const {register, handleSubmit, setValue} = methods;
  const cancel = () => props?.onCancel?.();
  
  const submit = (contact: Contact) => {
    props.onSubmit?.(contact);
  };

  const updateFromList = (contact: Contact) => {
    setValue("nom", contact.nom);
    setValue("prénom", contact.prénom);
    setValue("genre", contact.genre);
    setValue("fonction", contact.fonction);
    setValue("courriel", contact.courriel);
    setValue("téléphone", contact.téléphone);
  }

  return <FormProvider {...methods}>
    <form onSubmit={handleSubmit(submit)} className="space-y-2">
      {props.choices &&
        <Select 
          options={props.choices} 
          transform={(contact) => ({label: contactToString(contact), value: contact})}
          onChange={updateFromList}
        />
      }
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
