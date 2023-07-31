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
   * Use '|' 'cause asset symbols have '-' separator and / for synths.
   * `walletType` - wallet type of the source
   * check to see if asset string from source or target matches a synth, if true replace with a more route friendly string
   */
  template: `${base.template}/:source/:sourceWalletType/:target/:targetWalletType/:recipient?`,
  path: ({ source, target, sourceWalletType, targetWalletType, recipient }) => {
    if (!!source && !!target) {
      // Convert source and target to lowercase
      source = source.toLowerCase()
      target = target.toLowerCase()
      const sourceString = source.match('/') ? source.replace('/', '_synth_') : source
      const targetString = target.match('/') ? target.replace('/', '_synth_') : target
      // Handle sources without a slash (non-synthetic assets)
      const basePath = `${base.template}/${sourceString}/${sourceWalletType}/${targetString}/${targetWalletType}`
      return recipient ? `${basePath}/${recipient}` : basePath
    }
    // Redirect to base route if passed params are empty
    return base.path()
  }
}
