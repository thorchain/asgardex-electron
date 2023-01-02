import { WalletType } from '../../../shared/wallet/types'
import { Route } from '../types'
import { base as poolsBase } from './base'

export const base: Route<void> = {
  template: `${poolsBase.template}/swap`,
  path() {
    return this.template
  }
}

export type SwapRouteTargetWalletType = WalletType | 'custom'
export type SwapRouteParams = {
  source: string
  target: string
  sourceWalletType: WalletType
  targetWalletType: SwapRouteTargetWalletType
  recipient?: string // Recipient address
}

export const swap: Route<SwapRouteParams> = {
  /**
   * Use '|' 'cause asset symbols have '-' separator
   * `walletType` - wallet type of the source
   */
  template: `${base.template}/:source/:sourceWalletType/:target/:targetWalletType/:recipient?`,
  path: ({ source, target, sourceWalletType, targetWalletType, recipient }) => {
    if (!!source && !!target) {
      const basePath = `${
        base.template
      }/${source.toLowerCase()}/${sourceWalletType}/${target.toLowerCase()}/${targetWalletType}`

      return recipient ? `${basePath}/${recipient}` : basePath
    }
    // Redirect to base route if passed params are empty
    return base.path()
  }
}
