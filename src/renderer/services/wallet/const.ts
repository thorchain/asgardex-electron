import { BNBChain } from '@xchainjs/xchain-binance'
import { BTCChain } from '@xchainjs/xchain-bitcoin'
import { BCHChain } from '@xchainjs/xchain-bitcoincash'
import { BSCChain } from '@xchainjs/xchain-bsc'
import { GAIAChain } from '@xchainjs/xchain-cosmos'
import { DOGEChain } from '@xchainjs/xchain-doge'
import { ETHChain } from '@xchainjs/xchain-ethereum'
import { LTCChain } from '@xchainjs/xchain-litecoin'
import { MAYAChain } from '@xchainjs/xchain-mayachain'
import { THORChain } from '@xchainjs/xchain-thorchain'
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
  [BNBChain]: 'all',
  [BCHChain]: 'all',
  [BTCChain]: 'all',
  [GAIAChain]: 'all',
  [DOGEChain]: 'all',
  [ETHChain]: 'all',
  [LTCChain]: 'all',
  [THORChain]: 'all',
  [MAYAChain]: 'all',
  [BSCChain]: 'all'
}

export const INITIAL_LOAD_TXS_PROPS: LoadTxsParams = {
  limit: MAX_ITEMS_PER_PAGE,
  offset: 0
}

export const EMPTY_LOAD_TXS_HANDLER: LoadTxsHandler = (_: LoadTxsParams) => {}

export const INITIAL_LEDGER_ADDRESSES: LedgerAddresses = [] // empty by default

export const MAX_WALLET_NAME_CHARS = 20
