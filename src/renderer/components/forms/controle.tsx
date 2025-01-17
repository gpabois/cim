import { Tabs } from "../tab";

export interface ControleAirCreationFieldsProps {}

export function ControleAirCreationFields(_props: ControleAirCreationFieldsProps) {
  return <></>
}

export interface PointDeControleAirFormProps{}

/// Formulaire pour les points de contrôle sur l'air.
export function PointDeControleAirForm(_props: PointDeControleAirFormProps) {

  return <>
    <Tabs>
      {[
        {
          id: "general",
          label: "Générales",
          content: <></>
        }, {
          id: "conditions-rejet",
          label: "Conditions de rejet",
          content: <></>
        }, {
          id: "concentrations",
          label: "Concentrations",
          content: <></>
        }, {
          id: "flux",
          label: "Flux",
          content: <></>
        }
      ]}
    </Tabs>
  </>
}

export interface ConditionRejetAirForm {
  withEditableResult?: boolean
}

export function ConditionRejetAirForm(_props: ConditionRejetAirForm) {
  return <></>
}



