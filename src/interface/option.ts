export type Optional<T=any> = T | undefined | null;

export const None = undefined;

export function isNone<T>(value: Optional<T>): boolean {
    return value === undefined || value === null
}

export function isSome<T>(value: Optional<T>): value is T {
    return !isNone(value)
}

export function mapSome<T, U>(value: Optional<T>, mapper: (T) => U): Optional<U> {
    if(isSome(value)) return mapper(value);
    return None
}