import { AsyncState } from "@renderer/hooks";

export interface AsyncPendingProps<T, Args> {
  state: AsyncState<T, Args>,
  children: React.ReactNode
}

export function AsyncPending<T, Args>(props: AsyncPendingProps<T, Args>) {
  if(props.state.isPending) {
    return props.children
  } else {
    return <></>
  }
}

export interface AsyncResolvedProps<T, Args=any> {
  state: AsyncState<T, Args>,
  children: (data: T) => React.ReactNode
}
export function AsyncResolved<T>(props: AsyncResolvedProps<T>) {
  if(props.state.isResolved) {
    return props.children(props.state.data as T)
  } else {
    return <></>
  }
}