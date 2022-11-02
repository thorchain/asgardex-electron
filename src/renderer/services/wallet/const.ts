import { Chain } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { LoadTxsParams } from '../clients'
import { MAX_ITEMS_PER_PAGE } from '../const'
import { BalancesState, BalancesStateFilter, KeystoreState, LedgerAddresses, LoadTxsHandler } from './types'

/**
 * Initial KeystoreState
 * Note: It needs to be empty (O.none)
 */
export const INITIAL_KEYSTORE_STATE: KeystoreState = O.none

export const INITIAL_BALANCES_STATE: BalancesState = {
  balances: O.none,
  errors: O.none,
  loading: false
}

export const DEFAULT_BALANCES_FILTER: BalancesStateFilter = {
  [Chain.Binance]: 'all',
  [Chain.Bitcoin]: 'all',
  [Chain.BitcoinCash]: 'all',
  [Chain.Ethereum]: 'all',
  [Chain.Cosmos]: 'all',
  [Chain.Avax]: 'all',
  [Chain.Litecoin]: 'all',
  [Chain.THORChain]: 'all',
  [Chain.Doge]: 'all',
  [Chain.Terra]: 'all'
}

export const INITIAL_LOAD_TXS_PROPS: LoadTxsParams = {
  limit: MAX_ITEMS_PER_PAGE,
  offset: 0
}

export const EMPTY_LOAD_TXS_HANDLER: LoadTxsHandler = (_: LoadTxsParams) => {}

export const INITIAL_KEYSTORE_LEDGER_ADDRESSES: LedgerAddresses = [] // empty by default

export const MAX_WALLET_NAME_CHARS = 20
