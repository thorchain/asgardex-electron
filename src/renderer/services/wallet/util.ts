import { Keystore } from '@xchainjs/xchain-crypto'
import { Asset, assetToString, baseAmount } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import * as N from 'fp-ts/number'
import * as Ord from 'fp-ts/Ord'
import * as S from 'fp-ts/string'
import { IntlShape } from 'react-intl'

import { KeystoreAccounts } from '../../../shared/api/io'
import { KeystoreId, LedgerErrorId } from '../../../shared/api/types'
import { WalletType } from '../../../shared/wallet/types'
import { eqAsset } from '../../helpers/fp/eq'
import { ordBaseAmount } from '../../helpers/fp/ord'
import { WalletBalances } from '../clients'
import { KeystoreState, Phrase, BalanceMonoid, WalletBalance, isKeystoreLocked, isKeystoreUnlocked } from './types'

export const getPhrase = (state: KeystoreState): O.Option<Phrase> =>
  FP.pipe(
    state,
    O.chain(O.fromPredicate(isKeystoreUnlocked)),
    O.map(({ phrase }) => phrase)
  )

export const getKeystoreId = (state: KeystoreState): O.Option<number> =>
  FP.pipe(
    state,
    O.map(({ id }) => id)
  )

export const getSelectedKeystoreId = (accounts: KeystoreAccounts): O.Option<number> =>
  FP.pipe(
    accounts,
    A.filterMap(({ selected, id }) => (selected ? O.some(id) : O.none)),
    A.head
  )

export const getKeystore: (id: KeystoreId) => (accounts: KeystoreAccounts) => O.Option<Keystore> = (id) => (accounts) =>
  FP.pipe(
    accounts,
    A.filterMap(({ keystore, id: accountId }) => (accountId === id ? O.some(keystore) : O.none)),
    A.head
  )

export const getKeystoreAccountName: (id: KeystoreId) => (accounts: KeystoreAccounts) => O.Option<string> =
  (id) => (accounts) =>
    FP.pipe(
      accounts,
      A.filterMap(({ name, id: accountId }) => (accountId === id ? O.some(name) : O.none)),
      A.head
    )

export const generateKeystoreId = (): KeystoreId =>
  // id for keystore is current time (ms)
  // Note: Since an user can add one keystore at time only
  // and a keystore with same name can't be overriden,
  // duplications are not possible
  new Date().getTime()

export const hasImportedKeystore = (state: KeystoreState): boolean => O.isSome(state)

export const isLocked = (state: KeystoreState) =>
  FP.pipe(
    state,
    // locked
    O.map((s) => (isKeystoreLocked(s) ? true : false)),
    // not imported === locked
    O.getOrElse(() => true)
  )

export const isUnlocked = (state: KeystoreState): boolean =>
  FP.pipe(state, O.chain(O.fromPredicate(isKeystoreUnlocked)), O.isSome)

// const url: O.Option<string> = FP.pipe(txUrl, O.fromPredicate(P.not(S.isEmpty)))

export const filterNullableBalances = (balances: WalletBalances): WalletBalances => {
  return FP.pipe(
    balances,
    A.filter(({ amount }) => Ord.gt(ordBaseAmount)(amount, baseAmount(0)))
  )
}

// We will compare asset strings and they automatically
// be grouped by their chains in alphabetic order
const byAsset = Ord.Contravariant.contramap(S.Ord, (balance: WalletBalance) => assetToString(balance.asset))

export const sortBalances = (balances: WalletBalances, orders: string[]) => {
  const getBalanceIndex = (balance: WalletBalance) => orders.findIndex((ticker) => ticker === balance.asset.ticker)
  const byTickersOrder = Ord.Contravariant.contramap(N.Ord, getBalanceIndex)
  return FP.pipe(
    balances,
    // split array for 2 parts: sortable assets and the rest
    A.reduce([[], []] as [WalletBalances, WalletBalances], (acc, cur) => {
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

// TODO (asgdx-team)
// `getBalanceByAsset` is very similar to `getWalletBalanceByAsset` in `walletHelper`
// Move it to `walletHelper`
export const getBalanceByAsset =
  (asset: Asset) =>
  (balances: WalletBalances): O.Option<WalletBalance> =>
    FP.pipe(
      balances,
      A.findFirst((assetWithBalance) => eqAsset.equals(assetWithBalance.asset, asset))
    )

export const walletTypeToI18n = (type: WalletType, intl: IntlShape) => {
  switch (type) {
    case 'ledger':
      return intl.formatMessage({ id: 'ledger.title' })
    case 'keystore':
      return intl.formatMessage({ id: 'common.keystore' })
    default:
      return `Unknown ${type}`
  }
}

export const ledgerErrorIdToI18n = (errorId: LedgerErrorId, intl: IntlShape) => {
  switch (errorId) {
    case LedgerErrorId.NO_DEVICE:
      return intl.formatMessage({ id: 'ledger.error.nodevice' })
    case LedgerErrorId.ALREADY_IN_USE:
      return intl.formatMessage({ id: 'ledger.error.inuse' })
    case LedgerErrorId.APP_NOT_OPENED:
      return intl.formatMessage({ id: 'ledger.error.appnotopened' })
    case LedgerErrorId.NO_APP:
      return intl.formatMessage({ id: 'ledger.error.noapp' })
    case LedgerErrorId.GET_ADDRESS_FAILED:
      return intl.formatMessage({ id: 'ledger.error.getaddressfailed' })
    case LedgerErrorId.SIGN_FAILED:
      return intl.formatMessage({ id: 'ledger.error.signfailed' })
    case LedgerErrorId.SEND_TX_FAILED:
      return intl.formatMessage({ id: 'ledger.error.sendfailed' })
    case LedgerErrorId.DEPOSIT_TX_FAILED:
      return intl.formatMessage({ id: 'ledger.error.deposit' })
    case LedgerErrorId.DENIED:
      return intl.formatMessage({ id: 'ledger.error.denied' })
    case LedgerErrorId.INVALID_PUBKEY:
      return intl.formatMessage({ id: 'ledger.error.invalidpubkey' })
    case LedgerErrorId.INVALID_DATA:
      return intl.formatMessage({ id: 'ledger.error.invaliddata' })
    case LedgerErrorId.REJECTED:
      return intl.formatMessage({ id: 'ledger.error.rejected' })
    case LedgerErrorId.TIMEOUT:
      return intl.formatMessage({ id: 'ledger.error.timeout' })
    case LedgerErrorId.INVALID_RESPONSE:
      return intl.formatMessage({ id: 'ledger.error.invalidresponse' })
    case LedgerErrorId.NOT_IMPLEMENTED:
      return intl.formatMessage({ id: 'ledger.error.notimplemented' })
    // default is similar to LedgerErrorId.UNKNOWN
    default:
      return intl.formatMessage({ id: 'ledger.error.unknown' })
  }
}
