import * as O from 'fp-ts/lib/Option'

import { MAX_ITEMS_PER_PAGE } from '../const'
import { AssetsWithBalanceState, LoadAssetTxsProps } from './types'

export const INITIAL_ASSETS_WB_STATE: AssetsWithBalanceState = {
  assetsWB: O.none,
  errors: O.none,
  loading: false
}

export const INITIAL_LOAD_TXS_PROPS: LoadAssetTxsProps = {
  limit: MAX_ITEMS_PER_PAGE,
  offset: 0
}
