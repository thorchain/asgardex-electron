import { WalletType } from '../../../shared/wallet/types'
import { Route } from '../types'
import { base as poolsBase } from './base'

export const base: Route<void> = {
  template: `${poolsBase.template}/swap`,
  path() {
    return this.template
  }
}

export type SwapRouteTargetWalletType = WalletType | 'unknown'
export type SwapRouteParams = {
  source: string
  target: string
  sourceWalletType: WalletType
  targetWalletType: SwapRouteTargetWalletType
}

export const swap: Route<SwapRouteParams> = {
  /**
   * Use '|' 'cause asset symbols have '-' separator
   * `walletType` - wallet type of the source
   */
  template: `${base.template}/:source|:sourceWalletType|:target|:targetWalletType`,
  path: ({ source, target, sourceWalletType, targetWalletType }) => {
    if (!!source && !!target) {
      return `${base.template}/${source.toLowerCase()}|${sourceWalletType}|${target.toLowerCase()}|${targetWalletType}`
    }
    // Redirect to base route if passed params are empty
    return base.path()
  }
}

export type SwapToCustomRouteParams = SwapRouteParams & {
  targetWalletAddress: string
}
export const swapToCustom: Route<SwapToCustomRouteParams> = {
  template: `${swap.template}/:targetWalletAddress`,
  path: ({ source, target, sourceWalletType, targetWalletType, targetWalletAddress }) => {
    if (!!source && !!target) {
      return `${swap.path({ source, target, sourceWalletType, targetWalletType })}/${targetWalletAddress}`
    }
    // Redirect to base route if passed params are empty
    return base.path()
  }
}
