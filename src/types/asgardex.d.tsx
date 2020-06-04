// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FixmeType = any

// Very simple way to provide a `Maybe` thing
// Again, it's not a Monad or so, just a very simple TS type :)
export type Nothing = null | undefined
export const Nothing = null as Nothing
export type Maybe<T> = T | Nothing

export type Pair = {
  source: Maybe<string>
  target: Maybe<string>
}
