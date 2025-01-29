import axios from "axios";
import { AsyncSelect, Input } from "../form";
import { isNone, isSome, Optional } from "@shared/option";
import { AdresseField } from "./adresse";
import { guardCurrentProject } from "@renderer/guards/project";
import { AiotCreation, aiotCreationSchema } from "@shared/model/aiots";
import { FieldValues, FormProvider, SubmitHandler, UseControllerProps, useForm, UseFormProps, useWatch } from "react-hook-form";
import { useYupValidationResolver } from "@renderer/hooks";
import { useTranslation } from "react-i18next";
import api from "@renderer/api";

export interface AiotSelectionProps {
  label?: string
}
export function SelectAiotId<T extends FieldValues>(props: UseControllerProps<T> & AiotSelectionProps) {
  const {id: projectId} = guardCurrentProject();

  const fetch = async (search: string) => {
    return await api.aiots.list(projectId, {
      filter: {
        $or: [
          { codeAiot: { $like: search } },
          { nom: { $like: search } }
        ]
      }
    })
  }

  return <AsyncSelect
    name={props.name}
    label={props.label}
    loadOptions={fetch}
    transform={(aiot) => ({ label: `${aiot.nom} (${aiot.codeAiot})`, value: aiot.codeAiot })}
  />
}

export interface AiotCreationFormProps {
  onSubmit?: SubmitHandler<AiotCreation>
}

export function AiotCreationForm(props: AiotCreationFormProps & UseFormProps<AiotCreation>) {
  const { t } = useTranslation();
  const resolver = useYupValidationResolver(aiotCreationSchema);
  const methods = useForm<AiotCreation>({ resolver, defaultValues: props.defaultValues });
  const { register, control, setValue, handleSubmit } = methods;

  /// Précharge le formulaire à partir du code aiot depuis Géorisques.
  const completeFromGeorisques = async (codeAiot: Optional<string>) => {
    if (isNone(codeAiot)) {
      return;
    }

    const resp = await axios.get(`https://georisques.gouv.fr/api/v1/installations_classees`, {
      params: {
        page: 1,
        page_size: 10,
        codeAIOT: codeAiot
      }
    });

    const results = resp.data.data;

    if (results.length > 0) {
      const result = results[0];

      setValue("adresse", {
        lines: [
          result.adresse1,
          result.adresse2,
          result.adresse3
        ].filter((line) => isSome(line) && line.length > 0),
        commune: result.commune,
        codePostal: result.codePostal
      });

      setValue("nom", result.raisonSociale);
    }
  }

  const codeAiot = useWatch({ control, name: "codeAiot", defaultValue: "" });

  const submit = (form) => props.onSubmit?.(form);

  return <FormProvider {...methods}>
    <form onSubmit={handleSubmit(submit)} className="space-y-2">
      {JSON.stringify(methods.formState.errors)}
      <Input label="Code AIOT" {...register("codeAiot")}
        buttons={[
          {
            key: "complete-from-georisques",
            content: t("CompleteFromGeorisques"),
            onClick: () => completeFromGeorisques(codeAiot)
          }
        ]}
      />

      <Input label="Raison sociale" {...register("nom")} />
      <AdresseField label="Adresse de l'établissement" name="adresse" />
      <Input className="w-full" type="submit" value={t("Save")}></Input>
    </form>
  </FormProvider>
}
