import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "@app/store"
import { isSome, None } from "@interface/option"
import { useCallback } from "react"
import { useFormContext } from "react-hook-form"
import { scopedRegister } from "./utils"

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

export const useCurrentProject = function() {
    const maybeProjectId = useAppSelector((state) => state.projects.current);

    if(isSome(maybeProjectId)) {
        return {id: maybeProjectId}
    } else {
        return None
    }
}

export const useScopedFormContext = (scope: string) => {
  const context = useFormContext();
  return {
    ...context,
    register: scopedRegister(context.register, scope),
    name: (name) => `${scope}.${name}`
  }
}

export const useYupValidationResolver = <T>(validationSchema) =>
  useCallback(
    async (data: T) => {
      try {
        const values = await validationSchema.validate(data, {
          abortEarly: false,
        })

        return {
          values,
          errors: {},
        }
      } catch (errors: any) {
        return {
          values: {},
          errors: errors.inner.reduce(
            (allErrors, currentError) => ({
              ...allErrors,
              [currentError.path]: {
                type: currentError.type ?? "validation",
                message: currentError.message,
              },
            }),
            {}
          ),
        }
      }
    },
    [validationSchema]
  )

