import { Asset } from '@thorchain/asgardex-util'
import { sequenceS } from 'fp-ts/lib/Apply'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

export const unsafeAssetToString = (asset: Asset): string => {
  const { chain, symbol } = asset
  return `${chain}.${symbol}`
}

const sequenseSO = sequenceS(O.option)

export const assetToString = (asset: Asset): O.Option<string> => {
  const { chain, symbol } = asset
  return FP.pipe(
    sequenseSO({ chain: O.fromNullable(chain), symbol: O.fromNullable(symbol) }),
    O.map(({ chain, symbol }) => `${chain}.${symbol}`)
  )
}
