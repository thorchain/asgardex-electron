import { Asset } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'

import { Network } from '../../../shared/api/types'
import { ETHAssetsTestnet } from '../../const'
import { assetInERC20Blacklist, assetInERC20Whitelist, isEthAsset } from '../../helpers/assetHelper'
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
const balances$: ({ walletType, network }: { walletType: WalletType; network: Network }) => C.WalletBalancesLD = ({
  walletType,
  network
}) => {
  // For testnet we limit requests by using pre-defined assets only
  // because `xchain-ethereum` does for each asset a single request
  const assets: Asset[] | undefined = network === 'testnet' ? ETHAssetsTestnet : undefined
  return FP.pipe(
    C.balances$({ client$, trigger$: reloadBalances$, assets, walletType }),
    // Filter out black listed assets
    liveData.map(FP.flow(A.filter(({ asset }) => !assetInERC20Blacklist(asset)))),
    // Filter assets based on following rules:
    // (1) On mainnet only
    // (2) Always accept ETH
    // (3) Filter assets listed in ERC20Whitelist
    liveData.map(
      FP.flow(
        A.filter(
          ({ asset }) =>
            network !== 'mainnet' /* (1) */ || isEthAsset(asset) /* (2) */ || assetInERC20Whitelist(asset) /* (3) */
        )
      )
    )
  )
}

export { reloadBalances, balances$, reloadBalances$, resetReloadBalances }
