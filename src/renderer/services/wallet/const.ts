import * as O from 'fp-ts/lib/Option'

import { LoadTxsParams } from '../clients'
import { MAX_ITEMS_PER_PAGE } from '../const'
import { BalancesState, KeystoreState, LoadTxsHandler } from './types'

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
