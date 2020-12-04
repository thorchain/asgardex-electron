import { Asset, assetToString, baseAmount } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import { pipe, identity } from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { isSome, Option } from 'fp-ts/lib/Option'
import * as Ord from 'fp-ts/Ord'

import { eqAsset } from '../../helpers/fp/eq'
import { ordBaseAmount } from '../../helpers/fp/ord'
import { WalletBalance } from '../../types/wallet'
import { KeystoreState, KeystoreContent, Phrase, BalanceMonoid } from './types'

export const getKeystoreContent = (state: KeystoreState): Option<KeystoreContent> => pipe(state, O.chain(identity))

export const getPhrase = (state: KeystoreState): Option<Phrase> =>
  pipe(
    getKeystoreContent(state),
    O.map(({ phrase }) => phrase)
  )

export const hasKeystoreContent = (state: KeystoreState): boolean => isSome(getKeystoreContent(state))

export const hasImportedKeystore = (state: KeystoreState): boolean => isSome(state)

export const isLocked = (state: KeystoreState): boolean => !hasImportedKeystore(state) || !hasKeystoreContent(state)

export const filterNullableBalances = (balances: WalletBalance[]) => {
  return FP.pipe(
    balances,
    A.filter(({ amount }) => Ord.gt(ordBaseAmount)(amount, baseAmount(0)))
  )
}

// We will compare asset strings and they automatically
// be grouped by their chains in alphabetic order
const byAsset = Ord.ord.contramap(Ord.ordString, (balance: WalletBalance) => assetToString(balance.asset))

export const sortBalances = (balances: WalletBalance[], orders: string[]) => {
  const getBalanceIndex = (balance: WalletBalance) => orders.findIndex((ticker) => ticker === balance.asset.ticker)
  const byTickersOrder = Ord.ord.contramap(Ord.ordNumber, getBalanceIndex)
  return FP.pipe(
    balances,
    // split array for 2 parts: sortable assets and the rest
    A.reduce([[], []] as [WalletBalance[], WalletBalance[]], (acc, cur) => {
      if (orders.includes(cur.asset.ticker)) {
        acc[0].push(cur)
      } else {
        acc[1].push(cur)
      }
      return acc
    }),
    ([left, right]) => BalanceMonoid.concat(FP.pipe(left, A.sort(byTickersOrder)), FP.pipe(right, A.sort(byAsset)))
  )
}

export const getBalanceByAsset = (asset: Asset) => (balances: WalletBalance[]) =>
  FP.pipe(
    balances,
    A.findFirst((assetWithBalance) => eqAsset.equals(assetWithBalance.asset, asset))
  )
