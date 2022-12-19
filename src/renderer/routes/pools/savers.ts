import { WalletType } from '../../../shared/wallet/types'
import { Route } from '../types'
import { base as poolsBase } from './base'

export const base: Route<void> = {
  template: `${poolsBase.template}/savers`,
  path() {
    return this.template
  }
}

export type SaversRouteParams = { asset: string; walletType: WalletType }

export const earn: Route<SaversRouteParams> = {
  template: `${base.template}/:asset/earn/:walletType`,
  path: ({ asset, walletType }) => `${base.template}/${asset.toLowerCase()}/earn/${walletType}`
}

export const withdraw: Route<SaversRouteParams> = {
  template: `${base.template}/:asset/withdraw/:walletType`,
  path: ({ asset, walletType }) => `${base.template}/${asset.toLowerCase()}/withdraw/${walletType}`
}
