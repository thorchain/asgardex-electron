import { Asset } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

export const unsafeAssetToString = (asset: Asset): string => {
  const { chain, symbol } = asset
  return `${chain}.${symbol}`
}

export const assetToString = (asset: Asset): O.Option<string> => {
  const { chain, symbol } = asset
  return FP.pipe(
    O.some((c: string) => (s: string) => `${c}.${s}`),
    O.ap(O.fromNullable(chain)),
    O.ap(O.fromNullable(symbol))
  )
}
