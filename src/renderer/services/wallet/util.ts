import { Keystore } from '@xchainjs/xchain-crypto'
import { Asset, assetToString, baseAmount } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import * as N from 'fp-ts/number'
import * as Ord from 'fp-ts/Ord'
import * as S from 'fp-ts/string'
import { IntlShape } from 'react-intl'

import { KeystoreWallets, KeystoreWallet, IPCLedgerAddressesIO } from '../../../shared/api/io'
import { KeystoreId, LedgerErrorId } from '../../../shared/api/types'
import { WalletAddress, WalletType } from '../../../shared/wallet/types'
import { eqAsset } from '../../helpers/fp/eq'
import { ordBaseAmount } from '../../helpers/fp/ord'
import { sequenceSOption } from '../../helpers/fpHelpers'
import { WalletBalances } from '../clients'
import {
  KeystoreState,
  Phrase,
  BalanceMonoid,
  WalletBalance,
  isKeystoreLocked,
  isKeystoreUnlocked,
  KeystoreLocked,
  LedgerAddress,
  LedgerAddresses
} from './types'

export const getPhrase = (state: KeystoreState): O.Option<Phrase> =>
  FP.pipe(
    state,
    O.chain(O.fromPredicate(isKeystoreUnlocked)),
    O.map(({ phrase }) => phrase)
  )

export const getKeystoreId = (state: KeystoreState): O.Option<KeystoreId> =>
  FP.pipe(
    state,
    O.map(({ id }) => id)
  )

export const getWalletName = (state: KeystoreState): O.Option<string> =>
  FP.pipe(
    state,
    O.map(({ name }) => name)
  )

/**
 * Returns `LockedState` from `KeystoreState`
 */
export const getLockedData = (state: KeystoreState): O.Option<KeystoreLocked> =>
  FP.pipe(sequenceSOption({ id: getKeystoreId(state), name: getWalletName(state) }))

export const getSelectedKeystoreId = (wallets: KeystoreWallets): O.Option<number> =>
  FP.pipe(
    wallets,
    A.filterMap(({ selected, id }) => (selected ? O.some(id) : O.none)),
    A.head
  )

/**
 * Returns initial keystore state by given wallets
 *
 * Initial `Keystore` is always set to `KeystoreLocked`
 */
export const getInitialKeystoreData = (
  wallets: Array<Pick<KeystoreWallet, 'id' | 'name' | 'selected'>>
): O.Option<KeystoreLocked> =>
  FP.pipe(
    wallets,
    // get selected wallet (if available)
    A.filterMap(O.fromPredicate(({ selected }) => selected)),
    A.head,
    // if no selected wallet, use first wallet in list (if available)
    O.alt(() => (wallets.length ? O.some(wallets[0]) : O.none)),
    // get needed data from wallet
    O.map(({ id, name }) => ({ id, name }))
  )

export const getKeystore: (id: KeystoreId) => (wallets: KeystoreWallets) => O.Option<Keystore> = (id) => (wallets) =>
  FP.pipe(
    wallets,
    A.filterMap(({ keystore, id: walletId }) => (walletId === id ? O.some(keystore) : O.none)),
    A.head
  )

export const getKeystoreWalletName: (id: KeystoreId) => (wallets: KeystoreWallets) => O.Option<string> =
  (id) => (wallets) =>
    FP.pipe(
      wallets,
      A.filterMap(({ name, id: walletId }) => (walletId === id ? O.some(name) : O.none)),
      A.head
    )

export const generateKeystoreId = (): KeystoreId =>
  // id for keystore is current time (ms) at the time of importing
  // Note: An user can import one keystore at time only
  // and a keystore with same id can't be overriden. That's no duplications.
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

export const ledgerAddressToWalletAddress = ({ walletIndex, address, chain }: LedgerAddress): WalletAddress => ({
  type: 'ledger',
  walletIndex,
  address,
  chain
})

export const toIPCLedgerAddressesIO = (addresses: LedgerAddresses): IPCLedgerAddressesIO =>
  FP.pipe(
    addresses,
    A.map(({ keystoreId, address, chain, network, walletIndex, ethDerivationMode }) => ({
      keystoreId,
      address,
      chain,
      network,
      walletIndex,
      ethDerivationMode: O.toUndefined(ethDerivationMode)
    }))
  )

export const fromIPCLedgerAddressesIO = (addresses: IPCLedgerAddressesIO): LedgerAddresses =>
  FP.pipe(
    addresses,
    A.map(({ keystoreId, address, chain, network, walletIndex, ethDerivationMode }) => ({
      keystoreId,
      address,
      chain,
      network,
      walletIndex,
      ethDerivationMode: O.fromNullable(ethDerivationMode)
    }))
  )
