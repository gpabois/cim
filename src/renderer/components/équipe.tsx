import { Contact } from "@interface/model/contact";
import { isNone, None } from "@interface/option";
import { useState } from "react";
import { BiEdit, BiSolidAddToQueue } from "react-icons/bi";
import { Button } from "./button";
import { StackedList } from "./stackedList";
import { ContactForm } from "./forms/contact";

export interface EquipeDetailsProps {
  équipe: Array<Contact>,
  addContactFn: (contact: Contact) => Promise<void>,
  updateContactFn: (contactId: number, contact: Contact) => Promise<void>,
  removeContactFn: (contactId: number) => Promise<void>
}

export function EquipeDetails(props: EquipeDetailsProps) {
  const { équipe } = props;
  const [mode, setMode] = useState<{ kind: "Nouveau" } | { kind: "Edition", index: number } | undefined>(None);

  const addContact = async (contact: Contact) => {
    await props.addContactFn(contact);
    setMode(None);
  }

  const updateContact = (index: number) => (async (contact: Contact) => {
    await props.updateContactFn(index, contact);
    setMode(None);
  })

  return <>
    <Button size="sm" theme="barebone" onClick={() => setMode({ kind: "Nouveau" })}><BiSolidAddToQueue /></Button>
    {isNone(mode) && <StackedList>
      {équipe.map((contact, index) => ({
        key: contact.nom,
        content: <div className="flex flex-row space-x-2">
          <span>{contact.genre == "homme" && "M."}{contact.genre == "femme" && "Mme."} {`${contact.prénom ? `${contact.prénom} ` : ""}${contact.nom} - ${contact.fonction}`}</span>
          <Button theme="barebone" size="sm" onClick={() => setMode({ kind: "Edition", index })}><BiEdit /></Button>
        </div>,
        subcontent: <div className="flex space-x-2 items-center">
          {contact.courriel && <span>@: <a href={`mailto:${contact.courriel}`}>{contact.courriel}</a></span>}
          {contact.téléphone && <span>Tél: {contact.téléphone}</span>}
        </div>
      }))}
    </StackedList>
    }
    {mode?.kind == "Edition" && <ContactForm defaultValues={props.équipe[mode.index]} onSubmit={updateContact(mode.index)} onCancel={() => setMode(None)} />}
    {mode?.kind == "Nouveau" && <ContactForm onSubmit={addContact} onCancel={() => setMode(None)} />}
  </>
}