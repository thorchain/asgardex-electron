import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'

import { Network } from '../../../shared/api/types'
import { assetInBinanceBlacklist } from '../../helpers/assetHelper'
import { liveData } from '../../helpers/rx/liveData'
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
const balances$: (network: Network) => C.WalletBalancesLD = (network) =>
  FP.pipe(
    C.balances$(client$, reloadBalances$),
    // Filter out black listed assets
    liveData.map(FP.flow(A.filter(({ asset }) => !assetInBinanceBlacklist(network, asset))))
  )

const getBalanceByAddress$ = C.balancesByAddress$(client$, reloadBalances$)

export { balances$, reloadBalances, reloadBalances$, resetReloadBalances, getBalanceByAddress$ }
