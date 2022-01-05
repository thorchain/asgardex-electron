import * as RD from '@devexperts/remote-data-ts'
import { Chain } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { LoadTxsParams } from '../clients'
import { MAX_ITEMS_PER_PAGE } from '../const'
import { BalancesState, KeystoreState, LedgerAddressesMap, LedgerAddressMap, LoadTxsHandler } from './types'

export const INITIAL_KEYSTORE_STATE: KeystoreState = O.none

export const INITIAL_BALANCES_STATE: BalancesState = {
  balances: O.none,
  errors: O.none,
  loading: false
}

export const INITIAL_LOAD_TXS_PROPS: LoadTxsParams = {
  limit: MAX_ITEMS_PER_PAGE,
  offset: 0
}

export const EMPTY_LOAD_TXS_HANDLER: LoadTxsHandler = (_: LoadTxsParams) => {}

export const INITIAL_LEDGER_ADDRESS_MAP: LedgerAddressMap = {
  mainnet: RD.initial,
  stagenet: RD.initial,
  testnet: RD.initial
}

export const INITIAL_LEDGER_ADDRESSES_MAP: LedgerAddressesMap = {
  [Chain.Binance]: INITIAL_LEDGER_ADDRESS_MAP,
  [Chain.Bitcoin]: INITIAL_LEDGER_ADDRESS_MAP,
  [Chain.BitcoinCash]: INITIAL_LEDGER_ADDRESS_MAP,
  [Chain.Ethereum]: INITIAL_LEDGER_ADDRESS_MAP,
  [Chain.Cosmos]: INITIAL_LEDGER_ADDRESS_MAP,
  [Chain.Polkadot]: INITIAL_LEDGER_ADDRESS_MAP,
  [Chain.Litecoin]: INITIAL_LEDGER_ADDRESS_MAP,
  [Chain.THORChain]: INITIAL_LEDGER_ADDRESS_MAP
}
