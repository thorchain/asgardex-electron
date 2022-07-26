import * as AP from 'fp-ts/lib/Apply'
import * as FP from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import * as O from 'fp-ts/Option'

// Note: Since `TE.taskEither` is deprecated, use `TE.ApplySey` in `sequenceT`
// @see https://github.com/gcanti/fp-ts/issues/1491#issuecomment-889976079
export const sequenceTTaskEither = AP.sequenceT(TE.ApplySeq)

export const optionFromNullableString = O.fromPredicate<string | undefined | null, string>((s): s is string => !!s)

export const integerFromNullableString = (s?: string | null): O.Option<number> =>
  FP.pipe(s, optionFromNullableString, O.map(parseInt), O.chain(O.fromPredicate((v) => !isNaN(v))))

export const naturalNumberFromNullableString = (s?: string | null): O.Option<number> =>
  FP.pipe(s, integerFromNullableString, O.chain(O.fromPredicate((v) => v >= 0)))
