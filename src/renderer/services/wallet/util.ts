import { getMonoid } from 'fp-ts/Array'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import { pipe, identity } from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { isSome, Option } from 'fp-ts/lib/Option'
import { Ord } from 'fp-ts/Ord'

import { KeystoreState, KeystoreContent, Phrase, AssetWithBalance, AssetsWithBalance } from './types'

export const getKeystoreContent = (state: KeystoreState): Option<KeystoreContent> => pipe(state, O.chain(identity))

export const getPhrase = (state: KeystoreState): Option<Phrase> =>
  pipe(
    getKeystoreContent(state),
    O.map(({ phrase }) => phrase)
  )

export const hasKeystoreContent = (state: KeystoreState): boolean => isSome(getKeystoreContent(state))

export const hasImportedKeystore = (state: KeystoreState): boolean => isSome(state)

export const isLocked = (state: KeystoreState): boolean => !hasImportedKeystore(state) || !hasKeystoreContent(state)

export const assetWithBalanceMonoid = getMonoid<AssetWithBalance>()

export const filterNullableBalances = (balances: AssetsWithBalance) => {
  return FP.pipe(
    balances,
    A.filter((balance) => balance.amount.amount().isPositive())
  )
}

const TICKERS_ORDER = ['BTC', 'RUNE', 'BNB']

const getBalanceIndex = (balance: AssetWithBalance) =>
  TICKERS_ORDER.findIndex((ticker) => ticker === balance.asset.ticker)

const assetWithBalanceByTickersOrd: Ord<AssetWithBalance> = {
  compare: (a, b) => (getBalanceIndex(a) > getBalanceIndex(b) ? 1 : -1),
  equals: (a, b) => getBalanceIndex(a) === getBalanceIndex(b)
}

const assetWithBalanceOrd: Ord<AssetWithBalance> = {
  compare: (a, b) => (a.asset.ticker > b.asset.ticker ? 1 : -1),
  equals: (a, b) => a.asset.ticker === b.asset.ticker
}

export const sortBalances = (balances: AssetsWithBalance) => {
  return FP.pipe(
    balances,
    // split array for 2 parts: sortable assets and the rest
    A.reduce([[], []] as [AssetsWithBalance, AssetsWithBalance], (acc, cur) => {
      if (TICKERS_ORDER.includes(cur.asset.ticker)) {
        acc[0].push(cur)
      } else {
        acc[1].push(cur)
      }
      return acc
    }),
    ([left, right]) =>
      assetWithBalanceMonoid.concat(
        FP.pipe(left, A.sort(assetWithBalanceByTickersOrd)),
        FP.pipe(right, A.sort(assetWithBalanceOrd))
      )
  )
}
