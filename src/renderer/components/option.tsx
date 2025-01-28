import { isSome as isSome, Optional } from "@shared/option";
import { Navigate } from "react-router";

export interface OptionProps<T> {
    value: Optional<T>,
    onSome?: (value: T) => React.ReactNode
    onNone?: () => React.ReactNode
}

export function Option<T>(props: OptionProps<T>) {
    if (isSome(props.value)) {
        return props.onSome?.(props.value) || <></>;
    } else {
        return props.onNone?.() || <></>;
    }
}

/// Redirige si la valeur est absente.
export function OptionGuard<T>(props: {value: Optional<T>, children: (arg: T) => React.ReactNode, redirect: string}) {
    return <Option<T>
        value={props.value} 
        onSome={props.children} 
        onNone={() => <Navigate to={props.redirect}/>}>

    </Option>
}
