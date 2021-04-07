import { observableState } from '../../helpers/stateHelper'
import * as C from '../clients'
import { ReloadType } from '../types'
import { client$ } from './common'

/**
 * `ObservableState` to reload `Balances`
 * Sometimes we need to have a way to understand if it simple "load" or "reload" action
 * e.g. @see src/renderer/services/wallet/balances.ts:getChainBalance$
 */
const { get$: reloadBalances$, set: setReloadBalances } = observableState<ReloadType>('load')

const resetReload = () => {
  setReloadBalances('load')
}

const reloadBalances = () => {
  setReloadBalances('reload')
}

// State of balances loaded by Client
const balances$: C.WalletBalancesLD = C.balances$(client$, reloadBalances$)

// State of balances loaded by Client and Address
const getBalanceByAddress$ = C.balancesByAddress$(client$, reloadBalances$)

export { balances$, reloadBalances, getBalanceByAddress$, reloadBalances$, resetReload }
