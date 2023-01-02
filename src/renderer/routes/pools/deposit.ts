import { WalletType } from '../../../shared/wallet/types'
import { Route } from '../types'
import { base as poolsBase } from './base'

export const base: Route<void> = {
  template: `${poolsBase.template}/deposit`,
  path() {
    return this.template
  }
}
export type DepositRouteParams = { asset: string; assetWalletType: WalletType; runeWalletType: WalletType }
export const deposit: Route<DepositRouteParams> = {
  template: `${base.template}/:asset/:assetWalletType/:runeWalletType`,
  path: ({ asset, assetWalletType, runeWalletType }) => {
    // Don't accept empty string for asset
    if (asset) {
      return `${base.template}/${asset.toLowerCase()}/${assetWalletType}/${runeWalletType}`
    }
    // Redirect to base route if asset param is empty
    return base.path()
  }
}
