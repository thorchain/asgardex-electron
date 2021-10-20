import { WalletType } from '../../../shared/wallet/types'
import { Route } from '../types'
import { base as poolsBase } from './base'

export const base: Route<void> = {
  template: `${poolsBase.template}/swap`,
  path() {
    return this.template
  }
}

export type SwapRouteParams = { source: string; walletType: WalletType; target: string }
export const swap: Route<SwapRouteParams> = {
  /**
   * Use '|' 'cause asset symbols have '-' separator
   * `walletType` - wallet type of the source
   */
  template: `${base.template}/:walletType/:source|:target`,
  path: ({ source, target, walletType }) => {
    if (!!source && !!target) {
      return `${base.template}/${walletType}/${source.toLowerCase()}|${target.toLowerCase()}`
    }
    // Redirect to base route if passed params are empty
    return base.path()
  }
}
