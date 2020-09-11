import * as O from 'fp-ts/lib/Option'

import { AssetsWithBalanceState } from './types'

export const INITIAL_ASSETS_WB_STATE: AssetsWithBalanceState = {
  assetsWB: O.none,
  errors: O.none,
  loading: false
}
