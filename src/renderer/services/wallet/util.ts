import { assetToString, AssetTicker } from '@thorchain/asgardex-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import { pipe, identity } from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { isSome, Option } from 'fp-ts/lib/Option'
import * as Ord from 'fp-ts/Ord'

import { ZERO_BN } from '../const'
import {
  KeystoreState,
  KeystoreContent,
  Phrase,
  AssetWithBalance,
  AssetsWithBalance,
  assetWithBalanceMonoid
} from './types'

export const getKeystoreContent = (state: KeystoreState): Option<KeystoreContent> => pipe(state, O.chain(identity))

export const getPhrase = (state: KeystoreState): Option<Phrase> =>
  pipe(
    getKeystoreContent(state),
    O.map(({ phrase }) => phrase)
  )

export const hasKeystoreContent = (state: KeystoreState): boolean => isSome(getKeystoreContent(state))

export const hasImportedKeystore = (state: KeystoreState): boolean => isSome(state)

export const isLocked = (state: KeystoreState): boolean => !hasImportedKeystore(state) || !hasKeystoreContent(state)

export const filterNullableBalances = (balances: AssetsWithBalance) => {
  return FP.pipe(
    balances,
    A.filter((balance) => balance.amount.amount().isGreaterThan(ZERO_BN))
  )
}

const TICKERS_ORDER: string[] = [AssetTicker.BTC, AssetTicker.RUNE, AssetTicker.BNB]

const getBalanceIndex = (balance: AssetWithBalance) =>
  TICKERS_ORDER.findIndex((ticker) => ticker === balance.asset.ticker)

const byTickersOrder = Ord.ord.contramap(Ord.ordNumber, getBalanceIndex)

// We will compare asset strings and they automatically
// be grouped by their chains in alphabetic order
const byAsset = Ord.ord.contramap(Ord.ordString, (balance: AssetWithBalance) => assetToString(balance.asset))

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
      assetWithBalanceMonoid.concat(FP.pipe(left, A.sort(byTickersOrder)), FP.pipe(right, A.sort(byAsset)))
  )
}
