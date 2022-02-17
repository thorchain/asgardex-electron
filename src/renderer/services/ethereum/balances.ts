import { Asset } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'

import { Network } from '../../../shared/api/types'
import { WalletType } from '../../../shared/wallet/types'
import { ETHAssetsTestnet } from '../../const'
import { validAssetForETH } from '../../helpers/assetHelper'
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
const balances$: ({
  walletType,
  network,
  walletIndex
}: {
  walletType: WalletType
  network: Network
  walletIndex: number
}) => C.WalletBalancesLD = ({ walletType, walletIndex, network }) => {
  // For testnet we limit requests by using pre-defined assets only
  // because `xchain-ethereum` does for each asset a single request
  const assets: Asset[] | undefined = network === 'testnet' ? ETHAssetsTestnet : undefined
  return FP.pipe(
    C.balances$({ client$, trigger$: reloadBalances$, assets, walletType, walletIndex, walletBalanceType: 'all' }),
    // Filter assets based on ERC20Whitelist (mainnet only)
    liveData.map(FP.flow(A.filter(({ asset }) => validAssetForETH(asset, network))))
  )
}

export { reloadBalances, balances$, reloadBalances$, resetReloadBalances }
