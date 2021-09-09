import { Asset } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'

import { assetInERC20Blacklist } from '../../helpers/assetHelper'
import { liveData } from '../../helpers/rx/liveData'
import { observableState } from '../../helpers/stateHelper'
import * as C from '../clients'
import { WalletType } from '../wallet/types'
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
const balances$: (walletType: WalletType, assets?: Asset[]) => C.WalletBalancesLD = (walletType, assets?: Asset[]) =>
  FP.pipe(
    C.balances$({ client$, trigger$: reloadBalances$, assets, walletType }),
    // Filter out black listed assets
    liveData.map(FP.flow(A.filter(({ asset }) => !assetInERC20Blacklist(asset))))
  )

export { reloadBalances, balances$, reloadBalances$, resetReloadBalances }
