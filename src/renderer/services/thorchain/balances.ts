import { AssetRuneNative } from '@xchainjs/xchain-util'

import { observableState } from '../../helpers/stateHelper'
import * as C from '../clients'
import { client$ } from './common'

/**
 * `ObservableState` to reload `Balances`
 * Sometimes we need to have a way to understand if it simple "load" or "reload" action
 * e.g. @see src/renderer/services/wallet/balances.ts:getChainBalance$
 */
const { get$: reloadBalances$, set: setReloadBalances } = observableState<boolean>(false)

const resetReloadBalances = () => {
  setReloadBalances(false)
}

const reloadBalances = () => {
  setReloadBalances(true)
}

// State of balances loaded by Client
// Currently in ASGDX `AssetRuneNative` is supported only. Remove asset list if we want to get balances of all assets at THORChain.
const balances$: C.WalletBalancesLD = C.balances$(client$, reloadBalances$, [AssetRuneNative])

export { balances$, reloadBalances, reloadBalances$, resetReloadBalances }
