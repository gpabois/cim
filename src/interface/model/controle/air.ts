import { BaseControleFields, defaultBaseControleCreation } from ".";
import { Condition, defaultCondition } from "../condition";
import { Paramètre } from "../paramètre";

export interface ControleAirFields extends BaseControleFields {
    points: Array<PointDeControleAir>
}

export type ControleAirCreation = Omit<ControleAirFields, "id">;

export interface ControleAirData extends BaseControleFields {

}

export function defaultControleAirCreation(): ControleAirCreation {
  return {
    ...defaultBaseControleCreation(),
    kind: "air",
    points: []
  }
}

export interface PointDeControleAir {
    émissaires: Array<string>,
    teneurOxygène?: string,
    conditionsRejet:  Array<ConditionRejetAir>,
    flux: Array<ConditionRejetAir>,
    concentrations: Array<ConditionRejetAir>,
}

export function defaultPointDeControleAir(): PointDeControleAir {
  return {
    émissaires: [],
    teneurOxygène: "N/A",
    conditionsRejet: [],
    flux: [],
    concentrations: []
  }
}

export interface ConditionRejetAir {
  nom: string, 
  exigence: Condition, 
  résultat?: Paramètre
};

export function defaultConditionRejetAir(): ConditionRejetAir {
  return {
    nom: "",
    exigence: defaultCondition(),
  }
}
