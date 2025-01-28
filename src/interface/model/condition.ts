import { Paramètre, defaultParamètre } from "./paramètre";

export interface Condition {
    param: Paramètre,
    kind: "MAX" | "MIN" | "REF"
}

export type ConditionKind = Condition["kind"];

export function defaultCondition(): Condition {
  return {
    param: defaultParamètre(),
    kind: "REF"
  }
}