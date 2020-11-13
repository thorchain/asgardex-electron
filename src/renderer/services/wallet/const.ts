import * as O from 'fp-ts/lib/Option'

import { MAX_ITEMS_PER_PAGE } from '../const'
import { AssetsWithBalanceState, KeystoreState, LoadTxsHandler, LoadTxsProps } from './types'

export const INITIAL_KEYSTORE_STATE: KeystoreState = O.none

export const INITIAL_ASSETS_WB_STATE: AssetsWithBalanceState = {
  assetsWB: O.none,
  errors: O.none,
  loading: false
}

export const INITIAL_LOAD_TXS_PROPS: LoadTxsProps = {
  limit: MAX_ITEMS_PER_PAGE,
  offset: 0
}

export const EMPTY_TX_HANDLER: LoadTxsHandler = (_: LoadTxsProps) => {}
