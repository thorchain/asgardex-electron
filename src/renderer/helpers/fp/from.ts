import * as O from 'fp-ts/Option'

export const optionFromNullableString = O.fromPredicate<string | undefined | null, string>((s): s is string => !!s)
