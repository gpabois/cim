import { Condition } from "@shared/model/condition";
import { FaWind } from "react-icons/fa6"
import { IoWaterSharp } from "react-icons/io5"

export function ControleSymbol(props: {kind: "air" | "eau"}) {
  if(props.kind == "air") {
    return <FaWind/>
  } else {
    return <IoWaterSharp/>
  }
}

export function ConditionSymbol(props: {kind: Condition["kind"]}) {
  if(props.kind == "MAX") return "<=";
  if(props.kind == "MIN") return ">=";
  return "~"
}