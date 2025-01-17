export interface Paramètre {
    valeur: number,
    unité: string,
}

export function defaultParamètre(): Paramètre {
  return {
    unité: "",
    valeur: 0
  }
}
