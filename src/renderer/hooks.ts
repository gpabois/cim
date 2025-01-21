import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "@app/store"
import { isSome, None, Optional } from "@interface/option"
import { useCallback, useEffect, useMemo, useState } from "react"
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

export interface AsyncState<T, Args> {
  data: Optional<T>,
  error: Optional,
  run: (args: Args) => void,
  isPending: boolean,
  isRejected: boolean,
  isResolved: boolean
}

export function useAsync<T, Args=any>(promiseFn: (args: Args) => Promise<T>, args: Args): AsyncState<T, Args> {
  const [data, setData] = useState<Optional<T>>(None);
  const [error, setError] = useState<Optional<any>>(None);
  const [status, setStatus] = useState("initial");

  const isPending = useMemo(() => status === "pending", [status]);
  const isResolved = useMemo(() => status === "resolved", [status]);
  const isRejected = useMemo(() => status === "rejected", [status]);

  const run = async (args: Args) => {
    setStatus("pending");
    
    promiseFn(args)
      .then((data) => setData(data))
      .then(_ => setStatus("resolved"))
      .catch(error => setError(error))
      .catch(_ => setStatus("rejected"));
  }

  useEffect(() => {
    run(args);
  }, [])

  return {
    data,
    error,
    run,
    isPending,
    isRejected,
    isResolved
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

