import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'

export const optionFromNullableString: (value: string | undefined | null) => O.Option<string> = FP.flow(
  O.fromNullable,
  O.filter((stringValue) => !!stringValue)
)
