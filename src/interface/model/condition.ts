import { Paramètre, defaultParamètre } from "@interface/model/paramètre";

export interface Condition {
    param: Paramètre,
    kind: "MAX" | "MIN" | "REF"
}

export function defaultCondition(): Condition {
  return {
    param: defaultParamètre(),
    kind: "REF"
  }
}