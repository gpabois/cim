import * as yup from 'yup'

export interface Contact {
  genre: "homme" | "femme" | "NSP",
  nom: string,
  prénom?: string,
  fonction?: string,
  courriel?: string,
  téléphone?: string
}

export const contactGenres: Array<Contact["genre"]> = ["homme", "femme", "NSP"];

export const contactSchema = yup.object<Contact>({
  nom: yup.string().required(),
  genre: yup.string().oneOf(contactGenres).required(),
  prénom: yup.string(),
  fonction: yup.string(),
  courriel: yup.string().email(),
  téléphone: yup.string()
})

export function defaultContact() {
  return {
    nom: "",
  }
}
