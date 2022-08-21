import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import * as S from 'fp-ts/lib/string'

/**
 * Helper transform a derivationPath from string to an array
 *
 * Example:
 * const a = toDerivationPathArray("44'/330'/0'/0/", "1")
 * console.log(a) // [44,330,0,0,1]
 *
 */
export const toDerivationPathArray = (
  derivationPath: string,
  walletIndex: number
): O.Option<NEA.NonEmptyArray<number>> =>
  FP.pipe(
    derivationPath,
    S.replace(/'/g, ''),
    S.split('/'),
    NEA.fromReadonlyNonEmptyArray,
    NEA.map(parseInt),
    A.append(walletIndex),
    // Validation: Accept numbers only
    NEA.filter((v: unknown) => !Number.isNaN(v)),
    // Validation: length must be 5
    O.chain(O.fromPredicate((v) => v.length === 5))
  )

export const defaultWalletName = (id: number) => `wallet-${id}`
