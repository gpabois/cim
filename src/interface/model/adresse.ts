import * as yup from 'yup'

export interface Adresse {
    lines: Array<string>,
    commune: string,
    codePostal: string
}

export const adresseSchema = yup.object({
  lines: yup.array(yup.string()).required(),
  commune: yup.string().required(),
  codePostal: yup.string().required().matches(/^[0-9]\d{5}$/g)
})

export function defaultAdresse(): Adresse {
    return {
        lines: [],
        commune: "",
        codePostal: ""
    }
}
