import { Condition, defaultCondition } from "@interface/model/condition";
import { BaseFieldProps, Select } from "../form";
import { ParamètreField } from "./paramètre";
import { useFields } from "@app/hooks";

export interface ConditionFormProps extends BaseFieldProps<Condition> {}

export function ConditionForm(props: ConditionFormProps) {
  const {form, updateForm} = useFields(props, defaultCondition);

  return <>
    <ParamètreField label="Paramètre" value={form.param} onChange={param => updateForm(form => ({...form, param}))}/>
    <Select 
      label="Nature"
      options={["MIN", "MAX", "REF"]}
      transform={e => ({label: e, value: e})} 
      onChange={kind => updateForm(form => ({...form, kind: kind?.value as Condition['kind']}))}>
    </Select>
  </>
}